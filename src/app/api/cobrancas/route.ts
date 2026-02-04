import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import {
  criarPagamentoPix,
  criarPagamentoBoleto,
  getAccessToken,
} from "@/lib/mercadopago";

// GET - Listar cobrancas
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const url = req.nextUrl.searchParams;
  const status = url.get("status") || "";
  const page = parseInt(url.get("page") || "1");
  const limit = 20;

  const where: any = { tenantId };
  if (status) where.status = status;

  const [total, data] = await Promise.all([
    prisma.cobranca.count({ where }),
    prisma.cobranca.findMany({
      where,
      include: {
        cliente: { select: { nome: true, whatsapp: true, email: true } },
        os: { select: { numero: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const summary = await prisma.cobranca.groupBy({
    by: ["status"],
    where: { tenantId },
    _sum: { valor: true },
    _count: true,
  });

  return NextResponse.json({ data, total, pages: Math.ceil(total / limit), page, summary });
}

// POST - Criar nova cobranca com integracao MercadoPago
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const body = await req.json();
  const { clienteId, osId, descricao, valor, tipo, dataVencimento } = body;

  if (!clienteId || !descricao || !valor) {
    return NextResponse.json({ error: "Campos obrigatorios: clienteId, descricao, valor" }, { status: 400 });
  }

  // Buscar dados do cliente para o pagamento
  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, tenantId },
    select: { nome: true, email: true, cpfCnpj: true, whatsapp: true },
  });

  if (!cliente) {
    return NextResponse.json({ error: "Cliente nao encontrado" }, { status: 404 });
  }

  const cobrancaId = crypto.randomUUID();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const accessToken = await getAccessToken(prisma, tenantId);

  let paymentData: any = {
    tenantId,
    clienteId,
    osId: osId || null,
    descricao,
    valor: parseFloat(valor),
    tipo: tipo || "pix",
    dataVencimento: dataVencimento ? new Date(dataVencimento) : null,
    externalId: cobrancaId,
    linkPagamento: `${baseUrl}/pagamento/${cobrancaId}`,
  };

  // ── Integracao real com MercadoPago ──────────────────────────────
  if (accessToken) {
    const webhookUrl = `${baseUrl}/api/webhooks/mercadopago`;
    const pagadorEmail = cliente.email || "cliente@servicfy.com.br";
    const pagadorNome = cliente.nome || "Cliente";

    if ((tipo || "pix") === "pix") {
      const result = await criarPagamentoPix({
        accessToken,
        valor: parseFloat(valor),
        descricao,
        tipo: "pix",
        pagadorEmail,
        pagadorNome,
        pagadorCpf: cliente.cpfCnpj || undefined,
        externalReference: cobrancaId,
        notificationUrl: webhookUrl,
      });

      if (result.success) {
        paymentData.externalId = String(result.paymentId);
        paymentData.qrCode = result.qrCode || "";
        paymentData.chavePix = result.qrCode || "";
        paymentData.linkPagamento = result.linkPagamento || `${baseUrl}/pagamento/${cobrancaId}`;
      } else {
        // Falha no gateway - cria cobranca com dados simulados e avisa
        paymentData.chavePix = process.env.PIX_CHAVE || "";
        paymentData.qrCode = "";
        console.error("[MercadoPago PIX Error]", result.error);
      }
    } else {
      const result = await criarPagamentoBoleto({
        accessToken,
        valor: parseFloat(valor),
        descricao,
        tipo: "boleto",
        pagadorEmail,
        pagadorNome,
        pagadorCpf: cliente.cpfCnpj || undefined,
        dataVencimento: dataVencimento || undefined,
        externalReference: cobrancaId,
        notificationUrl: webhookUrl,
      });

      if (result.success) {
        paymentData.externalId = String(result.paymentId);
        paymentData.codigoBoleto = result.codigoBoleto || "";
        paymentData.linkPagamento = result.linkBoleto || result.linkPagamento || `${baseUrl}/pagamento/${cobrancaId}`;
      } else {
        paymentData.codigoBoleto = "";
        console.error("[MercadoPago Boleto Error]", result.error);
      }
    }
  } else {
    // ── Modo simulado (sem access token configurado) ───────────────
    paymentData.chavePix = process.env.PIX_CHAVE || "email@suaempresa.com.br";
    paymentData.qrCode = "";
  }

  const cobranca = await prisma.cobranca.create({ data: paymentData });

  return NextResponse.json(
    { ...cobranca, gatewayAtivo: !!accessToken },
    { status: 201 }
  );
}
