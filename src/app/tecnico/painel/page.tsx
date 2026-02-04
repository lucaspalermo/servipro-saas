"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Play,
  Truck,
  Check,
  LogOut,
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
};

export default function TecnicoPainelPage() {
  const router = useRouter();
  const [ordens, setOrdens] = useState<OrdemTecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [tecnico, setTecnico] = useState<any>(null);
  const [obsModal, setObsModal] = useState<{ ordemId: string; obs: string } | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("tecnico_data");
    const token = localStorage.getItem("tecnico_token");
    if (!data || !token) { router.push("/tecnico/login"); return; }
    setTecnico(JSON.parse(data));
  }, [router]);

  const fetchOrdens = useCallback(async () => {
    const token = localStorage.getItem("tecnico_token");
    if (!token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({ data: selectedDate });
      const res = await fetch(`/api/tecnico/painel?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setOrdens(json.ordens || []);
      } else if (res.status === 401) {
        localStorage.removeItem("tecnico_token");
        localStorage.removeItem("tecnico_data");
        router.push("/tecnico/login");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, router]);

  useEffect(() => { fetchOrdens(); }, [fetchOrdens]);

  const updateStatus = async (ordemId: string, status: string, obsTecnico?: string) => {
    const token = localStorage.getItem("tecnico_token");
    if (!token) return;
    try {
      setUpdating(ordemId);
      const body: any = { ordemId, status };
      if (obsTecnico !== undefined) body.obsTecnico = obsTecnico;
      await fetch("/api/tecnico/painel", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      fetchOrdens();
    } finally { setUpdating(null); }
  };

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleLogout = () => {
    localStorage.removeItem("tecnico_token");
    localStorage.removeItem("tecnico_data");
    router.push("/tecnico/login");
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];
  const concluidas = ordens.filter((o) => o.status === "concluida" || o.status === "faturada").length;

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="bg-dark-900 border-b border-dark-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">{tecnico?.nome || "Tecnico"}</div>
            <div className="text-xs text-dark-500">{tecnico?.tenantNome}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 text-dark-400 hover:text-red-400 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl p-3 bg-blue-500/10 border border-blue-500/20 text-center">
            <div className="text-2xl font-bold text-blue-400">{ordens.length}</div>
            <div className="text-xs text-dark-400">Total</div>
          </div>
          <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-2xl font-bold text-emerald-400">{concluidas}</div>
            <div className="text-xs text-dark-400">Feitas</div>
          </div>
          <div className="rounded-xl p-3 bg-amber-500/10 border border-amber-500/20 text-center">
            <div className="text-2xl font-bold text-amber-400">{ordens.length - concluidas}</div>
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
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            {isToday && <span className="text-xs text-brand-400">Hoje</span>}
          </div>
          <button onClick={() => changeDate(1)} className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
          </div>
        ) : ordens.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400">Nenhuma OS para esta data</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ordens.map((os) => {
              const cfg = statusConfig[os.status] || statusConfig.aberta;
              const StatusIcon = cfg.icon;
              const isConcluida = os.status === "concluida" || os.status === "faturada";
              return (
                <div key={os.id} className={`rounded-xl border p-4 transition-colors ${isConcluida ? "bg-dark-800/30 border-dark-700 opacity-60" : "bg-dark-800/50 border-dark-700"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">OS #{os.numero}</span>
                      <span className={`badge text-xs ${cfg.color}`}><StatusIcon className="w-3 h-3" /> {cfg.label}</span>
                    </div>
                    {os.horaInicio && <span className="text-xs text-dark-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {os.horaInicio}</span>}
                  </div>
                  <p className="text-brand-400 font-medium text-sm mb-2">{os.servico?.nome || os.descricao || "Servico"}</p>
                  <div className="bg-dark-900/50 rounded-lg p-3 mb-3 space-y-2">
                    <p className="text-white text-sm font-medium">{os.cliente.nome}</p>
                    {os.cliente.endereco && (
                      <p className="text-dark-400 text-xs flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {os.cliente.endereco}{os.cliente.numero && `, ${os.cliente.numero}`}{os.cliente.bairro && ` - ${os.cliente.bairro}`}
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      {os.cliente.telefone && <a href={`tel:${os.cliente.telefone}`} className="flex items-center gap-1 text-xs text-dark-400 hover:text-white"><Phone className="w-3 h-3" /> Ligar</a>}
                      {os.cliente.whatsapp && <a href={`https://wa.me/55${os.cliente.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-emerald-400"><MessageCircle className="w-3 h-3" /> WhatsApp</a>}
                      {os.cliente.endereco && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${os.cliente.endereco} ${os.cliente.numero || ""} ${os.cliente.cidade || ""}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400"><Navigation className="w-3 h-3" /> Mapa</a>}
                    </div>
                  </div>
                  {!isConcluida && os.status !== "cancelada" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-dark-700">
                      {os.status === "aberta" && (
                        <button onClick={() => updateStatus(os.id, "em_deslocamento")} disabled={updating === os.id} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm font-medium disabled:opacity-50">
                          {updating === os.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />} A Caminho
                        </button>
                      )}
                      {os.status === "em_deslocamento" && (
                        <button onClick={() => updateStatus(os.id, "em_andamento")} disabled={updating === os.id} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm font-medium disabled:opacity-50">
                          {updating === os.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Iniciar
                        </button>
                      )}
                      {os.status === "em_andamento" && (
                        <>
                          <button onClick={() => setObsModal({ ordemId: os.id, obs: os.obsTecnico || "" })} className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg bg-dark-700 text-dark-300 text-sm">
                            <ClipboardList className="w-4 h-4" /> Obs
                          </button>
                          <button onClick={() => updateStatus(os.id, "concluida")} disabled={updating === os.id} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium disabled:opacity-50">
                            {updating === os.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Concluir
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
      </div>

      {/* Obs Modal */}
      {obsModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setObsModal(null)} />
          <div className="relative bg-dark-900 border border-dark-700 rounded-t-2xl w-full max-w-lg shadow-2xl">
            <div className="px-6 py-4 border-b border-dark-700">
              <h3 className="text-white font-semibold">Observacoes</h3>
            </div>
            <div className="p-6">
              <textarea value={obsModal.obs} onChange={(e) => setObsModal({ ...obsModal, obs: e.target.value })} className="input-field w-full h-32 resize-none" placeholder="Observacoes sobre o servico..." />
            </div>
            <div className="px-6 py-4 border-t border-dark-700 flex justify-end gap-3">
              <button onClick={() => setObsModal(null)} className="btn-ghost">Cancelar</button>
              <button onClick={() => { updateStatus(obsModal.ordemId, "em_andamento", obsModal.obs); setObsModal(null); }} className="btn-primary">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
