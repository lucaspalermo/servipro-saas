import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const url = req.nextUrl.searchParams;
  const tipo = url.get("tipo") || "";
  const status = url.get("status") || "";
  const resumo = url.get("resumo");
  const page = parseInt(url.get("page") || "1");
  const limit = 20;

  // Resumo financeiro
  if (resumo === "true") {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const [receitas, despesas, aReceber, aPagar, atrasados] = await Promise.all([
      prisma.financeiro.aggregate({
        where: { tenantId, tipo: "receita", status: "pago", dataPagamento: { gte: inicioMes } },
        _sum: { valor: true },
      }),
      prisma.financeiro.aggregate({
        where: { tenantId, tipo: "despesa", status: "pago", dataPagamento: { gte: inicioMes } },
        _sum: { valor: true },
      }),
      prisma.financeiro.aggregate({
        where: { tenantId, tipo: "receita", status: "pendente" },
        _sum: { valor: true },
      }),
      prisma.financeiro.aggregate({
        where: { tenantId, tipo: "despesa", status: "pendente" },
        _sum: { valor: true },
      }),
      prisma.financeiro.aggregate({
        where: { tenantId, status: "pendente", dataVencimento: { lt: new Date() } },
        _sum: { valor: true },
      }),
    ]);

    const r = receitas._sum.valor || 0;
    const d = despesas._sum.valor || 0;

    return NextResponse.json({
      receitas: r,
      despesas: d,
      lucro: r - d,
      aReceber: aReceber._sum.valor || 0,
      aPagar: aPagar._sum.valor || 0,
      atrasados: atrasados._sum.valor || 0,
    });
  }

  // Lista
  const where: any = { tenantId };
  if (tipo) where.tipo = tipo;
  if (status) where.status = status;

  const [total, data] = await Promise.all([
    prisma.financeiro.count({ where }),
    prisma.financeiro.findMany({
      where,
      include: {
        cliente: { select: { nome: true } },
        tecnico: { select: { nome: true } },
      },
      orderBy: { dataVencimento: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ data, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const body = await req.json();

  if (!body.tipo || !body.valor)
    return NextResponse.json({ error: "Tipo e valor obrigatórios" }, { status: 400 });

  const fin = await prisma.financeiro.create({
    data: {
      tenantId,
      tipo: body.tipo,
      categoria: body.categoria || null,
      descricao: body.descricao || null,
      valor: parseFloat(body.valor),
      dataVencimento: body.dataVencimento ? new Date(body.dataVencimento) : null,
      dataPagamento: body.dataPagamento ? new Date(body.dataPagamento) : null,
      status: body.status || "pendente",
      formaPagamento: body.formaPagamento || null,
      clienteId: body.clienteId || null,
      tecnicoId: body.tecnicoId || null,
      osId: body.osId || null,
    },
  });

  return NextResponse.json(fin, { status: 201 });
}
