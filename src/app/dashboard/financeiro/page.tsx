"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Check,
  FileDown,
} from "lucide-react";
import { generateRelatorioPdf } from "@/lib/pdf-relatorio";
import { formatCurrency, formatDate, statusColors } from "@/lib/utils";

interface Lancamento {
  id: string;
  tipo: "receita" | "despesa";
  categoria: string;
  descricao: string;
  valor: number;
  vencimento: string;
  pagamento?: string;
  status: string;
  observacoes?: string;
  ordemServicoId?: string;
}

const emptyLancamento: Omit<Lancamento, "id"> = {
  tipo: "receita",
  categoria: "",
  descricao: "",
  valor: 0,
  vencimento: new Date().toISOString().split("T")[0],
  pagamento: "",
  status: "pendente",
  observacoes: "",
};

const categorias = {
  receita: [
    "Servico Avulso",
    "Contrato Recorrente",
    "Produto",
    "Outros",
  ],
  despesa: [
    "Material",
    "Combustivel",
    "Manutencao",
    "Salarios",
    "Comissoes",
    "Aluguel",
    "Impostos",
    "Marketing",
    "Outros",
  ],
};

export default function FinanceiroPage() {
  const { data: session } = useSession();
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Lancamento | null>(null);
  const [form, setForm] = useState(emptyLancamento);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [summary, setSummary] = useState({
    receitas: 0,
    despesas: 0,
    lucro: 0,
    aReceber: 0,
    aPagar: 0,
    atrasados: 0,
  });

  const showAlertMsg = (type: "success" | "error", msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        search,
        tipo: tipoFilter,
        status: statusFilter,
      });
      const res = await fetch(`/api/financeiro?${params}`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setLancamentos(json.data || json.lancamentos || []);
        setTotalPages(json.totalPages || 1);
        if (json.summary) {
          setSummary(json.summary);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, tipoFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyLancamento);
    setShowModal(true);
  };

  const openEdit = (lanc: Lancamento) => {
    setEditing(lanc);
    setForm({
      tipo: lanc.tipo,
      categoria: lanc.categoria,
      descricao: lanc.descricao,
      valor: lanc.valor,
      vencimento: lanc.vencimento?.split("T")[0] || "",
      pagamento: lanc.pagamento?.split("T")[0] || "",
      status: lanc.status,
      observacoes: lanc.observacoes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `/api/financeiro/${editing.id}`
        : "/api/financeiro";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showAlertMsg(
          "success",
          editing ? "Lancamento atualizado!" : "Lancamento criado!"
        );
        setShowModal(false);
        fetchData();
      } else {
        const err = await res.json();
        showAlertMsg("error", err.error || "Erro ao salvar.");
      }
    } catch {
      showAlertMsg("error", "Erro de conexao.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este lancamento?")) return;
    try {
      const res = await fetch(`/api/financeiro/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showAlertMsg("success", "Lancamento excluido!");
        fetchData();
      } else {
        showAlertMsg("error", "Erro ao excluir.");
      }
    } catch {
      showAlertMsg("error", "Erro de conexao.");
    }
  };

  const handleMarcarPago = async (lanc: Lancamento) => {
    try {
      const res = await fetch(`/api/financeiro/${lanc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "pago",
          pagamento: new Date().toISOString().split("T")[0],
        }),
      });
      if (res.ok) {
        showAlertMsg("success", "Marcado como pago!");
        fetchData();
      } else {
        showAlertMsg("error", "Erro ao atualizar.");
      }
    } catch {
      showAlertMsg("error", "Erro de conexao.");
    }
  };

  const summaryCards = [
    {
      label: "Receitas",
      value: summary.receitas,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Despesas",
      value: summary.despesas,
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    {
      label: "Lucro",
      value: summary.lucro,
      icon: DollarSign,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "A Receber",
      value: summary.aReceber,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "A Pagar",
      value: summary.aPagar,
      icon: Clock,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    {
      label: "Atrasados",
      value: summary.atrasados,
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium shadow-lg border ${
            alert.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {alert.msg}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className={`rounded-xl p-4 ${card.bg} border ${card.border}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <span className="text-xs text-dark-400">{card.label}</span>
            </div>
            <div className={`text-lg font-bold ${card.color}`}>
              {formatCurrency(card.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Buscar lancamentos..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input-field pl-10 w-full"
            />
          </div>
          <select
            value={tipoFilter}
            onChange={(e) => {
              setTipoFilter(e.target.value);
              setPage(1);
            }}
            className="input-field w-full sm:w-36"
          >
            <option value="todos">Todos Tipos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input-field w-full sm:w-36"
          >
            <option value="todos">Todos Status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="atrasado">Atrasado</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const mes = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
              generateRelatorioPdf(
                {
                  entries: lancamentos.map((l) => ({
                    tipo: l.tipo,
                    categoria: l.categoria,
                    descricao: l.descricao,
                    valor: l.valor,
                    dataVencimento: l.vencimento,
                    dataPagamento: l.pagamento,
                    status: l.status,
                  })),
                  receitas: summary.receitas,
                  despesas: summary.despesas,
                  lucro: summary.lucro,
                  tenantNome: (session?.user as any)?.tenantNome,
                },
                tipoFilter === "todos" ? "financeiro" : tipoFilter === "receita" ? "receitas" : "despesas",
                mes
              );
            }}
            className="btn-secondary whitespace-nowrap"
          >
            <FileDown className="w-4 h-4" /> Exportar PDF
          </button>
          <button onClick={openCreate} className="btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4" /> Novo Lancamento
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left p-3 text-dark-400 font-medium">Tipo</th>
                <th className="text-left p-3 text-dark-400 font-medium hidden sm:table-cell">
                  Categoria
                </th>
                <th className="text-left p-3 text-dark-400 font-medium">Descricao</th>
                <th className="text-right p-3 text-dark-400 font-medium">Valor</th>
                <th className="text-center p-3 text-dark-400 font-medium hidden md:table-cell">
                  Vencimento
                </th>
                <th className="text-center p-3 text-dark-400 font-medium hidden lg:table-cell">
                  Pagamento
                </th>
                <th className="text-center p-3 text-dark-400 font-medium">Status</th>
                <th className="text-right p-3 text-dark-400 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-400 mx-auto" />
                  </td>
                </tr>
              ) : lancamentos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-dark-500">
                    Nenhum lancamento encontrado.
                  </td>
                </tr>
              ) : (
                lancamentos.map((lanc) => (
                  <tr
                    key={lanc.id}
                    className="border-b border-dark-800 hover:bg-dark-800/30 transition-colors"
                  >
                    <td className="p-3">
                      <span
                        className={`badge text-xs ${
                          lanc.tipo === "receita"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {lanc.tipo === "receita" ? "Receita" : "Despesa"}
                      </span>
                    </td>
                    <td className="p-3 text-dark-300 hidden sm:table-cell">
                      {lanc.categoria}
                    </td>
                    <td className="p-3 text-white">{lanc.descricao}</td>
                    <td
                      className={`p-3 text-right font-medium ${
                        lanc.tipo === "receita"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {lanc.tipo === "despesa" ? "- " : ""}
                      {formatCurrency(lanc.valor)}
                    </td>
                    <td className="p-3 text-center text-dark-300 hidden md:table-cell">
                      {formatDate(lanc.vencimento)}
                    </td>
                    <td className="p-3 text-center text-dark-300 hidden lg:table-cell">
                      {lanc.pagamento ? formatDate(lanc.pagamento) : "-"}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`badge text-xs ${
                          statusColors[lanc.status] || "bg-dark-700 text-dark-300"
                        }`}
                      >
                        {lanc.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {lanc.status !== "pago" && (
                          <button
                            onClick={() => handleMarcarPago(lanc)}
                            className="p-1.5 rounded-lg text-dark-400 hover:text-emerald-400 hover:bg-dark-800 transition-colors"
                            title="Marcar como Pago"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(lanc)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-amber-400 hover:bg-dark-800 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lanc.id)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-dark-800 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-700">
            <span className="text-xs text-dark-500">
              Pagina {page} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-white">
                {editing ? "Editar Lancamento" : "Novo Lancamento"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Tipo */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo"
                    value="receita"
                    checked={form.tipo === "receita"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tipo: e.target.value as "receita" | "despesa",
                        categoria: "",
                      })
                    }
                    className="accent-brand-500"
                  />
                  Receita
                </label>
                <label className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo"
                    value="despesa"
                    checked={form.tipo === "despesa"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tipo: e.target.value as "receita" | "despesa",
                        categoria: "",
                      })
                    }
                    className="accent-brand-500"
                  />
                  Despesa
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={form.categoria}
                    onChange={(e) =>
                      setForm({ ...form, categoria: e.target.value })
                    }
                    className="input-field w-full"
                  >
                    <option value="">Selecione</option>
                    {categorias[form.tipo].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">
                    Valor *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.valor}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        valor: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Descricao *
                </label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) =>
                    setForm({ ...form, descricao: e.target.value })
                  }
                  className="input-field w-full"
                  placeholder="Descricao do lancamento"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">
                    Vencimento *
                  </label>
                  <input
                    type="date"
                    value={form.vencimento}
                    onChange={(e) =>
                      setForm({ ...form, vencimento: e.target.value })
                    }
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">
                    Pagamento
                  </label>
                  <input
                    type="date"
                    value={form.pagamento}
                    onChange={(e) =>
                      setForm({ ...form, pagamento: e.target.value })
                    }
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                  className="input-field w-full"
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="atrasado">Atrasado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Observacoes
                </label>
                <textarea
                  value={form.observacoes}
                  onChange={(e) =>
                    setForm({ ...form, observacoes: e.target.value })
                  }
                  className="input-field w-full h-16 resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-dark-900 border-t border-dark-700 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={
                  saving ||
                  !form.descricao ||
                  !form.categoria ||
                  !form.valor
                }
                className="btn-primary"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Salvar" : "Criar Lancamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
