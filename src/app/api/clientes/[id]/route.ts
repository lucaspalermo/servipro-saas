import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;

  const cliente = await prisma.cliente.findFirst({
    where: { id, tenantId },
    include: {
      contratos: { include: { servico: { select: { nome: true } } }, orderBy: { createdAt: "desc" } },
      ordens: {
        include: { tecnico: { select: { nome: true } }, servico: { select: { nome: true } } },
        orderBy: { dataExecucao: "desc" },
        take: 10,
      },
    },
  });

  if (!cliente) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;
  const body = await req.json();

  const allowed = ["tipoPessoa", "nome", "razaoSocial", "cpfCnpj", "email", "telefone", "whatsapp",
    "cep", "endereco", "numero", "complemento", "bairro", "cidade", "estado", "tipoImovel", "observacoes", "status"];

  const data: any = {};
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if (body.areaM2 !== undefined) data.areaM2 = body.areaM2 ? parseFloat(body.areaM2) : null;

  const cliente = await prisma.cliente.updateMany({
    where: { id, tenantId },
    data,
  });

  return NextResponse.json({ message: "Atualizado" });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;

  await prisma.cliente.updateMany({
    where: { id, tenantId },
    data: { status: "inativo" },
  });

  return NextResponse.json({ message: "Desativado" });
}
