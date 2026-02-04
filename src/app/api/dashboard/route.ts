import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const tenantId = (session.user as any).tenantId;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const em7dias = new Date(hoje);
  em7dias.setDate(em7dias.getDate() + 7);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const [
    clientesAtivos,
    osDoDiaCount,
    osAbertas,
    servicosVencendo,
    receitasMes,
    despesasMes,
    osPorStatusRaw,
    receitaMensalRaw,
    servicosVencendoList,
    osDoDiaList,
  ] = await Promise.all([
    prisma.cliente.count({ where: { tenantId, status: "ativo" } }),
    prisma.ordemServico.count({
      where: { tenantId, dataExecucao: { gte: hoje, lt: amanha } },
    }),
    prisma.ordemServico.count({
      where: { tenantId, status: { in: ["aberta", "em_deslocamento", "em_andamento"] } },
    }),
    prisma.contrato.count({
      where: { tenantId, status: "ativo", proximoServico: { lte: em7dias } },
    }),
    prisma.financeiro.aggregate({
      where: { tenantId, tipo: "receita", status: "pago", dataPagamento: { gte: inicioMes } },
      _sum: { valor: true },
    }),
    prisma.financeiro.aggregate({
      where: { tenantId, tipo: "despesa", status: "pago", dataPagamento: { gte: inicioMes } },
      _sum: { valor: true },
    }),
    prisma.ordemServico.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: true,
    }),
    prisma.financeiro.findMany({
      where: { tenantId, tipo: "receita", status: "pago", dataPagamento: { not: null } },
      select: { valor: true, dataPagamento: true },
    }),
    prisma.contrato.findMany({
      where: { tenantId, status: "ativo", proximoServico: { lte: em7dias } },
      include: { cliente: { select: { nome: true, telefone: true } }, servico: { select: { nome: true } } },
      orderBy: { proximoServico: "asc" },
      take: 10,
    }),
    prisma.ordemServico.findMany({
      where: { tenantId, dataExecucao: { gte: hoje, lt: amanha } },
      include: {
        cliente: { select: { nome: true, endereco: true, numero: true, bairro: true } },
        tecnico: { select: { nome: true } },
        servico: { select: { nome: true } },
      },
      orderBy: { horaInicio: "asc" },
    }),
  ]);

  const receitas = receitasMes._sum.valor || 0;
  const despesas = despesasMes._sum.valor || 0;

  // Agrupar receita por mês
  const receitaPorMes: Record<string, number> = {};
  receitaMensalRaw.forEach((f) => {
    if (f.dataPagamento) {
      const mes = f.dataPagamento.toISOString().substring(0, 7);
      receitaPorMes[mes] = (receitaPorMes[mes] || 0) + f.valor;
    }
  });
  const receitaMensal = Object.entries(receitaPorMes)
    .map(([mes, total]) => ({ mes, total }))
    .sort((a, b) => a.mes.localeCompare(b.mes))
    .slice(-6);

  const osPorStatus = osPorStatusRaw.map((s) => ({
    status: s.status,
    total: s._count,
  }));

  return NextResponse.json({
    stats: {
      clientesAtivos,
      osDoDia: osDoDiaCount,
      osAbertas,
      servicosVencendo,
      receitaMensal: receitas,
      despesaMensal: despesas,
      lucroMensal: receitas - despesas,
    },
    osPorStatus,
    receitaMensal,
    servicosVencendo: servicosVencendoList,
    osDoDia: osDoDiaList,
  });
}
