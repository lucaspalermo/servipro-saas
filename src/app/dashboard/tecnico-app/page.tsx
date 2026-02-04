"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Navigation,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  MessageCircle,
  AlertTriangle,
  Play,
  Truck,
  Check,
} from "lucide-react";

interface OrdemTecnico {
  id: string;
  numero: string;
  status: string;
  valor: number;
  descricao?: string;
  horaInicio?: string;
  horaFim?: string;
  obsTecnico?: string;
  cliente: {
    nome: string;
    telefone?: string;
    whatsapp?: string;
    endereco?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
  };
  servico?: { nome: string; duracaoMin: number };
  tecnico?: { id: string; nome: string };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  aberta: { label: "Aberta", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: ClipboardList },
  em_deslocamento: { label: "Em Deslocamento", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Truck },
  em_andamento: { label: "Em Andamento", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Play },
  concluida: { label: "Concluida", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: Check },
  faturada: { label: "Faturada", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
  cancelada: { label: "Cancelada", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: AlertTriangle },
};

export default function TecnicoAppPage() {
  const { data: session } = useSession();
  const [ordens, setOrdens] = useState<OrdemTecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [obsModal, setObsModal] = useState<{ ordemId: string; obs: string } | null>(null);

  const fetchOrdens = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ data: selectedDate });
      const res = await fetch(`/api/tecnico/ordens?${params}`, { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setOrdens(json.ordens || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchOrdens();
  }, [fetchOrdens]);

  const updateStatus = async (ordemId: string, status: string, obsTecnico?: string) => {
    try {
      setUpdating(ordemId);
      const body: any = { ordemId, status };
      if (obsTecnico !== undefined) body.obsTecnico = obsTecnico;

      const res = await fetch("/api/tecnico/ordens", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchOrdens();
      }
    } finally {
      setUpdating(null);
    }
  };

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];
  const totalOS = ordens.length;
  const concluidas = ordens.filter((o) => o.status === "concluida" || o.status === "faturada").length;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-3 bg-blue-500/10 border border-blue-500/20 text-center">
          <div className="text-2xl font-bold text-blue-400">{totalOS}</div>
          <div className="text-xs text-dark-400">Total OS</div>
        </div>
        <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-500/20 text-center">
          <div className="text-2xl font-bold text-emerald-400">{concluidas}</div>
          <div className="text-xs text-dark-400">Concluidas</div>
        </div>
        <div className="rounded-xl p-3 bg-amber-500/10 border border-amber-500/20 text-center">
          <div className="text-2xl font-bold text-amber-400">{totalOS - concluidas}</div>
          <div className="text-xs text-dark-400">Pendentes</div>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="flex items-center justify-between bg-dark-800/50 rounded-xl border border-dark-700 p-3">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-sm font-medium text-white">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
          {isToday && <span className="text-xs text-brand-400">Hoje</span>}
        </div>
        <button onClick={() => changeDate(1)} className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
        </div>
      ) : ordens.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400 text-lg">Nenhuma OS para esta data</p>
          <p className="text-dark-500 text-sm mt-1">Selecione outra data ou aguarde novos agendamentos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ordens.map((os) => {
            const cfg = statusConfig[os.status] || statusConfig.aberta;
            const StatusIcon = cfg.icon;
            const isConcluida = os.status === "concluida" || os.status === "faturada";

            return (
              <div
                key={os.id}
                className={`rounded-xl border p-4 transition-colors ${
                  isConcluida
                    ? "bg-dark-800/30 border-dark-700 opacity-70"
                    : "bg-dark-800/50 border-dark-700 hover:border-brand-500/20"
                }`}
              >
                {/* OS Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">OS #{os.numero}</span>
                    <span className={`badge text-xs ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" /> {cfg.label}
                    </span>
                  </div>
                  {os.horaInicio && (
                    <span className="text-xs text-dark-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {os.horaInicio}
                      {os.horaFim && ` - ${os.horaFim}`}
                    </span>
                  )}
                </div>

                {/* Service Info */}
                <div className="mb-3">
                  <p className="text-brand-400 font-medium text-sm">
                    {os.servico?.nome || os.descricao || "Servico"}
                  </p>
                  {os.servico?.duracaoMin && (
                    <p className="text-xs text-dark-500">Duracao estimada: {os.servico.duracaoMin} min</p>
                  )}
                </div>

                {/* Client Info */}
                <div className="bg-dark-900/50 rounded-lg p-3 mb-3 space-y-2">
                  <p className="text-white text-sm font-medium">{os.cliente.nome}</p>
                  {os.cliente.endereco && (
                    <p className="text-dark-400 text-xs flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {os.cliente.endereco}
                      {os.cliente.numero && `, ${os.cliente.numero}`}
                      {os.cliente.bairro && ` - ${os.cliente.bairro}`}
                      {os.cliente.cidade && ` - ${os.cliente.cidade}`}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    {os.cliente.telefone && (
                      <a
                        href={`tel:${os.cliente.telefone}`}
                        className="flex items-center gap-1 text-xs text-dark-400 hover:text-white transition-colors"
                      >
                        <Phone className="w-3 h-3" /> {os.cliente.telefone}
                      </a>
                    )}
                    {os.cliente.whatsapp && (
                      <a
                        href={`https://wa.me/55${os.cliente.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    )}
                    {os.cliente.endereco && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${os.cliente.endereco} ${os.cliente.numero || ""} ${os.cliente.cidade || ""}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Navigation className="w-3 h-3" /> Navegar
                      </a>
                    )}
                  </div>
                </div>

                {/* Technician Observations */}
                {os.obsTecnico && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2 mb-3">
                    <p className="text-xs text-amber-400">{os.obsTecnico}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {!isConcluida && os.status !== "cancelada" && (
                  <div className="flex items-center gap-2 pt-2 border-t border-dark-700">
                    {os.status === "aberta" && (
                      <button
                        onClick={() => updateStatus(os.id, "em_deslocamento")}
                        disabled={updating === os.id}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm font-medium hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                      >
                        {updating === os.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Truck className="w-4 h-4" />
                        )}
                        A Caminho
                      </button>
                    )}
                    {os.status === "em_deslocamento" && (
                      <button
                        onClick={() => updateStatus(os.id, "em_andamento")}
                        disabled={updating === os.id}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                      >
                        {updating === os.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        Iniciar Servico
                      </button>
                    )}
                    {os.status === "em_andamento" && (
                      <>
                        <button
                          onClick={() => setObsModal({ ordemId: os.id, obs: os.obsTecnico || "" })}
                          className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg bg-dark-700 text-dark-300 text-sm hover:bg-dark-600 transition-colors"
                        >
                          <ClipboardList className="w-4 h-4" /> Obs
                        </button>
                        <button
                          onClick={() => updateStatus(os.id, "concluida")}
                          disabled={updating === os.id}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                        >
                          {updating === os.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Concluir
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Observations Modal */}
      {obsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setObsModal(null)} />
          <div className="relative bg-dark-900 border border-dark-700 rounded-t-2xl sm:rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-6 py-4 border-b border-dark-700">
              <h3 className="text-white font-semibold">Observacoes do Tecnico</h3>
            </div>
            <div className="p-6">
              <textarea
                value={obsModal.obs}
                onChange={(e) => setObsModal({ ...obsModal, obs: e.target.value })}
                className="input-field w-full h-32 resize-none"
                placeholder="Descreva observacoes sobre o servico, problemas encontrados, produtos usados..."
              />
            </div>
            <div className="px-6 py-4 border-t border-dark-700 flex justify-end gap-3">
              <button onClick={() => setObsModal(null)} className="btn-ghost">
                Cancelar
              </button>
              <button
                onClick={() => {
                  updateStatus(obsModal.ordemId, "em_andamento", obsModal.obs);
                  setObsModal(null);
                }}
                className="btn-primary"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
