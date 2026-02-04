import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { consultarPagamento, mapearStatusMP, getAccessToken } from "@/lib/mercadopago";

// GET - Consultar cobranca individual (com sync do gateway)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;

  const cobranca = await prisma.cobranca.findFirst({
    where: { id, tenantId },
    include: {
      cliente: { select: { nome: true, whatsapp: true, email: true } },
      os: { select: { numero: true } },
    },
  });

  if (!cobranca) {
    return NextResponse.json({ error: "Cobranca nao encontrada" }, { status: 404 });
  }

  // Sincronizar status com MercadoPago se pendente e tem externalId numerico
  if (cobranca.status === "pendente" && cobranca.externalId && /^\d+$/.test(cobranca.externalId)) {
    const accessToken = await getAccessToken(prisma, tenantId);
    if (accessToken) {
      const mpStatus = await consultarPagamento(accessToken, cobranca.externalId);
      if (mpStatus) {
        const novoStatus = mapearStatusMP(mpStatus.status);
        if (novoStatus !== cobranca.status) {
          await prisma.cobranca.update({
            where: { id },
            data: {
              status: novoStatus,
              dataPagamento: novoStatus === "pago" ? new Date(mpStatus.dataPagamento || Date.now()) : null,
            },
          });
          return NextResponse.json({ ...cobranca, status: novoStatus });
        }
      }
    }
  }

  return NextResponse.json(cobranca);
}

// PUT - Atualizar cobranca (marcar como pago manualmente)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;

  const body = await req.json();
  const { status } = body;

  const data: any = {};
  if (status) data.status = status;
  if (status === "pago") data.dataPagamento = new Date();

  await prisma.cobranca.updateMany({
    where: { id, tenantId },
    data,
  });

  return NextResponse.json({ success: true });
}

// DELETE - Excluir cobranca
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const { id } = await params;

  await prisma.cobranca.deleteMany({ where: { id, tenantId } });
  return NextResponse.json({ success: true });
}
