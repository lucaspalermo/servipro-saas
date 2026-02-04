import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;

  const os = await prisma.ordemServico.findFirst({
    where: { id, tenantId },
    include: {
      cliente: true,
      tecnico: { select: { nome: true } },
      servico: { select: { nome: true } },
      contrato: { select: { descricao: true, valorMensal: true } },
    },
  });

  if (!os) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  return NextResponse.json(os);
}

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
  if (body.dataExecucao) data.dataExecucao = new Date(body.dataExecucao);
  if (body.horaInicio !== undefined) data.horaInicio = body.horaInicio;
  if (body.horaFim !== undefined) data.horaFim = body.horaFim;
  if (body.valor !== undefined) data.valor = parseFloat(body.valor);
  if (body.descricao !== undefined) data.descricao = body.descricao;
  if (body.obsTecnico !== undefined) data.obsTecnico = body.obsTecnico;
  if (body.assinatura !== undefined) data.assinatura = body.assinatura;

  await prisma.ordemServico.updateMany({ where: { id, tenantId }, data });
  return NextResponse.json({ message: "Atualizada" });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;

  await prisma.ordemServico.updateMany({
    where: { id, tenantId },
    data: { status: "cancelada" },
  });
  return NextResponse.json({ message: "Cancelada" });
}
