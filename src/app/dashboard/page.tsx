"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  ClipboardList,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency, formatDate, statusColors } from "@/lib/utils";

interface DashboardData {
  stats: {
    clientesAtivos: number;
    osDoDiaCount: number;
    servicosVencendo: number;
    receitaMensal: number;
    despesas: number;
    lucro: number;
  };
  osPorStatus: { name: string; value: number; color: string }[];
  receitaMensal: { mes: string; receita: number; despesa: number }[];
  servicosVencendo: {
    id: string;
    clienteNome: string;
    servico: string;
    dataVencimento: string;
    valor: number;
  }[];
  osDoDia: {
    id: string;
    numero: string;
    clienteNome: string;
    tecnicoNome: string;
    status: string;
  }[];
}

function AnimatedCounter({
  value,
  prefix = "",
  duration = 1200,
}: {
  value: number;
  prefix?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = value;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };

    ref.current = requestAnimationFrame(animate);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [value, duration]);

  if (prefix === "R$") return <>{formatCurrency(display)}</>;
  return (
    <>
      {prefix}
      {display.toLocaleString("pt-BR")}
    </>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* KPI Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="card animate-pulse"
            >
              <div className="h-4 w-20 bg-dark-700 rounded mb-3" />
              <div className="h-8 w-24 bg-dark-700 rounded mb-2" />
              <div className="h-3 w-16 bg-dark-700 rounded" />
            </div>
          ))}
        </div>
        {/* Chart Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-80">
              <div className="h-5 w-32 bg-dark-700 rounded mb-4" />
              <div className="h-full bg-dark-800/50 rounded" />
            </div>
          ))}
        </div>
        {/* List Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 w-40 bg-dark-700 rounded mb-4" />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-10 bg-dark-800/50 rounded mb-2" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-dark-400">
        <AlertTriangle className="w-5 h-5 mr-2" />
        Erro ao carregar dados do dashboard.
      </div>
    );
  }

  const kpis = [
    {
      label: "Clientes Ativos",
      value: data.stats.clientesAtivos,
      icon: Users,
      color: "text-brand-400",
      bg: "bg-brand-500/10",
      prefix: "",
    },
    {
      label: "OS do Dia",
      value: data.stats.osDoDiaCount,
      icon: ClipboardList,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      prefix: "",
    },
    {
      label: "Servicos Vencendo (7d)",
      value: data.stats.servicosVencendo,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      prefix: "",
    },
    {
      label: "Receita Mensal",
      value: data.stats.receitaMensal,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      prefix: "R$",
    },
    {
      label: "Despesas",
      value: data.stats.despesas,
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10",
      prefix: "R$",
    },
    {
      label: "Lucro",
      value: data.stats.lucro,
      icon: DollarSign,
      color: "text-brand-300",
      bg: "bg-brand-500/10",
      prefix: "R$",
    },
  ];

  const statusLabels: Record<string, string> = {
    aberta: "Aberta",
    em_deslocamento: "Em Deslocamento",
    em_andamento: "Em Andamento",
    concluida: "Concluida",
    faturada: "Faturada",
    cancelada: "Cancelada",
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="card-hover group">
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}
              >
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${kpi.color}`}>
              <AnimatedCounter value={kpi.value} prefix={kpi.prefix} />
            </div>
            <div className="text-xs text-dark-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OS por Status - Donut Chart */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4">OS por Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.osPorStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.osPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid #2d2d44",
                    borderRadius: "8px",
                    color: "#e0e0e0",
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "#a0a0b0", fontSize: "12px" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receita Mensal - Bar Chart */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4">Receita Mensal</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.receitaMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: "#a0a0b0", fontSize: 12 }}
                  axisLine={{ stroke: "#2d2d44" }}
                />
                <YAxis
                  tick={{ fill: "#a0a0b0", fontSize: 12 }}
                  axisLine={{ stroke: "#2d2d44" }}
                  tickFormatter={(v) =>
                    `R$${(v / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid #2d2d44",
                    borderRadius: "8px",
                    color: "#e0e0e0",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "#a0a0b0", fontSize: "12px" }}>
                      {value === "receita" ? "Receita" : "Despesa"}
                    </span>
                  )}
                />
                <Bar
                  dataKey="receita"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  name="receita"
                />
                <Bar
                  dataKey="despesa"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  name="despesa"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Servicos Vencendo */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Servicos Vencendo
          </h3>
          {data.servicosVencendo.length === 0 ? (
            <p className="text-dark-500 text-sm py-4 text-center">
              Nenhum servico vencendo nos proximos 7 dias.
            </p>
          ) : (
            <div className="space-y-2">
              {data.servicosVencendo.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 border border-dark-700 hover:border-dark-600 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white truncate">
                      {item.clienteNome}
                    </div>
                    <div className="text-xs text-dark-400">{item.servico}</div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-sm font-medium text-amber-400">
                      {formatDate(item.dataVencimento)}
                    </div>
                    <div className="text-xs text-dark-400">
                      {formatCurrency(item.valor)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* OS do Dia */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-400" />
            OS do Dia
          </h3>
          {data.osDoDia.length === 0 ? (
            <p className="text-dark-500 text-sm py-4 text-center">
              Nenhuma OS agendada para hoje.
            </p>
          ) : (
            <div className="space-y-2">
              {data.osDoDia.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 border border-dark-700 hover:border-dark-600 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white">
                      {item.numero}
                    </div>
                    <div className="text-xs text-dark-400">
                      {item.clienteNome} &middot; {item.tecnicoNome}
                    </div>
                  </div>
                  <span
                    className={`badge text-xs ${
                      statusColors[item.status] || "bg-dark-700 text-dark-300"
                    }`}
                  >
                    {statusLabels[item.status] || item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
