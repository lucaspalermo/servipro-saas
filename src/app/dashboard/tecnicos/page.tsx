"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Plus,
  Edit2,
  Eye,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ClipboardList,
  Calendar,
  MapPin,
  Percent,
  Phone,
  Mail,
  KeyRound,
  Smartphone,
} from "lucide-react";
import { statusColors } from "@/lib/utils";

interface Tecnico {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  regiao?: string;
  comissao: number;
  ativo: boolean;
  stats?: {
    osConcluidas: number;
    osAbertas: number;
    agendaHoje: number;
  };
}

const emptyTecnico: Omit<Tecnico, "id" | "stats"> & { senha: string; loginAtivo: boolean } = {
  nome: "",
  email: "",
  telefone: "",
  regiao: "",
  comissao: 10,
  ativo: true,
  senha: "",
  loginAtivo: false,
};

export default function TecnicosPage() {
  const { data: session } = useSession();
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editing, setEditing] = useState<Tecnico | null>(null);
  const [viewing, setViewing] = useState<Tecnico | null>(null);
  const [form, setForm] = useState(emptyTecnico);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const showAlertMsg = (type: "success" | "error", msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchTecnicos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tecnicos", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setTecnicos(json.data || json.tecnicos || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTecnicos();
  }, [fetchTecnicos]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyTecnico);
    setShowModal(true);
  };

  const openEdit = (tecnico: Tecnico) => {
    setEditing(tecnico);
    setForm({
      nome: tecnico.nome,
      email: tecnico.email || "",
      telefone: tecnico.telefone || "",
      regiao: tecnico.regiao || "",
      comissao: tecnico.comissao,
      ativo: tecnico.ativo,
      senha: "",
      loginAtivo: (tecnico as any).loginAtivo || false,
    });
    setShowModal(true);
  };

  const openView = async (tecnico: Tecnico) => {
    try {
      const res = await fetch(`/api/tecnicos/${tecnico.id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setViewing(json);
      } else {
        setViewing(tecnico);
      }
    } catch {
      setViewing(tecnico);
    }
    setShowViewModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/tecnicos/${editing.id}` : "/api/tecnicos";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showAlertMsg(
          "success",
          editing ? "Tecnico atualizado!" : "Tecnico criado!"
        );
        setShowModal(false);
        fetchTecnicos();
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Equipe Tecnica</h2>
          <p className="text-sm text-dark-400">
            {tecnicos.length} tecnico{tecnicos.length !== 1 ? "s" : ""}{" "}
            cadastrado{tecnicos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Tecnico
        </button>
      </div>

      {/* Card Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-dark-700" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-dark-700 rounded mb-2" />
                  <div className="h-3 w-16 bg-dark-700 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-dark-700 rounded" />
                <div className="h-3 w-3/4 bg-dark-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : tecnicos.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-dark-500">Nenhum tecnico cadastrado.</p>
          <button onClick={openCreate} className="btn-primary mt-4">
            <Plus className="w-4 h-4" /> Cadastrar Tecnico
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tecnicos.map((tecnico) => (
            <div key={tecnico.id} className="card-hover group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {tecnico.nome[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      {tecnico.nome}
                    </h3>
                    {tecnico.regiao && (
                      <div className="flex items-center gap-1 text-xs text-dark-400 mt-0.5">
                        <MapPin className="w-3 h-3" /> {tecnico.regiao}
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className={`badge text-[10px] ${
                    tecnico.ativo
                      ? statusColors.ativo
                      : statusColors.inativo
                  }`}
                >
                  {tecnico.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg bg-dark-800/50">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-white">
                    {tecnico.stats?.osConcluidas ?? 0}
                  </div>
                  <div className="text-[10px] text-dark-500">Concluidas</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-dark-800/50">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ClipboardList className="w-3 h-3 text-blue-400" />
                  </div>
                  <div className="text-sm font-bold text-white">
                    {tecnico.stats?.osAbertas ?? 0}
                  </div>
                  <div className="text-[10px] text-dark-500">Abertas</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-dark-800/50">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="text-sm font-bold text-white">
                    {tecnico.stats?.agendaHoje ?? 0}
                  </div>
                  <div className="text-[10px] text-dark-500">Hoje</div>
                </div>
              </div>

              {/* Commission */}
              <div className="flex items-center justify-between text-xs mb-4 p-2 rounded-lg bg-dark-800/30 border border-dark-700">
                <span className="text-dark-400 flex items-center gap-1">
                  <Percent className="w-3 h-3" /> Comissao
                </span>
                <span className="text-brand-400 font-semibold">
                  {tecnico.comissao}%
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openView(tecnico)}
                  className="flex-1 btn-ghost text-xs justify-center"
                >
                  <Eye className="w-3.5 h-3.5" /> Ver
                </button>
                <button
                  onClick={() => openEdit(tecnico)}
                  className="flex-1 btn-ghost text-xs justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-white">
                {editing ? "Editar Tecnico" : "Novo Tecnico"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) =>
                    setForm({ ...form, nome: e.target.value })
                  }
                  className="input-field w-full"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={form.telefone}
                  onChange={(e) =>
                    setForm({ ...form, telefone: e.target.value })
                  }
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Regiao
                </label>
                <input
                  type="text"
                  value={form.regiao}
                  onChange={(e) =>
                    setForm({ ...form, regiao: e.target.value })
                  }
                  className="input-field w-full"
                  placeholder="Ex: Zona Sul, Centro"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Comissao (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={form.comissao}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      comissao: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="input-field w-full"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) =>
                    setForm({ ...form, ativo: e.target.checked })
                  }
                  className="accent-brand-500 w-4 h-4"
                />
                Tecnico ativo
              </label>

              {/* Login do Tecnico */}
              <div className="pt-4 border-t border-dark-700 space-y-3">
                <div className="flex items-center gap-2 text-sm text-dark-300">
                  <Smartphone className="w-4 h-4 text-brand-400" />
                  <span className="font-medium text-white">Acesso ao Painel Mobile</span>
                </div>
                <label className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(form as any).loginAtivo || false}
                    onChange={(e) =>
                      setForm({ ...form, loginAtivo: e.target.checked } as any)
                    }
                    className="accent-brand-500 w-4 h-4"
                  />
                  Habilitar login no app do tecnico
                </label>
                {(form as any).loginAtivo && (
                  <div>
                    <label className="block text-sm text-dark-400 mb-1">
                      <KeyRound className="w-3 h-3 inline mr-1" />
                      Senha de acesso
                    </label>
                    <input
                      type="password"
                      value={(form as any).senha || ""}
                      onChange={(e) =>
                        setForm({ ...form, senha: e.target.value } as any)
                      }
                      className="input-field w-full"
                      placeholder={editing ? "Deixe vazio para manter a senha atual" : "Criar senha"}
                    />
                  </div>
                )}
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
                disabled={saving || !form.nome}
                className="btn-primary"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Salvar" : "Criar Tecnico"}
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
          <div className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="border-b border-dark-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Detalhes do Tecnico
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
                  {viewing.nome[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white text-lg font-semibold">
                    {viewing.nome}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`badge text-xs ${
                        viewing.ativo
                          ? statusColors.ativo
                          : statusColors.inativo
                      }`}
                    >
                      {viewing.ativo ? "Ativo" : "Inativo"}
                    </span>
                    {viewing.regiao && (
                      <span className="text-xs text-dark-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {viewing.regiao}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                {viewing.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-dark-500" />
                    <span className="text-dark-300">{viewing.email}</span>
                  </div>
                )}
                {viewing.telefone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-dark-500" />
                    <span className="text-dark-300">{viewing.telefone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Percent className="w-4 h-4 text-dark-500" />
                  <span className="text-dark-300">
                    Comissao: {viewing.comissao}%
                  </span>
                </div>
              </div>

              {/* Performance Stats */}
              {viewing.stats && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">
                    Performance
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-xl font-bold text-emerald-400">
                        {viewing.stats.osConcluidas}
                      </div>
                      <div className="text-[10px] text-dark-400 mt-1">
                        OS Concluidas
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="text-xl font-bold text-blue-400">
                        {viewing.stats.osAbertas}
                      </div>
                      <div className="text-[10px] text-dark-400 mt-1">
                        OS Abertas
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="text-xl font-bold text-amber-400">
                        {viewing.stats.agendaHoje}
                      </div>
                      <div className="text-[10px] text-dark-400 mt-1">
                        Agenda Hoje
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-dark-700 px-6 py-4 flex items-center justify-end gap-3">
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
      )}
    </div>
  );
}
