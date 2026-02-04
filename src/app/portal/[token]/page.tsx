"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle,
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  Loader2,
  AlertTriangle,
  Phone,
  Mail,
} from "lucide-react";

interface PortalData {
  cliente: { nome: string; email?: string };
  empresa: { nome: string; telefone?: string; email?: string; segmento?: string };
  ordens: Array<{
    id: string;
    numero: string;
    status: string;
    valor: number;
    descricao?: string;
    dataExecucao?: string;
    horaInicio?: string;
    horaFim?: string;
    obsTecnico?: string;
    createdAt: string;
    servico?: { nome: string };
    tecnico?: { nome: string };
  }>;
  agendamentos: Array<{
    id: string;
    dataAgendada: string;
    horaInicio?: string;
    horaFim?: string;
    status: string;
    servico?: { nome: string };
    tecnico?: { nome: string };
  }>;
  contratos: Array<{
    id: string;
    descricao?: string;
    valorMensal: number;
    recorrenciaDias: number;
    proximoServico?: string;
    status: string;
    servico?: { nome: string };
  }>;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  aberta: { label: "Aberta", color: "bg-blue-500/10 text-blue-400" },
  em_andamento: { label: "Em Andamento", color: "bg-amber-500/10 text-amber-400" },
  em_deslocamento: { label: "Em Deslocamento", color: "bg-purple-500/10 text-purple-400" },
  concluida: { label: "Concluida", color: "bg-emerald-500/10 text-emerald-400" },
  faturada: { label: "Faturada", color: "bg-emerald-500/10 text-emerald-400" },
  cancelada: { label: "Cancelada", color: "bg-red-500/10 text-red-400" },
  agendado: { label: "Agendado", color: "bg-blue-500/10 text-blue-400" },
  confirmado: { label: "Confirmado", color: "bg-emerald-500/10 text-emerald-400" },
};

function formatDate(d: string | undefined | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("pt-BR");
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

export default function PortalPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"proximos" | "historico" | "contratos">("proximos");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/portal/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Portal nao encontrado");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Portal nao encontrado ou link invalido."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Portal nao encontrado</h1>
          <p className="text-dark-400">{error || "O link que voce acessou e invalido ou expirou."}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "proximos" as const, label: "Proximos Servicos", icon: Calendar, count: data.agendamentos.length },
    { id: "historico" as const, label: "Historico", icon: ClipboardList, count: data.ordens.length },
    { id: "contratos" as const, label: "Contratos", icon: FileText, count: data.contratos.length },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="bg-dark-900 border-b border-dark-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{data.empresa.nome}</h1>
              <p className="text-xs text-dark-400">Portal do Cliente</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-dark-400">
            {data.empresa.telefone && (
              <a href={`tel:${data.empresa.telefone}`} className="flex items-center gap-1 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5" /> {data.empresa.telefone}
              </a>
            )}
            {data.empresa.email && (
              <a href={`mailto:${data.empresa.email}`} className="flex items-center gap-1 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5" /> {data.empresa.email}
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="card mb-6">
          <p className="text-dark-400 text-sm">Bem-vindo(a),</p>
          <p className="text-xl font-bold text-white">{data.cliente.nome}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id
                  ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                  : "text-dark-400 hover:text-white hover:bg-dark-800/60 border border-transparent"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.count > 0 && (
                <span className="bg-dark-700 text-dark-300 text-xs px-1.5 py-0.5 rounded-full">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Proximos Servicos */}
        {tab === "proximos" && (
          <div className="space-y-4">
            {data.agendamentos.length === 0 ? (
              <div className="card text-center py-12">
                <Calendar className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">Nenhum servico agendado.</p>
              </div>
            ) : (
              data.agendamentos.map((ag) => (
                <div key={ag.id} className="card hover:border-brand-500/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-white font-medium">{ag.servico?.nome || "Servico"}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-dark-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {formatDate(ag.dataAgendada)}
                        </span>
                        {ag.horaInicio && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {ag.horaInicio}{ag.horaFim ? ` - ${ag.horaFim}` : ""}
                          </span>
                        )}
                      </div>
                      {ag.tecnico && (
                        <p className="text-xs text-dark-500 mt-1">Tecnico: {ag.tecnico.nome}</p>
                      )}
                    </div>
                    <span className={`badge text-xs ${statusLabels[ag.status]?.color || "bg-dark-700 text-dark-300"}`}>
                      {statusLabels[ag.status]?.label || ag.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Historico */}
        {tab === "historico" && (
          <div className="space-y-4">
            {data.ordens.length === 0 ? (
              <div className="card text-center py-12">
                <ClipboardList className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">Nenhuma ordem de servico encontrada.</p>
              </div>
            ) : (
              data.ordens.map((os) => (
                <div key={os.id} className="card hover:border-brand-500/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">OS #{os.numero}</h3>
                        <span className={`badge text-xs ${statusLabels[os.status]?.color || "bg-dark-700 text-dark-300"}`}>
                          {statusLabels[os.status]?.label || os.status}
                        </span>
                      </div>
                      <p className="text-sm text-dark-400 mt-1">
                        {os.servico?.nome || os.descricao || "Servico"}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-dark-500">
                        <span>{formatDate(os.dataExecucao || os.createdAt)}</span>
                        {os.tecnico && <span>Tecnico: {os.tecnico.nome}</span>}
                      </div>
                      {os.obsTecnico && (
                        <p className="text-xs text-dark-500 mt-2 bg-dark-800/50 rounded-lg p-2">
                          {os.obsTecnico}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-brand-400 font-medium text-sm">
                        {formatCurrency(os.valor)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Contratos */}
        {tab === "contratos" && (
          <div className="space-y-4">
            {data.contratos.length === 0 ? (
              <div className="card text-center py-12">
                <FileText className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">Nenhum contrato ativo.</p>
              </div>
            ) : (
              data.contratos.map((ct) => (
                <div key={ct.id} className="card hover:border-brand-500/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-white font-medium">
                        {ct.servico?.nome || ct.descricao || "Contrato"}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-dark-400">
                        <span>A cada {ct.recorrenciaDias} dias</span>
                        <span>{formatCurrency(ct.valorMensal)}/mensal</span>
                      </div>
                      {ct.proximoServico && (
                        <p className="text-xs text-brand-400 mt-2 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Proximo servico: {formatDate(ct.proximoServico)}
                        </p>
                      )}
                    </div>
                    <span className="badge text-xs bg-emerald-500/10 text-emerald-400">Ativo</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-dark-500 text-xs">
          <p>Portal do Cliente - {data.empresa.nome}</p>
          <p className="mt-1">Powered by Servicfy</p>
        </div>
      </footer>
    </div>
  );
}
