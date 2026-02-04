import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOSNumber } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;
  const body = await req.json();

  const data: any = {};
  if (body.status) data.status = body.status;
  if (body.tecnicoId !== undefined) data.tecnicoId = body.tecnicoId;
  if (body.servicoId !== undefined) data.servicoId = body.servicoId;
  if (body.dataAgendada) data.dataAgendada = new Date(body.dataAgendada);
  if (body.horaInicio !== undefined) data.horaInicio = body.horaInicio;
  if (body.horaFim !== undefined) data.horaFim = body.horaFim;
  if (body.observacoes !== undefined) data.observacoes = body.observacoes;

  await prisma.agendamento.updateMany({ where: { id, tenantId }, data });
  return NextResponse.json({ message: "Atualizado" });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;

  await prisma.agendamento.updateMany({
    where: { id, tenantId },
    data: { status: "cancelado" },
  });
  return NextResponse.json({ message: "Cancelado" });
}

// POST = Gerar OS a partir do agendamento
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;

  const agendamento = await prisma.agendamento.findFirst({
    where: { id, tenantId },
  });
  if (!agendamento) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const existing = await prisma.ordemServico.findFirst({
    where: { agendamentoId: agendamento.id },
  });
  if (existing)
    return NextResponse.json({ error: "OS já gerada", osId: existing.id }, { status: 400 });

  const count = await prisma.ordemServico.count({ where: { tenantId } });
  const numero = generateOSNumber(count + 1);

  const os = await prisma.ordemServico.create({
    data: {
      tenantId,
      numero,
      agendamentoId: agendamento.id,
      clienteId: agendamento.clienteId,
      tecnicoId: agendamento.tecnicoId,
      servicoId: agendamento.servicoId,
      dataExecucao: agendamento.dataAgendada,
      horaInicio: agendamento.horaInicio,
      horaFim: agendamento.horaFim,
    },
  });

  await prisma.agendamento.update({
    where: { id: agendamento.id },
    data: { status: "confirmado" },
  });

  return NextResponse.json({ id: os.id, numero: os.numero }, { status: 201 });
}
