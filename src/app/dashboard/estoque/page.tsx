"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  Plus,
  X,
  Loader2,
  Package,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  unidade: string;
  precoCompra: number;
  precoVenda: number;
  estoqueAtual: number;
  estoqueMinimo: number;
}

interface ProdutoForm {
  nome: string;
  descricao: string;
  unidade: string;
  precoCompra: string;
  precoVenda: string;
  estoqueAtual: string;
  estoqueMinimo: string;
}

interface MovimentacaoForm {
  tipo: "entrada" | "saida" | "ajuste";
  quantidade: string;
  observacao: string;
}

const UNIDADES = [
  { value: "un", label: "Unidade (un)" },
  { value: "L", label: "Litro (L)" },
  { value: "kg", label: "Quilograma (kg)" },
  { value: "ml", label: "Mililitro (ml)" },
];

const emptyProdutoForm: ProdutoForm = {
  nome: "",
  descricao: "",
  unidade: "un",
  precoCompra: "",
  precoVenda: "",
  estoqueAtual: "",
  estoqueMinimo: "",
};

const emptyMovimentacaoForm: MovimentacaoForm = {
  tipo: "entrada",
  quantidade: "",
  observacao: "",
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function EstoquePage() {
  const { data: session } = useSession();

  // Data state
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [alertas, setAlertas] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Product modal state
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [produtoForm, setProdutoForm] = useState<ProdutoForm>(emptyProdutoForm);
  const [savingProduto, setSavingProduto] = useState(false);

  // Movement modal state
  const [showMovimentacaoModal, setShowMovimentacaoModal] = useState(false);
  const [movimentacaoProduto, setMovimentacaoProduto] = useState<Produto | null>(null);
  const [movimentacaoForm, setMovimentacaoForm] = useState<MovimentacaoForm>(emptyMovimentacaoForm);
  const [savingMovimentacao, setSavingMovimentacao] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ---------- Fetch products ----------

  const fetchProdutos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const res = await fetch(`/api/estoque?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao buscar produtos");

      const data = await res.json();
      setProdutos(data.produtos);
      setAlertas(data.alertas);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  // ---------- Computed values ----------

  const totalProdutos = produtos.length;
  const totalValorEstoque = produtos.reduce(
    (acc, p) => acc + p.precoVenda * p.estoqueAtual,
    0
  );

  // ---------- Product CRUD ----------

  function openCreateModal() {
    setEditingProduto(null);
    setProdutoForm(emptyProdutoForm);
    setShowProdutoModal(true);
  }

  function openEditModal(produto: Produto) {
    setEditingProduto(produto);
    setProdutoForm({
      nome: produto.nome,
      descricao: produto.descricao,
      unidade: produto.unidade,
      precoCompra: String(produto.precoCompra),
      precoVenda: String(produto.precoVenda),
      estoqueAtual: String(produto.estoqueAtual),
      estoqueMinimo: String(produto.estoqueMinimo),
    });
    setShowProdutoModal(true);
  }

  function closeProdutoModal() {
    setShowProdutoModal(false);
    setEditingProduto(null);
    setProdutoForm(emptyProdutoForm);
  }

  async function handleSaveProduto(e: React.FormEvent) {
    e.preventDefault();
    setSavingProduto(true);

    try {
      const payload: Record<string, unknown> = {
        nome: produtoForm.nome,
        descricao: produtoForm.descricao,
        unidade: produtoForm.unidade,
        precoCompra: parseFloat(produtoForm.precoCompra),
        precoVenda: parseFloat(produtoForm.precoVenda),
        estoqueMinimo: parseInt(produtoForm.estoqueMinimo, 10),
      };

      if (!editingProduto) {
        payload.estoqueAtual = parseInt(produtoForm.estoqueAtual, 10);
      }

      const url = editingProduto
        ? `/api/estoque/${editingProduto.id}`
        : "/api/estoque";

      const method = editingProduto ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar produto");

      closeProdutoModal();
      fetchProdutos();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProduto(false);
    }
  }

  async function handleDeleteProduto(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/estoque/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir produto");
      fetchProdutos();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  // ---------- Stock movement ----------

  function openMovimentacaoModal(produto: Produto) {
    setMovimentacaoProduto(produto);
    setMovimentacaoForm(emptyMovimentacaoForm);
    setShowMovimentacaoModal(true);
  }

  function closeMovimentacaoModal() {
    setShowMovimentacaoModal(false);
    setMovimentacaoProduto(null);
    setMovimentacaoForm(emptyMovimentacaoForm);
  }

  async function handleSaveMovimentacao(e: React.FormEvent) {
    e.preventDefault();
    if (!movimentacaoProduto) return;

    setSavingMovimentacao(true);
    try {
      const res = await fetch("/api/estoque/movimentacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produtoId: movimentacaoProduto.id,
          tipo: movimentacaoForm.tipo,
          quantidade: parseInt(movimentacaoForm.quantidade, 10),
          observacao: movimentacaoForm.observacao,
        }),
      });

      if (!res.ok) throw new Error("Erro ao registrar movimentacao");

      closeMovimentacaoModal();
      fetchProdutos();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingMovimentacao(false);
    }
  }

  // ---------- Render helpers ----------

  function isEstoqueBaixo(produto: Produto) {
    return produto.estoqueAtual <= produto.estoqueMinimo;
  }

  // ---------- JSX ----------

  return (
    <div className="space-y-6">
      {/* ---- Page header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Controle de Estoque</h1>
          <p className="text-dark-400 mt-1">
            Gerencie seus produtos e movimentacoes de estoque
          </p>
        </div>
      </div>

      {/* ---- Alert banner ---- */}
      {alertas > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
          <span className="text-sm text-red-300">
            <strong>{alertas}</strong> produto{alertas > 1 ? "s" : ""} abaixo do
            estoque minimo. Verifique os itens destacados na tabela.
          </span>
        </div>
      )}

      {/* ---- Summary cards ---- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total produtos */}
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-400/10">
            <Package className="h-6 w-6 text-brand-400" />
          </div>
          <div>
            <p className="text-sm text-dark-400">Total de Produtos</p>
            <p className="text-xl font-semibold text-white">{totalProdutos}</p>
          </div>
        </div>

        {/* Total valor */}
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-400/10">
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-sm text-dark-400">Valor em Estoque</p>
            <p className="text-xl font-semibold text-white">
              {formatCurrency(totalValorEstoque)}
            </p>
          </div>
        </div>

        {/* Alertas */}
        <div className="card flex items-center gap-4 p-5">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${
              alertas > 0 ? "bg-red-400/10" : "bg-green-400/10"
            }`}
          >
            <AlertTriangle
              className={`h-6 w-6 ${
                alertas > 0 ? "text-red-400" : "text-green-400"
              }`}
            />
          </div>
          <div>
            <p className="text-sm text-dark-400">Alertas de Estoque</p>
            <p className="text-xl font-semibold text-white">{alertas}</p>
          </div>
        </div>
      </div>

      {/* ---- Search bar + Novo Produto ---- */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Buscar produto por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-full pl-10"
          />
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Produto
        </button>
      </div>

      {/* ---- Products table ---- */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dark-700 bg-dark-900">
                <th className="px-4 py-3 font-medium text-dark-400">Nome</th>
                <th className="px-4 py-3 font-medium text-dark-400">Unidade</th>
                <th className="px-4 py-3 font-medium text-dark-400 text-right">
                  Preco Compra
                </th>
                <th className="px-4 py-3 font-medium text-dark-400 text-right">
                  Preco Venda
                </th>
                <th className="px-4 py-3 font-medium text-dark-400 text-right">
                  Estoque Atual
                </th>
                <th className="px-4 py-3 font-medium text-dark-400 text-right">
                  Estoque Minimo
                </th>
                <th className="px-4 py-3 font-medium text-dark-400 text-center">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-400" />
                    <p className="mt-2 text-sm text-dark-400">
                      Carregando produtos...
                    </p>
                  </td>
                </tr>
              ) : produtos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Package className="mx-auto h-10 w-10 text-dark-400" />
                    <p className="mt-2 text-sm text-dark-400">
                      Nenhum produto encontrado.
                    </p>
                  </td>
                </tr>
              ) : (
                produtos.map((produto) => {
                  const baixo = isEstoqueBaixo(produto);
                  return (
                    <tr
                      key={produto.id}
                      className={`border-b border-dark-700 transition-colors ${
                        baixo
                          ? "bg-red-500/5 hover:bg-red-500/10"
                          : "bg-dark-800 hover:bg-dark-800/60"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        <div className="flex items-center gap-2">
                          {produto.nome}
                          {baixo && (
                            <span className="badge bg-red-500/20 text-red-400 text-xs">
                              Baixo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-dark-400">{produto.unidade}</td>
                      <td className="px-4 py-3 text-right text-dark-400">
                        {formatCurrency(produto.precoCompra)}
                      </td>
                      <td className="px-4 py-3 text-right text-dark-400">
                        {formatCurrency(produto.precoVenda)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-semibold ${
                          baixo ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {produto.estoqueAtual}
                      </td>
                      <td className="px-4 py-3 text-right text-dark-400">
                        {produto.estoqueMinimo}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openMovimentacaoModal(produto)}
                            title="Movimentacao de estoque"
                            className="btn-ghost p-2 text-brand-400 hover:text-brand-400/80"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(produto)}
                            title="Editar produto"
                            className="btn-ghost p-2 text-dark-400 hover:text-white"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduto(produto.id)}
                            disabled={deletingId === produto.id}
                            title="Excluir produto"
                            className="btn-ghost p-2 text-dark-400 hover:text-red-400"
                          >
                            {deletingId === produto.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Product Create / Edit Modal                                        */}
      {/* ================================================================== */}
      {showProdutoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="card w-full max-w-lg bg-dark-800 p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editingProduto ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button
                onClick={closeProdutoModal}
                className="btn-ghost p-1 text-dark-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduto} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-400">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={produtoForm.nome}
                  onChange={(e) =>
                    setProdutoForm({ ...produtoForm, nome: e.target.value })
                  }
                  className="input-field w-full"
                  placeholder="Nome do produto"
                />
              </div>

              {/* Descricao */}
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-400">
                  Descricao
                </label>
                <textarea
                  value={produtoForm.descricao}
                  onChange={(e) =>
                    setProdutoForm({ ...produtoForm, descricao: e.target.value })
                  }
                  className="input-field w-full resize-none"
                  rows={2}
                  placeholder="Descricao do produto (opcional)"
                />
              </div>

              {/* Unidade */}
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-400">
                  Unidade
                </label>
                <select
                  value={produtoForm.unidade}
                  onChange={(e) =>
                    setProdutoForm({ ...produtoForm, unidade: e.target.value })
                  }
                  className="input-field w-full"
                >
                  {UNIDADES.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preco Compra / Venda */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-dark-400">
                    Preco de Compra
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={produtoForm.precoCompra}
                    onChange={(e) =>
                      setProdutoForm({
                        ...produtoForm,
                        precoCompra: e.target.value,
                      })
                    }
                    className="input-field w-full"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-dark-400">
                    Preco de Venda
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={produtoForm.precoVenda}
                    onChange={(e) =>
                      setProdutoForm({
                        ...produtoForm,
                        precoVenda: e.target.value,
                      })
                    }
                    className="input-field w-full"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Estoque Atual (only on create) / Estoque Minimo */}
              <div className="grid grid-cols-2 gap-4">
                {!editingProduto && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-dark-400">
                      Estoque Atual
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={produtoForm.estoqueAtual}
                      onChange={(e) =>
                        setProdutoForm({
                          ...produtoForm,
                          estoqueAtual: e.target.value,
                        })
                      }
                      className="input-field w-full"
                      placeholder="0"
                    />
                  </div>
                )}
                <div className={editingProduto ? "col-span-2" : ""}>
                  <label className="mb-1 block text-sm font-medium text-dark-400">
                    Estoque Minimo
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={produtoForm.estoqueMinimo}
                    onChange={(e) =>
                      setProdutoForm({
                        ...produtoForm,
                        estoqueMinimo: e.target.value,
                      })
                    }
                    className="input-field w-full"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeProdutoModal}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProduto}
                  className="btn-primary flex items-center gap-2"
                >
                  {savingProduto && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingProduto ? "Salvar Alteracoes" : "Criar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* Stock Movement Modal                                               */}
      {/* ================================================================== */}
      {showMovimentacaoModal && movimentacaoProduto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="card w-full max-w-md bg-dark-800 p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Movimentacao de Estoque
              </h2>
              <button
                onClick={closeMovimentacaoModal}
                className="btn-ghost p-1 text-dark-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Product info */}
            <div className="mb-5 rounded-lg border border-dark-700 bg-dark-900 p-3">
              <p className="text-sm text-dark-400">Produto</p>
              <p className="font-medium text-white">{movimentacaoProduto.nome}</p>
              <p className="mt-1 text-sm text-dark-400">
                Estoque atual:{" "}
                <span
                  className={`font-semibold ${
                    isEstoqueBaixo(movimentacaoProduto)
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {movimentacaoProduto.estoqueAtual} {movimentacaoProduto.unidade}
                </span>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveMovimentacao} className="space-y-4">
              {/* Tipo */}
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-400">
                  Tipo de Movimentacao
                </label>
                <select
                  value={movimentacaoForm.tipo}
                  onChange={(e) =>
                    setMovimentacaoForm({
                      ...movimentacaoForm,
                      tipo: e.target.value as MovimentacaoForm["tipo"],
                    })
                  }
                  className="input-field w-full"
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saida</option>
                  <option value="ajuste">Ajuste</option>
                </select>
              </div>

              {/* Tipo visual indicator */}
              <div className="flex items-center gap-2 text-sm">
                {movimentacaoForm.tipo === "entrada" && (
                  <>
                    <ArrowUpCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">
                      Adicionar ao estoque
                    </span>
                  </>
                )}
                {movimentacaoForm.tipo === "saida" && (
                  <>
                    <ArrowDownCircle className="h-4 w-4 text-red-400" />
                    <span className="text-red-400">
                      Remover do estoque
                    </span>
                  </>
                )}
                {movimentacaoForm.tipo === "ajuste" && (
                  <>
                    <RefreshCw className="h-4 w-4 text-brand-400" />
                    <span className="text-brand-400">
                      Ajustar estoque manualmente
                    </span>
                  </>
                )}
              </div>

              {/* Quantidade */}
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-400">
                  Quantidade
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={movimentacaoForm.quantidade}
                  onChange={(e) =>
                    setMovimentacaoForm({
                      ...movimentacaoForm,
                      quantidade: e.target.value,
                    })
                  }
                  className="input-field w-full"
                  placeholder="0"
                />
              </div>

              {/* Observacao */}
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-400">
                  Observacao
                </label>
                <textarea
                  value={movimentacaoForm.observacao}
                  onChange={(e) =>
                    setMovimentacaoForm({
                      ...movimentacaoForm,
                      observacao: e.target.value,
                    })
                  }
                  className="input-field w-full resize-none"
                  rows={3}
                  placeholder="Motivo ou observacao (opcional)"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeMovimentacaoModal}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingMovimentacao}
                  className="btn-primary flex items-center gap-2"
                >
                  {savingMovimentacao && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Registrar Movimentacao
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
