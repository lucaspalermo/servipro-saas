"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Loader2,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  ClipboardList,
  Edit2,
  Trash2,
} from "lucide-react";
import { formatDate, statusColors } from "@/lib/utils";

interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  servicoId?: string;
  servicoNome: string;
  tecnicoId?: string;
  tecnicoNome: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  observacoes?: string;
  recorrente: boolean;
  status: string;
}

const emptyAgendamento: Omit<Agendamento, "id"> = {
  clienteId: "",
  clienteNome: "",
  servicoId: "",
  servicoNome: "",
  tecnicoId: "",
  tecnicoNome: "",
  data: "",
  horaInicio: "08:00",
  horaFim: "09:00",
  observacoes: "",
  recorrente: false,
  status: "agendado",
};

const statusLabels: Record<string, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
  concluido: "Concluido",
};

const eventColors: Record<string, string> = {
  agendado: "bg-blue-500",
  confirmado: "bg-emerald-500",
  cancelado: "bg-red-500",
  concluido: "bg-brand-500",
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function AgendaPage() {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editing, setEditing] = useState<Agendamento | null>(null);
  const [viewing, setViewing] = useState<Agendamento | null>(null);
  const [form, setForm] = useState(emptyAgendamento);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Selects
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([]);
  const [servicos, setServicos] = useState<{ id: string; nome: string }[]>([]);
  const [tecnicos, setTecnicos] = useState<{ id: string; nome: string }[]>([]);

  const showAlertMsg = (type: "success" | "error", msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Padding from previous month
    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Padding for next month to fill grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  const fetchAgendamentos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        mes: String(month + 1),
        ano: String(year),
      });
      const res = await fetch(`/api/agendamentos?${params}`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setAgendamentos(json.data || json.agendamentos || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

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
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  useEffect(() => {
    fetchSelects();
  }, [fetchSelects]);

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return agendamentos.filter((a) => a.data?.split("T")[0] === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const goToToday = () => setCurrentDate(new Date());
  const goToPrevMonth = () =>
    setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1));

  const openCreateOnDate = (date: Date) => {
    setEditing(null);
    setForm({
      ...emptyAgendamento,
      data: date.toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const openEdit = (ag: Agendamento) => {
    setEditing(ag);
    setForm({
      clienteId: ag.clienteId,
      clienteNome: ag.clienteNome,
      servicoId: ag.servicoId || "",
      servicoNome: ag.servicoNome,
      tecnicoId: ag.tecnicoId || "",
      tecnicoNome: ag.tecnicoNome,
      data: ag.data?.split("T")[0] || "",
      horaInicio: ag.horaInicio || "08:00",
      horaFim: ag.horaFim || "09:00",
      observacoes: ag.observacoes || "",
      recorrente: ag.recorrente || false,
      status: ag.status,
    });
    setShowModal(true);
  };

  const openView = (ag: Agendamento) => {
    setViewing(ag);
    setShowViewModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `/api/agendamentos/${editing.id}`
        : "/api/agendamentos";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showAlertMsg(
          "success",
          editing
            ? "Agendamento atualizado!"
            : "Agendamento criado!"
        );
        setShowModal(false);
        fetchAgendamentos();
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
    if (!confirm("Excluir este agendamento?")) return;
    try {
      const res = await fetch(`/api/agendamentos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showAlertMsg("success", "Agendamento excluido!");
        fetchAgendamentos();
        setShowViewModal(false);
      } else {
        showAlertMsg("error", "Erro ao excluir.");
      }
    } catch {
      showAlertMsg("error", "Erro de conexao.");
    }
  };

  const handleGerarOS = async (ag: Agendamento) => {
    try {
      const res = await fetch("/api/ordens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          data: ag.data,
          clienteId: ag.clienteId,
          clienteNome: ag.clienteNome,
          servicoId: ag.servicoId,
          servicoNome: ag.servicoNome,
          tecnicoId: ag.tecnicoId,
          tecnicoNome: ag.tecnicoNome,
          status: "aberta",
          valor: 0,
          agendamentoId: ag.id,
        }),
      });
      if (res.ok) {
        showAlertMsg("success", "OS gerada com sucesso!");
      } else {
        showAlertMsg("error", "Erro ao gerar OS.");
      }
    } catch {
      showAlertMsg("error", "Erro de conexao.");
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

      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">
            {MONTHS[month]} {year}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevMonth}
              className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-dark-300 hover:text-white hover:bg-dark-800 transition-colors border border-dark-700"
            >
              Hoje
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button
          onClick={() => openCreateOnDate(new Date())}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Novo Agendamento
        </button>
      </div>

      {/* Calendar */}
      <div className="card overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
          </div>
        )}

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-dark-700">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-xs font-medium text-dark-400 uppercase"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            const events = getEventsForDate(day.date);
            const today = isToday(day.date);

            return (
              <div
                key={i}
                onClick={() => openCreateOnDate(day.date)}
                className={`
                  min-h-[100px] sm:min-h-[120px] p-1.5 border-b border-r border-dark-800 cursor-pointer
                  hover:bg-dark-800/30 transition-colors
                  ${!day.isCurrentMonth ? "opacity-30" : ""}
                `}
              >
                <div
                  className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    today
                      ? "bg-brand-500 text-white"
                      : "text-dark-300"
                  }`}
                >
                  {day.date.getDate()}
                </div>
                <div className="space-y-0.5">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        openView(event);
                      }}
                      className={`
                        ${eventColors[event.status] || "bg-dark-600"}
                        rounded px-1.5 py-0.5 text-[10px] text-white truncate cursor-pointer
                        hover:opacity-80 transition-opacity
                      `}
                      title={`${event.horaInicio} - ${event.clienteNome}`}
                    >
                      {event.horaInicio} {event.clienteNome}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-[10px] text-dark-400 px-1">
                      +{events.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(statusLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                eventColors[key] || "bg-dark-600"
              }`}
            />
            <span className="text-xs text-dark-400">{label}</span>
          </div>
        ))}
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
                {editing ? "Editar Agendamento" : "Novo Agendamento"}
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
                <div className="sm:col-span-2">
                  <label className="block text-sm text-dark-400 mb-1">
                    Cliente *
                  </label>
                  <select
                    value={form.clienteId}
                    onChange={(e) => {
                      const c = clientes.find(
                        (x) => x.id === e.target.value
                      );
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
                  <label className="block text-sm text-dark-400 mb-1">
                    Servico *
                  </label>
                  <select
                    value={form.servicoId}
                    onChange={(e) => {
                      const s = servicos.find(
                        (x) => x.id === e.target.value
                      );
                      setForm({
                        ...form,
                        servicoId: e.target.value,
                        servicoNome: s?.nome || "",
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
                  <label className="block text-sm text-dark-400 mb-1">
                    Tecnico
                  </label>
                  <select
                    value={form.tecnicoId}
                    onChange={(e) => {
                      const t = tecnicos.find(
                        (x) => x.id === e.target.value
                      );
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
                  <label className="block text-sm text-dark-400 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={form.data}
                    onChange={(e) =>
                      setForm({ ...form, data: e.target.value })
                    }
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={form.horaInicio}
                    onChange={(e) =>
                      setForm({ ...form, horaInicio: e.target.value })
                    }
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">
                    Hora Fim
                  </label>
                  <input
                    type="time"
                    value={form.horaFim}
                    onChange={(e) =>
                      setForm({ ...form, horaFim: e.target.value })
                    }
                    className="input-field w-full"
                  />
                </div>
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

              <label className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.recorrente}
                  onChange={(e) =>
                    setForm({ ...form, recorrente: e.target.checked })
                  }
                  className="accent-brand-500 w-4 h-4"
                />
                Agendamento recorrente
              </label>
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
                  saving || !form.clienteId || !form.data
                }
                className="btn-primary"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Salvar" : "Criar Agendamento"}
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
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-400" />
                Detalhes do Agendamento
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className={`badge text-xs ${
                    statusColors[viewing.status] ||
                    "bg-dark-700 text-dark-300"
                  }`}
                >
                  {statusLabels[viewing.status] || viewing.status}
                </span>
                {viewing.recorrente && (
                  <span className="badge text-xs bg-purple-500/10 text-purple-400">
                    Recorrente
                  </span>
                )}
              </div>

              <div className="space-y-3">
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
                  <p className="text-sm text-white">
                    {viewing.tecnicoNome || "-"}
                  </p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <span className="text-xs text-dark-500">Data</span>
                    <p className="text-sm text-white">
                      {formatDate(viewing.data)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-dark-500">Horario</span>
                    <p className="text-sm text-white">
                      {viewing.horaInicio} - {viewing.horaFim}
                    </p>
                  </div>
                </div>
                {viewing.observacoes && (
                  <div>
                    <span className="text-xs text-dark-500">Observacoes</span>
                    <p className="text-sm text-dark-300">
                      {viewing.observacoes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-dark-700 px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => handleGerarOS(viewing)}
                className="btn-primary text-sm"
              >
                <ClipboardList className="w-4 h-4" /> Gerar OS
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEdit(viewing);
                  }}
                  className="p-2 rounded-lg text-dark-400 hover:text-amber-400 hover:bg-dark-800 transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(viewing.id)}
                  className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-dark-800 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
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
