import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar produtos
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const search = req.nextUrl.searchParams.get("search") || "";

  const where: any = { tenantId };
  if (search) {
    where.OR = [{ nome: { contains: search } }, { descricao: { contains: search } }];
  }

  const produtos = await prisma.produto.findMany({
    where,
    orderBy: { nome: "asc" },
    include: {
      movimentacoes: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  const alertas = produtos.filter((p) => p.ativo && p.estoqueAtual <= p.estoqueMinimo);

  return NextResponse.json({ produtos, alertas: alertas.length });
}

// POST - Criar produto
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const body = await req.json();
  const { nome, descricao, unidade, precoCompra, precoVenda, estoqueAtual, estoqueMinimo } = body;

  if (!nome) return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });

  const produto = await prisma.produto.create({
    data: {
      tenantId,
      nome,
      descricao: descricao || null,
      unidade: unidade || "un",
      precoCompra: parseFloat(precoCompra) || 0,
      precoVenda: parseFloat(precoVenda) || 0,
      estoqueAtual: parseFloat(estoqueAtual) || 0,
      estoqueMinimo: parseFloat(estoqueMinimo) || 0,
    },
  });

  // Registrar entrada inicial se estoqueAtual > 0
  if (produto.estoqueAtual > 0) {
    await prisma.movimentacaoEstoque.create({
      data: {
        tenantId,
        produtoId: produto.id,
        tipo: "entrada",
        quantidade: produto.estoqueAtual,
        observacao: "Estoque inicial",
      },
    });
  }

  return NextResponse.json(produto, { status: 201 });
}
