import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar filiais
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const filiais = await prisma.filial.findMany({
    where: { tenantId },
    orderBy: { nome: "asc" },
    include: {
      _count: { select: { clientes: true, tecnicos: true, ordens: true } },
    },
  });

  return NextResponse.json({ filiais });
}

// POST - Criar filial
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const body = await req.json();
  const { nome, endereco, telefone, email, responsavel } = body;

  if (!nome) return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });

  const filial = await prisma.filial.create({
    data: {
      tenantId,
      nome,
      endereco: endereco || null,
      telefone: telefone || null,
      email: email || null,
      responsavel: responsavel || null,
    },
  });

  return NextResponse.json(filial, { status: 201 });
}
