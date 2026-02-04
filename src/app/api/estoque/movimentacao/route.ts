import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Registrar movimentacao de estoque (entrada ou saida)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const body = await req.json();
  const { produtoId, tipo, quantidade, observacao } = body;

  if (!produtoId || !tipo || !quantidade) {
    return NextResponse.json({ error: "produtoId, tipo e quantidade obrigatorios" }, { status: 400 });
  }

  if (!["entrada", "saida", "ajuste"].includes(tipo)) {
    return NextResponse.json({ error: "Tipo deve ser: entrada, saida ou ajuste" }, { status: 400 });
  }

  const produto = await prisma.produto.findFirst({ where: { id: produtoId, tenantId } });
  if (!produto) return NextResponse.json({ error: "Produto nao encontrado" }, { status: 404 });

  const qtd = parseFloat(quantidade);
  let novoEstoque = produto.estoqueAtual;

  if (tipo === "entrada") novoEstoque += qtd;
  else if (tipo === "saida") novoEstoque -= qtd;
  else novoEstoque = qtd; // ajuste

  if (novoEstoque < 0) {
    return NextResponse.json({ error: "Estoque insuficiente" }, { status: 400 });
  }

  // Criar movimentacao e atualizar estoque em transacao
  const [movimentacao] = await prisma.$transaction([
    prisma.movimentacaoEstoque.create({
      data: {
        tenantId,
        produtoId,
        tipo,
        quantidade: qtd,
        observacao: observacao || null,
      },
    }),
    prisma.produto.update({
      where: { id: produtoId },
      data: { estoqueAtual: novoEstoque },
    }),
  ]);

  return NextResponse.json(movimentacao, { status: 201 });
}
