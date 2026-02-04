import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consultarPagamento, mapearStatusMP } from "@/lib/mercadopago";

// POST - Receber notificacoes IPN do MercadoPago
// Documentacao: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MercadoPago envia notificacoes com type "payment" e data.id
    if (body.type !== "payment" && body.action !== "payment.updated" && body.action !== "payment.created") {
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    // Buscar a cobranca pelo externalId (que armazena o payment ID do MercadoPago)
    const cobranca = await prisma.cobranca.findFirst({
      where: { externalId: String(paymentId) },
      include: { tenant: true },
    });

    if (!cobranca) {
      // Pode ser uma cobranca de outro sistema - ignorar
      return NextResponse.json({ received: true });
    }

    // Buscar access token do tenant
    const config = await prisma.configuracao.findUnique({
      where: {
        tenantId_chave: {
          tenantId: cobranca.tenantId,
          chave: "mp_access_token",
        },
      },
    });

    const accessToken = config?.valor || process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ received: true });
    }

    // Consultar o pagamento real no MercadoPago
    const mpPayment = await consultarPagamento(accessToken, paymentId);
    if (!mpPayment) {
      return NextResponse.json({ received: true });
    }

    const novoStatus = mapearStatusMP(mpPayment.status);

    // Atualizar status da cobranca
    if (novoStatus !== cobranca.status) {
      await prisma.cobranca.update({
        where: { id: cobranca.id },
        data: {
          status: novoStatus,
          dataPagamento: novoStatus === "pago"
            ? new Date(mpPayment.dataPagamento || Date.now())
            : cobranca.dataPagamento,
        },
      });

      // Se foi pago, registrar no financeiro automaticamente
      if (novoStatus === "pago") {
        await prisma.financeiro.create({
          data: {
            tenantId: cobranca.tenantId,
            tipo: "receita",
            categoria: "cobranca",
            descricao: `Pagamento recebido: ${cobranca.descricao}`,
            valor: mpPayment.valorPago || cobranca.valor,
            dataPagamento: new Date(mpPayment.dataPagamento || Date.now()),
            status: "pago",
            osId: cobranca.osId || undefined,
            clienteId: cobranca.clienteId,
            formaPagamento: cobranca.tipo,
          },
        });
      }
    }

    return NextResponse.json({ received: true, updated: true });
  } catch (err) {
    console.error("[Webhook MercadoPago Error]", err);
    // Sempre retornar 200 para o MercadoPago nao reenviar
    return NextResponse.json({ received: true, error: true });
  }
}
