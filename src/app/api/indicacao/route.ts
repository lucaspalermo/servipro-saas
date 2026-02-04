import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obter codigo de indicacao e lista de indicados
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { codigoIndicacao: true },
  });

  const indicacoes = await prisma.indicacao.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: indicacoes.length,
    pendentes: indicacoes.filter((i) => i.status === "pendente").length,
    convertidas: indicacoes.filter((i) => i.status === "convertida").length,
    recompensas: indicacoes.filter((i) => i.recompensa).length,
  };

  return NextResponse.json({
    codigoIndicacao: tenant?.codigoIndicacao,
    indicacoes,
    stats,
  });
}

// POST - Registrar nova indicacao
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const body = await req.json();
  const { email, nome } = body;

  if (!email) {
    return NextResponse.json({ error: "Email obrigatorio" }, { status: 400 });
  }

  // Verificar se ja foi indicado
  const existente = await prisma.indicacao.findFirst({
    where: { tenantId, indicadoEmail: email },
  });

  if (existente) {
    return NextResponse.json({ error: "Este email ja foi indicado" }, { status: 409 });
  }

  const indicacao = await prisma.indicacao.create({
    data: {
      tenantId,
      indicadoEmail: email,
      indicadoNome: nome || null,
    },
  });

  return NextResponse.json(indicacao, { status: 201 });
}
