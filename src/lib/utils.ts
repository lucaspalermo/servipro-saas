import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

export function formatDateISO(date: Date) {
  return date.toISOString().split("T")[0];
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function generateOSNumber(count: number) {
  const year = new Date().getFullYear();
  return `OS-${year}-${String(count).padStart(4, "0")}`;
}

export const statusColors: Record<string, string> = {
  ativo: "bg-emerald-500/10 text-emerald-400",
  inativo: "bg-slate-500/10 text-slate-400",
  inadimplente: "bg-red-500/10 text-red-400",
  aberta: "bg-blue-500/10 text-blue-400",
  em_deslocamento: "bg-amber-500/10 text-amber-400",
  em_andamento: "bg-amber-500/10 text-amber-400",
  concluida: "bg-emerald-500/10 text-emerald-400",
  faturada: "bg-emerald-500/10 text-emerald-300",
  cancelada: "bg-red-500/10 text-red-400",
  agendado: "bg-blue-500/10 text-blue-400",
  confirmado: "bg-emerald-500/10 text-emerald-400",
  cancelado: "bg-red-500/10 text-red-400",
  concluido: "bg-emerald-500/10 text-emerald-400",
  pendente: "bg-amber-500/10 text-amber-400",
  pago: "bg-emerald-500/10 text-emerald-400",
  atrasado: "bg-red-500/10 text-red-400",
  trial: "bg-blue-500/10 text-blue-400",
  starter: "bg-emerald-500/10 text-emerald-400",
  profissional: "bg-purple-500/10 text-purple-400",
  enterprise: "bg-amber-500/10 text-amber-400",
};
