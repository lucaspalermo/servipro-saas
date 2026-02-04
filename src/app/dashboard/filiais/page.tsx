"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Plus,
  X,
  Loader2,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Users,
  HardHat,
  ClipboardList,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Filial {
  id: string;
  nome: string;
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  responsavel: string | null;
  ativo: boolean;
  _count: {
    clientes: number;
    tecnicos: number;
    ordens: number;
  };
}

interface FilialFormData {
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  responsavel: string;
}

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMPTY_FORM: FilialFormData = {
  nome: "",
  endereco: "",
  telefone: "",
  email: "",
  responsavel: "",
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function FiliaisPage() {
  const { data: session } = useSession();

  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFilial, setEditingFilial] = useState<Filial | null>(null);
  const [formData, setFormData] = useState<FilialFormData>(EMPTY_FORM);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const showToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchFiliais = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/filiais");
      if (!res.ok) throw new Error("Erro ao carregar filiais");
      const data = await res.json();
      setFiliais(data.filiais);
    } catch {
      showToast("error", "Erro ao carregar filiais. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchFiliais();
  }, [fetchFiliais]);

  // ---------------------------------------------------------------------------
  // Modal helpers
  // ---------------------------------------------------------------------------

  function openCreateModal() {
    setEditingFilial(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(filial: Filial) {
    setEditingFilial(filial);
    setFormData({
      nome: filial.nome,
      endereco: filial.endereco ?? "",
      telefone: filial.telefone ?? "",
      email: filial.email ?? "",
      responsavel: filial.responsavel ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingFilial(null);
    setFormData(EMPTY_FORM);
  }

  // ---------------------------------------------------------------------------
  // CRUD handlers
  // ---------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.nome.trim()) {
      showToast("error", "O nome da filial e obrigatorio.");
      return;
    }

    try {
      setSubmitting(true);

      const payload: Record<string, string> = {
        nome: formData.nome.trim(),
        endereco: formData.endereco.trim(),
        telefone: formData.telefone.trim(),
        email: formData.email.trim(),
        responsavel: formData.responsavel.trim(),
      };

      if (editingFilial) {
        const res = await fetch(`/api/filiais/${editingFilial.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erro ao atualizar filial");
        showToast("success", "Filial atualizada com sucesso!");
      } else {
        const res = await fetch("/api/filiais", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erro ao criar filial");
        showToast("success", "Filial criada com sucesso!");
      }

      closeModal();
      fetchFiliais();
    } catch {
      showToast(
        "error",
        editingFilial
          ? "Erro ao atualizar filial. Tente novamente."
          : "Erro ao criar filial. Tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      const res = await fetch(`/api/filiais/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir filial");
      showToast("success", "Filial excluida com sucesso!");
      fetchFiliais();
    } catch {
      showToast("error", "Erro ao excluir filial. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-dark-900 p-6 lg:p-8">
      {/* ---- Toast container ---- */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all ${
              toast.type === "success"
                ? "border-green-600/30 bg-green-900/40 text-green-300"
                : "border-red-600/30 bg-red-900/40 text-red-300"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-5 w-5 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0" />
            )}
            <span className="text-sm">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="btn-ghost ml-2 rounded p-1 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ---- Header ---- */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Filiais</h1>
          <p className="mt-1 text-sm text-dark-400">
            Gerencie as filiais da sua empresa
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Filial
        </button>
      </div>

      {/* ---- Content ---- */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        </div>
      ) : filiais.length === 0 ? (
        /* ---- Empty state ---- */
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Building2 className="mb-4 h-16 w-16 text-dark-400" />
          <h2 className="text-lg font-semibold text-white">
            Nenhuma filial cadastrada
          </h2>
          <p className="mt-1 text-sm text-dark-400">
            Crie sua primeira filial para comecar.
          </p>
          <button
            onClick={openCreateModal}
            className="btn-primary mt-6 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Filial
          </button>
        </div>
      ) : (
        /* ---- Card grid ---- */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filiais.map((filial) => (
            <div
              key={filial.id}
              className="card card-hover relative flex flex-col gap-4 rounded-xl border border-dark-700 bg-dark-800 p-6"
            >
              {/* Top row: name + badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-400/10">
                    <Building2 className="h-5 w-5 text-brand-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{filial.nome}</h3>
                </div>

                <span
                  className={`badge shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    filial.ativo
                      ? "bg-green-900/40 text-green-400"
                      : "bg-red-900/40 text-red-400"
                  }`}
                >
                  {filial.ativo ? "Ativa" : "Inativa"}
                </span>
              </div>

              {/* Detail rows */}
              <div className="flex flex-col gap-2 text-sm text-dark-400">
                {filial.endereco && (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {filial.endereco}
                  </span>
                )}
                {filial.telefone && (
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" />
                    {filial.telefone}
                  </span>
                )}
                {filial.email && (
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" />
                    {filial.email}
                  </span>
                )}
                {filial.responsavel && (
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4 shrink-0" />
                    {filial.responsavel}
                  </span>
                )}
              </div>

              {/* Counters */}
              <div className="flex items-center gap-4 border-t border-dark-700 pt-4 text-sm">
                <span className="flex items-center gap-1.5 text-dark-400">
                  <Users className="h-4 w-4 text-brand-400" />
                  <span className="font-semibold text-white">
                    {filial._count.clientes}
                  </span>{" "}
                  clientes
                </span>
                <span className="flex items-center gap-1.5 text-dark-400">
                  <HardHat className="h-4 w-4 text-brand-400" />
                  <span className="font-semibold text-white">
                    {filial._count.tecnicos}
                  </span>{" "}
                  tecnicos
                </span>
                <span className="flex items-center gap-1.5 text-dark-400">
                  <ClipboardList className="h-4 w-4 text-brand-400" />
                  <span className="font-semibold text-white">
                    {filial._count.ordens}
                  </span>{" "}
                  ordens
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 border-t border-dark-700 pt-4">
                <button
                  onClick={() => openEditModal(filial)}
                  className="btn-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(filial.id)}
                  disabled={deletingId === filial.id}
                  className="btn-ghost flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 disabled:opacity-50"
                >
                  {deletingId === filial.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- Create / Edit Modal ---- */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Panel */}
          <div className="relative z-50 w-full max-w-lg rounded-xl border border-dark-700 bg-dark-800 p-6 shadow-2xl">
            {/* Modal header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingFilial ? "Editar Filial" : "Nova Filial"}
              </h2>
              <button
                onClick={closeModal}
                className="btn-ghost rounded-lg p-2 text-dark-400 hover:bg-dark-700 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Nome */}
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-400">
                  Nome <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="input-field w-full rounded-lg border border-dark-700 bg-dark-900 px-4 py-2.5 text-white placeholder-dark-400 focus:border-brand-400 focus:outline-none"
                  placeholder="Nome da filial"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Endereco */}
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-400">
                  Endereco
                </label>
                <input
                  type="text"
                  className="input-field w-full rounded-lg border border-dark-700 bg-dark-900 px-4 py-2.5 text-white placeholder-dark-400 focus:border-brand-400 focus:outline-none"
                  placeholder="Endereco completo"
                  value={formData.endereco}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endereco: e.target.value }))
                  }
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-400">
                  Telefone
                </label>
                <input
                  type="text"
                  className="input-field w-full rounded-lg border border-dark-700 bg-dark-900 px-4 py-2.5 text-white placeholder-dark-400 focus:border-brand-400 focus:outline-none"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, telefone: e.target.value }))
                  }
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-400">
                  Email
                </label>
                <input
                  type="email"
                  className="input-field w-full rounded-lg border border-dark-700 bg-dark-900 px-4 py-2.5 text-white placeholder-dark-400 focus:border-brand-400 focus:outline-none"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>

              {/* Responsavel */}
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-400">
                  Responsavel
                </label>
                <input
                  type="text"
                  className="input-field w-full rounded-lg border border-dark-700 bg-dark-900 px-4 py-2.5 text-white placeholder-dark-400 focus:border-brand-400 focus:outline-none"
                  placeholder="Nome do responsavel"
                  value={formData.responsavel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      responsavel: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Actions */}
              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary rounded-lg px-4 py-2.5 text-sm"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingFilial ? "Salvar Alteracoes" : "Criar Filial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
