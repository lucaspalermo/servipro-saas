import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;

  const tecnico = await prisma.tecnico.findFirst({ where: { id, tenantId } });
  if (!tecnico) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(tecnico);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;
  const body = await req.json();

  const data: any = {};
  for (const key of ["nome", "telefone", "email", "cpf", "regiao", "especialidades"]) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if (body.comissao !== undefined) data.comissao = parseFloat(body.comissao);
  if (body.ativo !== undefined) data.ativo = body.ativo;

  await prisma.tecnico.updateMany({ where: { id, tenantId }, data });
  return NextResponse.json({ message: "Atualizado" });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;

  await prisma.tecnico.updateMany({ where: { id, tenantId }, data: { ativo: false } });
  return NextResponse.json({ message: "Desativado" });
}
