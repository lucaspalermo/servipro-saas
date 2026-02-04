"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  Plus,
  Edit2,
  Eye,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ArrowRightIcon,
  CheckCircle,
  AlertTriangle,
  ClipboardList,
  FileDown,
} from "lucide-react";
import { formatCurrency, formatDate, statusColors } from "@/lib/utils";

interface OrdemServico {
  id: string;
  numero: string;
  data: string;
  clienteId: string;
  clienteNome: string;
  servicoId?: string;
  servicoNome: string;
  tecnicoId?: string;
  tecnicoNome: string;
  valor: number;
  status: string;
  observacoes?: string;
  checklist?: { item: string; concluido: boolean }[];
  descricao?: string;
}

const statusFlow = [
  { key: "aberta", label: "Aberta" },
  { key: "em_deslocamento", label: "Em Deslocamento" },
  { key: "em_andamento", label: "Em Andamento" },
  { key: "concluida", label: "Concluida" },
  { key: "faturada", label: "Faturada" },
];

const statusLabels: Record<string, string> = {
  aberta: "Aberta",
  em_deslocamento: "Em Deslocamento",
  em_andamento: "Em Andamento",
  concluida: "Concluida",
  faturada: "Faturada",
  cancelada: "Cancelada",
};

const emptyOS: Omit<OrdemServico, "id" | "numero"> = {
  data: new Date().toISOString().split("T")[0],
  clienteId: "",
  clienteNome: "",
  servicoId: "",
  servicoNome: "",
  tecnicoId: "",
  tecnicoNome: "",
  valor: 0,
  status: "aberta",
  observacoes: "",
  descricao: "",
  checklist: [],
};

