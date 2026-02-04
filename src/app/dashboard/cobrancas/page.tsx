"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  Plus,
  X,
  Loader2,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  Clock,
  CreditCard,
  QrCode,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatCurrency, formatDate, statusColors } from "@/lib/utils";

// ── Types ───────────────────────────────────────────────────────────
interface Cobranca {
  id: string;
  clienteId: string;
  cliente?: { id: string; nome: string };
  descricao: string;
  valor: number;
  tipo: "pix" | "boleto";
  dataVencimento: string;
  status: "pendente" | "pago" | "cancelado";
  linkPagamento?: string;
}

interface Cliente {
  id: string;
  nome: string;
}

interface Summary {
  pendente: number;
  pago: number;
  cancelado: number;
}

const emptyForm = {
  clienteId: "",
  descricao: "",
  valor: 0,
  tipo: "pix" as "pix" | "boleto",
  dataVencimento: new Date().toISOString().split("T")[0],
};

// ── Component ───────────────────────────────────────────────────────
export default function CobrancasPage() {
  const { data: session } = useSession();

  // Data
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Summary
  const [summary, setSummary] = useState<Summary>({
    pendente: 0,
    pago: 0,
    cancelado: 0,
  });

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // UI feedback
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Alert helper ──────────────────────────────────────────────────
  const showAlert = (type: "success" | "error", msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3500);
  };

  // ── Fetch cobrancas ───────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        ...(statusFilter !== "todos" && { status: statusFilter }),
        ...(search && { search }),
      });
      const res = await fetch(`/api/cobrancas?${params}`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setCobrancas(json.data || []);
        setTotalPages(json.pages || 1);
        if (json.summary) {
          setSummary({
            pendente: json.summary.pendente ?? json.summary._sum?.pendente ?? 0,
            pago: json.summary.pago ?? json.summary._sum?.pago ?? 0,
            cancelado: json.summary.cancelado ?? json.summary._sum?.cancelado ?? 0,
          });
        }
      }
    } catch (err) {
      console.error("Erro ao buscar cobrancas:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  // ── Fetch clientes (for modal select) ─────────────────────────────
  const fetchClientes = useCallback(async () => {
    try {
      const res = await fetch("/api/clientes", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setClientes(json.data || []);
      }
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // ── Create ────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!form.clienteId || !form.descricao || !form.valor) {
      showAlert("error", "Preencha todos os campos obrigatorios.");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch("/api/cobrancas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          clienteId: form.clienteId,
          descricao: form.descricao,
          valor: Number(form.valor),
          tipo: form.tipo,
          dataVencimento: form.dataVencimento,
        }),
      });
      if (res.ok) {
        showAlert("success", "Cobranca criada com sucesso!");
        setShowModal(false);
        fetchData();
      } else {
        const err = await res.json();
        showAlert("error", err.error || "Erro ao criar cobranca.");
      }
    } catch {
      showAlert("error", "Erro de conexao.");
    } finally {
      setSaving(false);
    }
  };

  // ── Mark as paid ──────────────────────────────────────────────────
  const handleMarcarPago = async (id: string) => {
    try {
      const res = await fetch(`/api/cobrancas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "pago" }),
      });
      if (res.ok) {
        showAlert("success", "Cobranca marcada como paga!");
        fetchData();
      } else {
        showAlert("error", "Erro ao atualizar cobranca.");
      }
    } catch {
      showAlert("error", "Erro de conexao.");
    }
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta cobranca?")) return;
    try {
      const res = await fetch(`/api/cobrancas/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showAlert("success", "Cobranca excluida!");
        fetchData();
      } else {
        showAlert("error", "Erro ao excluir cobranca.");
      }
    } catch {
      showAlert("error", "Erro de conexao.");
    }
  };

  // ── Copy link ─────────────────────────────────────────────────────
  const handleCopyLink = async (cobranca: Cobranca) => {
    const link =
      cobranca.linkPagamento ||
      `${window.location.origin}/pay/${cobranca.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(cobranca.id);
      showAlert("success", "Link copiado!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showAlert("error", "Erro ao copiar link.");
    }
  };

  // ── WhatsApp share ────────────────────────────────────────────────
  const handleWhatsApp = (cobranca: Cobranca) => {
    const link =
      cobranca.linkPagamento ||
      `${window.location.origin}/pay/${cobranca.id}`;
    const clienteNome = cobranca.cliente?.nome || "Cliente";
    const msg = encodeURIComponent(
      `Ola ${clienteNome}! Segue o link para pagamento da cobranca "${cobranca.descricao}" no valor de ${formatCurrency(cobranca.valor)}:\n\n${link}\n\nQualquer duvida estamos a disposicao!`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  // ── Summary cards config ──────────────────────────────────────────
  const summaryCards = [
    {
      label: "Total Pendente",
      value: summary.pendente,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Total Pago",
      value: summary.pago,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Total Cancelado",
      value: summary.cancelado,
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
  ];

  // ── Status badge helper ───────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; classes: string }> = {
      pendente: {
        label: "Pendente",
        classes: "bg-amber-500/10 text-amber-400",
      },
      pago: {
        label: "Pago",
        classes: "bg-emerald-500/10 text-emerald-400",
      },
      cancelado: {
        label: "Cancelado",
        classes: "bg-red-500/10 text-red-400",
      },
    };
    const s = map[status] || { label: status, classes: "bg-dark-700 text-dark-300" };
    return (
      <span className={`badge text-xs ${s.classes}`}>
        {s.label}
      </span>
    );
  };

  // ── Tipo badge helper ─────────────────────────────────────────────
  const getTipoBadge = (tipo: string) => {
    if (tipo === "pix") {
      return (
        <span className="badge text-xs bg-brand-500/10 text-brand-400 inline-flex items-center gap-1">
          <QrCode className="w-3 h-3" />
          PIX
        </span>
      );
    }
    return (
      <span className="badge text-xs bg-blue-500/10 text-blue-400 inline-flex items-center gap-1">
        <CreditCard className="w-3 h-3" />
        Boleto
      </span>
    );
  };

  // ═════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Alert Toast ────────────────────────────────────────────── */}
      {alert && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium shadow-lg border transition-all ${
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

      {/* ── Page Header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Cobrancas</h1>
        <p className="text-dark-400 text-sm mt-1">
          Gerencie suas cobrancas via PIX e Boleto
        </p>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* ── Filters & Actions ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Buscar cobrancas..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input-field pl-10 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input-field w-full sm:w-40"
          >
            <option value="todos">Todos Status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <button onClick={openCreate} className="btn-primary whitespace-nowrap">
          <Plus className="w-4 h-4" /> Nova Cobranca
        </button>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left p-3 text-dark-400 font-medium">
                  Cliente
                </th>
                <th className="text-left p-3 text-dark-400 font-medium hidden sm:table-cell">
                  Descricao
                </th>
                <th className="text-right p-3 text-dark-400 font-medium">
                  Valor
                </th>
                <th className="text-center p-3 text-dark-400 font-medium hidden md:table-cell">
                  Tipo
                </th>
                <th className="text-center p-3 text-dark-400 font-medium hidden md:table-cell">
                  Vencimento
                </th>
                <th className="text-center p-3 text-dark-400 font-medium">
                  Status
                </th>
                <th className="text-right p-3 text-dark-400 font-medium">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-400 mx-auto" />
                  </td>
                </tr>
              ) : cobrancas.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-dark-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <DollarSign className="w-8 h-8 text-dark-600" />
                      <span>Nenhuma cobranca encontrada.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                cobrancas.map((cob) => (
                  <tr
                    key={cob.id}
                    className="border-b border-dark-800 hover:bg-dark-800/30 transition-colors"
                  >
                    {/* Cliente */}
                    <td className="p-3 text-white font-medium">
                      {cob.cliente?.nome || "—"}
                    </td>

                    {/* Descricao */}
                    <td className="p-3 text-dark-300 hidden sm:table-cell max-w-[200px] truncate">
                      {cob.descricao}
                    </td>

                    {/* Valor */}
                    <td className="p-3 text-right font-medium text-emerald-400">
                      {formatCurrency(cob.valor)}
                    </td>

                    {/* Tipo */}
                    <td className="p-3 text-center hidden md:table-cell">
                      {getTipoBadge(cob.tipo)}
                    </td>

                    {/* Vencimento */}
                    <td className="p-3 text-center text-dark-300 hidden md:table-cell">
                      {formatDate(cob.dataVencimento)}
                    </td>

                    {/* Status */}
                    <td className="p-3 text-center">
                      {getStatusBadge(cob.status)}
                    </td>

                    {/* Acoes */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Copy link */}
                        <button
                          onClick={() => handleCopyLink(cob)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-brand-400 hover:bg-dark-800 transition-colors"
                          title="Copiar link de pagamento"
                        >
                          {copiedId === cob.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* WhatsApp share */}
                        <button
                          onClick={() => handleWhatsApp(cob)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-emerald-400 hover:bg-dark-800 transition-colors"
                          title="Enviar via WhatsApp"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        </button>

                        {/* Mark as paid */}
                        {cob.status === "pendente" && (
                          <button
                            onClick={() => handleMarcarPago(cob.id)}
                            className="p-1.5 rounded-lg text-dark-400 hover:text-emerald-400 hover:bg-dark-800 transition-colors"
                            title="Marcar como Pago"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(cob.id)}
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

        {/* ── Pagination ───────────────────────────────────────────── */}
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

      {/* ── Create Modal ───────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-white">
                Nova Cobranca
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Cliente */}
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Cliente *
                </label>
                <select
                  value={form.clienteId}
                  onChange={(e) =>
                    setForm({ ...form, clienteId: e.target.value })
                  }
                  className="input-field w-full"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descricao */}
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
                  placeholder="Ex: Mensalidade Janeiro 2026"
                />
              </div>

              {/* Valor & Tipo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.valor || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        valor: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-field w-full"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">
                    Tipo *
                  </label>
                  <select
                    value={form.tipo}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tipo: e.target.value as "pix" | "boleto",
                      })
                    }
                    className="input-field w-full"
                  >
                    <option value="pix">PIX</option>
                    <option value="boleto">Boleto</option>
                  </select>
                </div>
              </div>

              {/* Tipo visual indicator */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, tipo: "pix" })}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    form.tipo === "pix"
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                      : "border-dark-700 bg-dark-800 text-dark-400 hover:border-dark-600"
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-sm font-medium">PIX</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, tipo: "boleto" })}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    form.tipo === "boleto"
                      ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                      : "border-dark-700 bg-dark-800 text-dark-400 hover:border-dark-600"
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm font-medium">Boleto</span>
                </button>
              </div>

              {/* Data Vencimento */}
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Data de Vencimento *
                </label>
                <input
                  type="date"
                  value={form.dataVencimento}
                  onChange={(e) =>
                    setForm({ ...form, dataVencimento: e.target.value })
                  }
                  className="input-field w-full"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-dark-900 border-t border-dark-700 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={
                  saving ||
                  !form.clienteId ||
                  !form.descricao ||
                  !form.valor
                }
                className="btn-primary"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Criar Cobranca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
