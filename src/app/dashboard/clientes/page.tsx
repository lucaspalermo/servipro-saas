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
  MapPin,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle,
  FileDown,
} from "lucide-react";
import { generateClientesPdf } from "@/lib/pdf-clientes";
import { formatDate, statusColors, cn } from "@/lib/utils";

interface Cliente {
  id: string;
  tipoPessoa: string;
  nome: string;
  razaoSocial?: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  whatsapp?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  tipoImovel?: string;
  areaM2?: number;
  observacoes?: string;
  status: string;
  contratosAtivos?: number;
  contratos?: any[];
  ordensRecentes?: any[];
  portalToken?: string;
}

const emptyCliente: Omit<Cliente, "id" | "contratosAtivos" | "contratos" | "ordensRecentes"> = {
  tipoPessoa: "PF",
  nome: "",
  razaoSocial: "",
  cpfCnpj: "",
  email: "",
  telefone: "",
  whatsapp: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  tipoImovel: "",
  areaM2: 0,
  observacoes: "",
  status: "ativo",
};

export default function ClientesPage() {
  const { data: session } = useSession();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [viewing, setViewing] = useState<Cliente | null>(null);
  const [form, setForm] = useState(emptyCliente);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showAlert = (type: "success" | "error", msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        search,
        status: statusFilter,
      });
      const res = await fetch(`/api/clientes?${params}`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setClientes(json.data || json.clientes || []);
        setTotalPages(json.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCliente);
    setShowModal(true);
  };

  const openEdit = (cliente: Cliente) => {
    setEditing(cliente);
    setForm({
      tipoPessoa: cliente.tipoPessoa,
      nome: cliente.nome,
      razaoSocial: cliente.razaoSocial || "",
      cpfCnpj: cliente.cpfCnpj,
      email: cliente.email,
      telefone: cliente.telefone,
      whatsapp: cliente.whatsapp || "",
      cep: cliente.cep || "",
      endereco: cliente.endereco || "",
      numero: cliente.numero || "",
      complemento: cliente.complemento || "",
      bairro: cliente.bairro || "",
      cidade: cliente.cidade || "",
      estado: cliente.estado || "",
      tipoImovel: cliente.tipoImovel || "",
      areaM2: cliente.areaM2 || 0,
      observacoes: cliente.observacoes || "",
      status: cliente.status,
    });
    setShowModal(true);
  };

  const openView = async (cliente: Cliente) => {
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setViewing(json);
      } else {
        setViewing(cliente);
      }
    } catch {
      setViewing(cliente);
    }
    setShowViewModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/clientes/${editing.id}` : "/api/clientes";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showAlert("success", editing ? "Cliente atualizado com sucesso!" : "Cliente criado com sucesso!");
        setShowModal(false);
        fetchClientes();
      } else {
        const err = await res.json();
        showAlert("error", err.error || "Erro ao salvar cliente.");
      }
    } catch {
      showAlert("error", "Erro de conexao.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    try {
      const res = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showAlert("success", "Cliente excluido!");
        fetchClientes();
      } else {
        showAlert("error", "Erro ao excluir.");
      }
    } catch {
      showAlert("error", "Erro de conexao.");
    }
  };

  const getGoogleMapsUrl = (c: Cliente) => {
    const addr = [c.endereco, c.numero, c.bairro, c.cidade, c.estado]
      .filter(Boolean)
      .join(", ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
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
              placeholder="Buscar clientes..."
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
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="inadimplente">Inadimplente</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const ativos = clientes.filter((c: Cliente) => c.status === "ativo");
              const inativos = clientes.filter((c: Cliente) => c.status !== "ativo");
              generateClientesPdf({
                clientes: clientes.map((c: Cliente) => ({
                  nome: c.nome,
                  tipoPessoa: c.tipoPessoa,
                  telefone: c.telefone,
                  whatsapp: c.whatsapp,
                  email: c.email,
                  cidade: c.cidade,
                  status: c.status,
                })),
                totalAtivos: ativos.length,
                totalInativos: inativos.length,
                tenantNome: (session?.user as any)?.tenantNome,
              });
            }}
            className="btn-secondary whitespace-nowrap"
          >
            <FileDown className="w-4 h-4" /> Exportar PDF
          </button>
          <button onClick={openCreate} className="btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4" /> Novo Cliente
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left p-3 text-dark-400 font-medium">Nome</th>
                <th className="text-left p-3 text-dark-400 font-medium hidden md:table-cell">CPF/CNPJ</th>
                <th className="text-left p-3 text-dark-400 font-medium hidden sm:table-cell">Telefone</th>
                <th className="text-left p-3 text-dark-400 font-medium hidden lg:table-cell">Cidade</th>
                <th className="text-center p-3 text-dark-400 font-medium hidden lg:table-cell">Contratos</th>
                <th className="text-center p-3 text-dark-400 font-medium">Status</th>
                <th className="text-right p-3 text-dark-400 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-400 mx-auto" />
                  </td>
                </tr>
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-dark-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-b border-dark-800 hover:bg-dark-800/30 transition-colors"
                  >
                    <td className="p-3 text-white font-medium">{cliente.nome}</td>
                    <td className="p-3 text-dark-300 hidden md:table-cell">
                      {cliente.cpfCnpj}
                    </td>
                    <td className="p-3 text-dark-300 hidden sm:table-cell">
                      {cliente.telefone}
                    </td>
                    <td className="p-3 text-dark-300 hidden lg:table-cell">
                      {cliente.cidade || "-"}
                    </td>
                    <td className="p-3 text-center text-dark-300 hidden lg:table-cell">
                      {cliente.contratosAtivos ?? 0}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`badge text-xs ${
                          statusColors[cliente.status] || "bg-dark-700 text-dark-300"
                        }`}
                      >
                        {cliente.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openView(cliente)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-blue-400 hover:bg-dark-800 transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(cliente)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-amber-400 hover:bg-dark-800 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id)}
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
                {editing ? "Editar Cliente" : "Novo Cliente"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Tipo Pessoa */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoPessoa"
                    value="PF"
                    checked={form.tipoPessoa === "PF"}
                    onChange={(e) => setForm({ ...form, tipoPessoa: e.target.value })}
                    className="accent-brand-500"
                  />
                  Pessoa Fisica
                </label>
                <label className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoPessoa"
                    value="PJ"
                    checked={form.tipoPessoa === "PJ"}
                    onChange={(e) => setForm({ ...form, tipoPessoa: e.target.value })}
                    className="accent-brand-500"
                  />
                  Pessoa Juridica
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="input-field w-full"
                    placeholder="Nome completo"
                  />
                </div>
                {form.tipoPessoa === "PJ" && (
                  <div>
                    <label className="block text-sm text-dark-400 mb-1">Razao Social</label>
                    <input
                      type="text"
                      value={form.razaoSocial}
                      onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm text-dark-400 mb-1">
                    {form.tipoPessoa === "PF" ? "CPF" : "CNPJ"} *
                  </label>
                  <input
                    type="text"
                    value={form.cpfCnpj}
                    onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Telefone *</label>
                  <input
                    type="text"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <hr className="border-dark-700" />
              <h3 className="text-sm font-medium text-dark-300">Endereco</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">CEP</label>
                  <input
                    type="text"
                    value={form.cep}
                    onChange={(e) => setForm({ ...form, cep: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-dark-400 mb-1">Endereco</label>
                  <input
                    type="text"
                    value={form.endereco}
                    onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Numero</label>
                  <input
                    type="text"
                    value={form.numero}
                    onChange={(e) => setForm({ ...form, numero: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={form.complemento}
                    onChange={(e) => setForm({ ...form, complemento: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={form.bairro}
                    onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={form.cidade}
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Estado</label>
                  <input
                    type="text"
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    className="input-field w-full"
                    maxLength={2}
                    placeholder="UF"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Tipo Imovel</label>
                  <select
                    value={form.tipoImovel}
                    onChange={(e) => setForm({ ...form, tipoImovel: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="">Selecione</option>
                    <option value="residencial">Residencial</option>
                    <option value="comercial">Comercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="condominio">Condominio</option>
                    <option value="rural">Rural</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Area (m2)</label>
                  <input
                    type="number"
                    value={form.areaM2 || ""}
                    onChange={(e) =>
                      setForm({ ...form, areaM2: Number(e.target.value) })
                    }
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-1">Observacoes</label>
                <textarea
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  className="input-field w-full h-20 resize-none"
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
                disabled={saving || !form.nome || !form.cpfCnpj || !form.telefone}
                className="btn-primary"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Salvar" : "Criar Cliente"}
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
              <h2 className="text-lg font-semibold text-white">
                Detalhes do Cliente
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {viewing.nome[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-lg font-semibold">{viewing.nome}</h3>
                  {viewing.razaoSocial && (
                    <p className="text-dark-400 text-sm">{viewing.razaoSocial}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`badge text-xs ${
                        statusColors[viewing.status] || "bg-dark-700 text-dark-300"
                      }`}
                    >
                      {viewing.status}
                    </span>
                    <span className="text-xs text-dark-500">
                      {viewing.tipoPessoa === "PF" ? "Pessoa Fisica" : "Pessoa Juridica"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-dark-500" />
                  <span className="text-dark-400">
                    {viewing.tipoPessoa === "PF" ? "CPF" : "CNPJ"}:
                  </span>
                  <span className="text-white">{viewing.cpfCnpj}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-dark-500" />
                  <span className="text-white">{viewing.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-dark-500" />
                  <span className="text-white">{viewing.telefone}</span>
                </div>
                {viewing.whatsapp && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-dark-500" />
                    <span className="text-dark-400">WhatsApp:</span>
                    <span className="text-white">{viewing.whatsapp}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              {viewing.endereco && (
                <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-dark-400" /> Endereco
                    </h4>
                    <a
                      href={getGoogleMapsUrl(viewing)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      Ver no Google Maps
                    </a>
                  </div>
                  <p className="text-sm text-dark-300">
                    {[viewing.endereco, viewing.numero, viewing.complemento]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p className="text-sm text-dark-400">
                    {[viewing.bairro, viewing.cidade, viewing.estado]
                      .filter(Boolean)
                      .join(" - ")}
                    {viewing.cep ? ` - CEP: ${viewing.cep}` : ""}
                  </p>
                  {(viewing.tipoImovel || viewing.areaM2) && (
                    <p className="text-xs text-dark-500 mt-1">
                      {viewing.tipoImovel && `Tipo: ${viewing.tipoImovel}`}
                      {viewing.areaM2 ? ` | Area: ${viewing.areaM2}m2` : ""}
                    </p>
                  )}
                </div>
              )}

              {/* Contracts */}
              {viewing.contratos && viewing.contratos.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Contratos</h4>
                  <div className="space-y-2">
                    {viewing.contratos.map((contrato: any, i: number) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm text-white">{contrato.servico}</div>
                          <div className="text-xs text-dark-400">
                            Recorrencia: {contrato.recorrenciaDias} dias
                          </div>
                        </div>
                        <span
                          className={`badge text-xs ${
                            statusColors[contrato.status] || "bg-dark-700 text-dark-300"
                          }`}
                        >
                          {contrato.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent OS */}
              {viewing.ordensRecentes && viewing.ordensRecentes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">
                    OS Recentes
                  </h4>
                  <div className="space-y-2">
                    {viewing.ordensRecentes.map((os: any, i: number) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm text-white">{os.numero}</div>
                          <div className="text-xs text-dark-400">
                            {formatDate(os.data)}
                          </div>
                        </div>
                        <span
                          className={`badge text-xs ${
                            statusColors[os.status] || "bg-dark-700 text-dark-300"
                          }`}
                        >
                          {os.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portal Link */}
              {viewing.portalToken && (
                <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20">
                  <h4 className="text-sm font-medium text-white mb-2">Portal do Cliente</h4>
                  <p className="text-xs text-dark-400 mb-3">
                    Compartilhe este link com o cliente para que ele acompanhe servicos e historico:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/portal/${viewing.portalToken}`}
                      className="input-field w-full text-xs"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/portal/${viewing.portalToken}`
                        );
                      }}
                      className="btn-primary text-xs !px-3 !py-2 whitespace-nowrap"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              )}

              {/* Observations */}
              {viewing.observacoes && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Observacoes</h4>
                  <p className="text-sm text-dark-400 whitespace-pre-wrap">
                    {viewing.observacoes}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-dark-900 border-t border-dark-700 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openEdit(viewing);
                }}
                className="btn-secondary"
              >
                <Edit2 className="w-4 h-4" /> Editar
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="btn-ghost"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
