import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOSNumber } from "@/lib/utils";

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
      { numero: { contains: search } },
      { cliente: { nome: { contains: search } } },
    ];
  }
  if (status) where.status = status;

  const [total, data] = await Promise.all([
    prisma.ordemServico.count({ where }),
    prisma.ordemServico.findMany({
      where,
      include: {
        cliente: { select: { nome: true, telefone: true, endereco: true, numero: true, bairro: true, cidade: true } },
        tecnico: { select: { nome: true } },
        servico: { select: { nome: true } },
      },
      orderBy: [{ dataExecucao: "desc" }, { createdAt: "desc" }],
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

  if (!body.clienteId) return NextResponse.json({ error: "Cliente obrigatório" }, { status: 400 });

  const count = await prisma.ordemServico.count({ where: { tenantId } });
  const numero = generateOSNumber(count + 1);

  const os = await prisma.ordemServico.create({
    data: {
      tenantId,
      numero,
      clienteId: body.clienteId,
      tecnicoId: body.tecnicoId || null,
      servicoId: body.servicoId || null,
      contratoId: body.contratoId || null,
      dataExecucao: body.dataExecucao ? new Date(body.dataExecucao) : new Date(),
      horaInicio: body.horaInicio || null,
      horaFim: body.horaFim || null,
      valor: body.valor ? parseFloat(body.valor) : 0,
      descricao: body.descricao || null,
    },
  });

  return NextResponse.json(os, { status: 201 });
}
