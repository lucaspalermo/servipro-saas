import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: "Token obrigatorio" }, { status: 400 });
  }

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { portalToken: token },
      include: {
        tenant: {
          select: { nome: true, telefone: true, email: true, segmento: true },
        },
        ordens: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            numero: true,
            status: true,
            valor: true,
            descricao: true,
            dataExecucao: true,
            horaInicio: true,
            horaFim: true,
            obsTecnico: true,
            createdAt: true,
            servico: { select: { nome: true } },
            tecnico: { select: { nome: true } },
          },
        },
        agendamentos: {
          where: {
            status: { in: ["agendado", "confirmado"] },
            dataAgendada: { gte: new Date() },
          },
          orderBy: { dataAgendada: "asc" },
          take: 10,
          select: {
            id: true,
            dataAgendada: true,
            horaInicio: true,
            horaFim: true,
            status: true,
            servico: { select: { nome: true } },
            tecnico: { select: { nome: true } },
          },
        },
        contratos: {
          where: { status: "ativo" },
          select: {
            id: true,
            descricao: true,
            valorMensal: true,
            recorrenciaDias: true,
            proximoServico: true,
            status: true,
            servico: { select: { nome: true } },
          },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json({ error: "Portal nao encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      cliente: {
        nome: cliente.nome,
        email: cliente.email,
      },
      empresa: cliente.tenant,
      ordens: cliente.ordens,
      agendamentos: cliente.agendamentos,
      contratos: cliente.contratos,
    });
  } catch (error) {
    console.error("[Portal] Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
