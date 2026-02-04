import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const tenantId = (session.user as any).tenantId;
  const url = req.nextUrl.searchParams;
  const search = url.get("search") || "";
  const status = url.get("status") || "";
  const page = parseInt(url.get("page") || "1");
  const limit = 20;

  const where: any = { tenantId };
  if (search) {
    where.OR = [
      { nome: { contains: search } },
      { cpfCnpj: { contains: search } },
      { email: { contains: search } },
      { telefone: { contains: search } },
    ];
  }
  if (status) where.status = status;

  const [total, data] = await Promise.all([
    prisma.cliente.count({ where }),
    prisma.cliente.findMany({
      where,
      include: {
        contratos: { where: { status: "ativo" }, select: { id: true } },
        ordens: { select: { id: true } },
      },
      orderBy: { nome: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const result = data.map((c) => ({
    ...c,
    contratosAtivos: c.contratos.length,
    totalOs: c.ordens.length,
    contratos: undefined,
    ordens: undefined,
  }));

  return NextResponse.json({
    data: result,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const tenantId = (session.user as any).tenantId;
  const body = await req.json();

  if (!body.nome) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

  const cliente = await prisma.cliente.create({
    data: {
      tenantId,
      tipoPessoa: body.tipoPessoa || "PF",
      nome: body.nome,
      razaoSocial: body.razaoSocial || null,
      cpfCnpj: body.cpfCnpj || null,
      email: body.email || null,
      telefone: body.telefone || null,
      whatsapp: body.whatsapp || null,
      cep: body.cep || null,
      endereco: body.endereco || null,
      numero: body.numero || null,
      complemento: body.complemento || null,
      bairro: body.bairro || null,
      cidade: body.cidade || null,
      estado: body.estado || null,
      tipoImovel: body.tipoImovel || "residencial",
      areaM2: body.areaM2 ? parseFloat(body.areaM2) : null,
      observacoes: body.observacoes || null,
    },
  });

  return NextResponse.json(cliente, { status: 201 });
}
