import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const url = req.nextUrl.searchParams;

  const where: any = { tenantId };
  const inicio = url.get("inicio");
  const fim = url.get("fim");
  const tecnicoId = url.get("tecnicoId");

  if (inicio || fim) {
    where.dataAgendada = {};
    if (inicio) where.dataAgendada.gte = new Date(inicio);
    if (fim) where.dataAgendada.lte = new Date(fim + "T23:59:59");
  }
  if (tecnicoId) where.tecnicoId = tecnicoId;

  const data = await prisma.agendamento.findMany({
    where,
    include: {
      cliente: { select: { nome: true, telefone: true, endereco: true, numero: true, bairro: true } },
      tecnico: { select: { nome: true } },
      servico: { select: { nome: true } },
    },
    orderBy: [{ dataAgendada: "asc" }, { horaInicio: "asc" }],
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const body = await req.json();

  if (!body.clienteId || !body.dataAgendada)
    return NextResponse.json({ error: "Cliente e data obrigatórios" }, { status: 400 });

  const agendamento = await prisma.agendamento.create({
    data: {
      tenantId,
      clienteId: body.clienteId,
      servicoId: body.servicoId || null,
      tecnicoId: body.tecnicoId || null,
      dataAgendada: new Date(body.dataAgendada),
      horaInicio: body.horaInicio || null,
      horaFim: body.horaFim || null,
      observacoes: body.observacoes || null,
      recorrente: body.recorrente || false,
    },
  });

  return NextResponse.json(agendamento, { status: 201 });
}
