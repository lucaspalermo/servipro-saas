import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT - Atualizar produto
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;

  const body = await req.json();

  const allowed = ["nome", "descricao", "unidade", "precoCompra", "precoVenda", "estoqueMinimo", "ativo"];
  const data: any = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      data[key] = ["precoCompra", "precoVenda", "estoqueMinimo"].includes(key)
        ? parseFloat(body[key]) || 0
        : body[key];
    }
  }

  await prisma.produto.updateMany({ where: { id, tenantId }, data });
  return NextResponse.json({ success: true });
}

// DELETE - Desativar produto
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;

  await prisma.produto.updateMany({ where: { id, tenantId }, data: { ativo: false } });
  return NextResponse.json({ success: true });
}
