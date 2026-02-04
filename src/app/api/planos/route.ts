import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PLANOS = {
  starter: { mensal: 97, anual: 970 },
  profissional: { mensal: 197, anual: 1970 },
  enterprise: { mensal: 397, anual: 3970 },
};

// GET - Obter plano atual
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { plano: true, planoPeriodo: true, trialEnd: true },
  });

  return NextResponse.json({
    plano: tenant?.plano,
    periodo: tenant?.planoPeriodo,
    trialEnd: tenant?.trialEnd,
    precos: PLANOS,
  });
}

// PUT - Alterar plano
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const body = await req.json();
  const { plano, periodo } = body;

  if (!plano || !["starter", "profissional", "enterprise"].includes(plano)) {
    return NextResponse.json({ error: "Plano invalido" }, { status: 400 });
  }
  if (!periodo || !["mensal", "anual"].includes(periodo)) {
    return NextResponse.json({ error: "Periodo invalido" }, { status: 400 });
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { plano, planoPeriodo: periodo },
  });

  return NextResponse.json({ success: true, plano, periodo });
}