export default function OrdensPage() {
  const { data: session } = useSession();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editing, setEditing] = useState<OrdemServico | null>(null);
  const [viewing, setViewing] = useState<OrdemServico | null>(null);
  const [form, setForm] = useState(emptyOS);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);

  // Lists for selects
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([]);
  const [servicos, setServicos] = useState<{ id: string; nome: string; precoBase: number }[]>([]);
  const [tecnicos, setTecnicos] = useState<{ id: string; nome: string }[]>([]);

  const showAlertMsg = (type: "success" | "error", msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchOrdens = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        search,
        status: statusFilter,
      });
      const res = await fetch(`/api/ordens?${params}`, { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setOrdens(json.data || json.ordens || []);
        setTotalPages(json.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchSelects = useCallback(async () => {
    try {
      const [cRes, sRes, tRes] = await Promise.all([
        fetch("/api/clientes?limit=1000", { credentials: "include" }),
        fetch("/api/servicos", { credentials: "include" }),
        fetch("/api/tecnicos?limit=1000", { credentials: "include" }),
      ]);
      if (cRes.ok) {
        const cJson = await cRes.json();
        setClientes(
          (cJson.data || cJson.clientes || []).map((c: any) => ({
            id: c.id,
            nome: c.nome,
          }))
        );
      }
      if (sRes.ok) {
        const sJson = await sRes.json();
        setServicos(
          (sJson.data || sJson.servicos || []).map((s: any) => ({
            id: s.id,
            nome: s.nome,
            precoBase: s.precoBase || 0,
          }))
        );
      }
      if (tRes.ok) {
        const tJson = await tRes.json();
        setTecnicos(
          (tJson.data || tJson.tecnicos || []).map((t: any) => ({
            id: t.id,
            nome: t.nome,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchOrdens();
  }, [fetchOrdens]);

  useEffect(() => {
    fetchSelects();
  }, [fetchSelects]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyOS);
    setShowModal(true);
  };

  const openEdit = (os: OrdemServico) => {
    setEditing(os);
    setForm({
      data: os.data?.split("T")[0] || "",
      clienteId: os.clienteId,
      clienteNome: os.clienteNome,
      servicoId: os.servicoId || "",
      servicoNome: os.servicoNome,
      tecnicoId: os.tecnicoId || "",
      tecnicoNome: os.tecnicoNome,
      valor: os.valor,
      status: os.status,
      observacoes: os.observacoes || "",
      descricao: os.descricao || "",
      checklist: os.checklist || [],
    });
    setShowModal(true);
  };

  const openView = async (os: OrdemServico) => {
    try {
      const res = await fetch(`/api/ordens/${os.id}`, { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setViewing(json);
      } else {
        setViewing(os);
      }
    } catch {
      setViewing(os);
    }
    setShowViewModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/ordens/${editing.id}` : "/api/ordens";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showAlertMsg(
          "success",
          editing ? "OS atualizada com sucesso!" : "OS criada com sucesso!"
        );
        setShowModal(false);
        fetchOrdens();
      } else {
        const err = await res.json();
        showAlertMsg("error", err.error || "Erro ao salvar OS.");
      }
    } catch {
      showAlertMsg("error", "Erro de conexao.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta OS?")) return;
    try {
      const res = await fetch(`/api/ordens/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showAlertMsg("success", "OS excluida!");
        fetchOrdens();
      } else {
        showAlertMsg("error", "Erro ao excluir.");
      }
    } catch {
      showAlertMsg("error", "Erro de conexao.");
    }
  };

  const handleAdvanceStatus = async (os: OrdemServico) => {
    const currentIdx = statusFlow.findIndex((s) => s.key === os.status);
    if (currentIdx < 0 || currentIdx >= statusFlow.length - 1) return;
    const nextStatus = statusFlow[currentIdx + 1].key;
    try {
      const res = await fetch(`/api/ordens/${os.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showAlertMsg("success", `Status atualizado para ${statusLabels[nextStatus]}`);
        fetchOrdens();
        if (viewing?.id === os.id) {
          setViewing({ ...viewing, status: nextStatus });
        }
      } else {
        showAlertMsg("error", "Erro ao atualizar status.");
      }
    } catch {
      showAlertMsg("error", "Erro de conexao.");
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    const idx = statusFlow.findIndex((s) => s.key === currentStatus);
    if (idx < 0 || idx >= statusFlow.length - 1) return null;
    return statusFlow[idx + 1].label;
  };

  const handleDownloadPdf = async (osId: string) => {
    try {
      setGeneratingPdf(osId);
      const res = await fetch(`/api/ordens/${osId}/pdf`, { credentials: "include" });
      if (!res.ok) {
        showAlertMsg("error", "Erro ao buscar dados da OS para PDF.");
        return;
      }
      const osData = await res.json();
      const { generateOSPdf } = await import("@/lib/pdf-os");
      generateOSPdf(osData, osData.tenant);
      showAlertMsg("success", "PDF gerado com sucesso!");
    } catch {
      showAlertMsg("error", "Erro ao gerar PDF.");
    } finally {
      setGeneratingPdf(null);
    }
  };

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Buscar OS..."
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
            className="input-field w-full sm:w-44"
          >
            <option value="todos">Todos Status</option>
            {statusFlow.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <button onClick={openCreate} className="btn-primary whitespace-nowrap">
          <Plus className="w-4 h-4" /> Nova OS
        </button>
      </div>

      {/* Status Flow Legend */}
      <div className="card">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {statusFlow.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`badge text-xs ${statusColors[s.key] || "bg-dark-700 text-dark-300"}`}
              >
                {s.label}
              </span>
              {i < statusFlow.length - 1 && (
                <ArrowRightIcon className="w-3 h-3 text-dark-600" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left p-3 text-dark-400 font-medium">Numero</th>
                <th className="text-left p-3 text-dark-400 font-medium hidden sm:table-cell">Data</th>
                <th className="text-left p-3 text-dark-400 font-medium">Cliente</th>
                <th className="text-left p-3 text-dark-400 font-medium hidden md:table-cell">Servico</th>
                <th className="text-left p-3 text-dark-400 font-medium hidden lg:table-cell">Tecnico</th>
                <th className="text-right p-3 text-dark-400 font-medium hidden sm:table-cell">Valor</th>
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
              ) : ordens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-dark-500">
                    Nenhuma OS encontrada.
                  </td>
                </tr>
              ) : (
                ordens.map((os) => (
                  <tr
                    key={os.id}
                    className="border-b border-dark-800 hover:bg-dark-800/30 transition-colors"
                  >
                    <td className="p-3 text-white font-medium">{os.numero}</td>
                    <td className="p-3 text-dark-300 hidden sm:table-cell">
                      {formatDate(os.data)}
                    </td>
                    <td className="p-3 text-dark-300">{os.clienteNome}</td>
                    <td className="p-3 text-dark-300 hidden md:table-cell">
                      {os.servicoNome}
                    </td>
                    <td className="p-3 text-dark-300 hidden lg:table-cell">
                      {os.tecnicoNome || "-"}
                    </td>
                    <td className="p-3 text-right text-dark-300 hidden sm:table-cell">
                      {formatCurrency(os.valor)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`badge text-xs ${
                          statusColors[os.status] || "bg-dark-700 text-dark-300"
                        }`}
                      >
                        {statusLabels[os.status] || os.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openView(os)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-blue-400 hover:bg-dark-800 transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(os.id)}
                          disabled={generatingPdf === os.id}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-emerald-400 hover:bg-dark-800 transition-colors disabled:opacity-30"
                          title="Gerar PDF"
                        >
                          {generatingPdf === os.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileDown className="w-4 h-4" />
                          )}
                        </button>
                        {getNextStatusLabel(os.status) && (
                          <button
                            onClick={() => handleAdvanceStatus(os)}
                            className="p-1.5 rounded-lg text-dark-400 hover:text-brand-400 hover:bg-dark-800 transition-colors"
                            title={`Avancar para ${getNextStatusLabel(os.status)}`}
                          >
                            <ArrowRightIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(os)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-amber-400 hover:bg-dark-800 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(os.id)}
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
          <div className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-white">
                {editing ? `Editar OS ${editing.numero}` : "Nova OS"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Data *</label>
                  <input
                    type="date"
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="input-field w-full"
                  >
                    {statusFlow.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Cliente *</label>
                  <select
                    value={form.clienteId}
                    onChange={(e) => {
                      const c = clientes.find((x) => x.id === e.target.value);
                      setForm({
                        ...form,
                        clienteId: e.target.value,
                        clienteNome: c?.nome || "",
                      });
                    }}
                    className="input-field w-full"
                  >
                    <option value="">Selecione o cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Servico *</label>
                  <select
                    value={form.servicoId}
                    onChange={(e) => {
                      const s = servicos.find((x) => x.id === e.target.value);
                      setForm({
                        ...form,
                        servicoId: e.target.value,
                        servicoNome: s?.nome || "",
                        valor: s?.precoBase || form.valor,
                      });
                    }}
                    className="input-field w-full"
                  >
                    <option value="">Selecione o servico</option>
                    {servicos.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Tecnico</label>
                  <select
                    value={form.tecnicoId}
                    onChange={(e) => {
                      const t = tecnicos.find((x) => x.id === e.target.value);
                      setForm({
                        ...form,
                        tecnicoId: e.target.value,
                        tecnicoNome: t?.nome || "",
                      });
                    }}
                    className="input-field w-full"
                  >
                    <option value="">Selecione o tecnico</option>
                    {tecnicos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Valor *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.valor}
                    onChange={(e) =>
                      setForm({ ...form, valor: parseFloat(e.target.value) || 0 })
                    }
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-1">Descricao</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className="input-field w-full h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-1">Observacoes</label>
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
              <button onClick={() => setShowModal(false)} className="btn-ghost">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.clienteId || !form.data}
                className="btn-primary"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Salvar" : "Criar OS"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowViewModal(false)}
          />
          <div className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-brand-400" />
                {viewing.numero}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status Flow Visualization */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {statusFlow.map((s, i) => {
                  const currentIdx = statusFlow.findIndex(
                    (x) => x.key === viewing.status
                  );
                  const isCompleted = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  return (
                    <div key={s.key} className="flex items-center gap-1 flex-shrink-0">
                      <div
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isCurrent
                            ? "bg-brand-500/20 border-brand-500/40 text-brand-400"
                            : isCompleted
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-dark-800 border-dark-700 text-dark-500"
                        }`}
                      >
                        {s.label}
                      </div>
                      {i < statusFlow.length - 1 && (
                        <ArrowRightIcon
                          className={`w-3 h-3 ${
                            isCompleted ? "text-emerald-500" : "text-dark-700"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-dark-500">Data</span>
                  <p className="text-sm text-white">{formatDate(viewing.data)}</p>
                </div>
                <div>
                  <span className="text-xs text-dark-500">Valor</span>
                  <p className="text-sm text-white font-semibold">
                    {formatCurrency(viewing.valor)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-dark-500">Cliente</span>
                  <p className="text-sm text-white">{viewing.clienteNome}</p>
                </div>
                <div>
                  <span className="text-xs text-dark-500">Servico</span>
                  <p className="text-sm text-white">{viewing.servicoNome}</p>
                </div>
                <div>
                  <span className="text-xs text-dark-500">Tecnico</span>
                  <p className="text-sm text-white">{viewing.tecnicoNome || "-"}</p>
                </div>
                <div>
                  <span className="text-xs text-dark-500">Status</span>
                  <p>
                    <span
                      className={`badge text-xs ${
                        statusColors[viewing.status] || "bg-dark-700 text-dark-300"
                      }`}
                    >
                      {statusLabels[viewing.status] || viewing.status}
                    </span>
                  </p>
                </div>
              </div>

              {viewing.descricao && (
                <div>
                  <span className="text-xs text-dark-500">Descricao</span>
                  <p className="text-sm text-dark-300 mt-1">{viewing.descricao}</p>
                </div>
              )}

              {viewing.observacoes && (
                <div>
                  <span className="text-xs text-dark-500">Observacoes</span>
                  <p className="text-sm text-dark-300 mt-1">{viewing.observacoes}</p>
                </div>
              )}

              {/* Checklist */}
              {viewing.checklist && viewing.checklist.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Checklist</h4>
                  <div className="space-y-2">
                    {viewing.checklist.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-lg bg-dark-800/50"
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            item.concluido
                              ? "bg-brand-500 border-brand-500"
                              : "border-dark-600"
                          }`}
                        >
                          {item.concluido && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            item.concluido
                              ? "text-dark-400 line-through"
                              : "text-white"
                          }`}
                        >
                          {item.item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-dark-900 border-t border-dark-700 px-6 py-4 flex items-center justify-between">
              <div>
                {getNextStatusLabel(viewing.status) && (
                  <button
                    onClick={() => handleAdvanceStatus(viewing)}
                    className="btn-primary text-sm"
                  >
                    Avancar para {getNextStatusLabel(viewing.status)}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownloadPdf(viewing.id)}
                  disabled={generatingPdf === viewing.id}
                  className="btn-secondary text-sm"
                >
                  {generatingPdf === viewing.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                  Gerar PDF
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEdit(viewing);
                  }}
                  className="btn-secondary text-sm"
                >
                  <Edit2 className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="btn-ghost text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
