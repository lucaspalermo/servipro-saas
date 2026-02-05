import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapearStatusAsaas } from "@/lib/asaas";

/**
 * POST /api/webhooks/asaas - Webhook do Asaas
 *
 * Eventos importantes:
 * - PAYMENT_RECEIVED: Pagamento confirmado
 * - PAYMENT_CONFIRMED: Pagamento confirmado (cartão)
 * - PAYMENT_OVERDUE: Pagamento atrasado
 * - PAYMENT_REFUNDED: Pagamento estornado
 * - SUBSCRIPTION_DELETED: Assinatura cancelada
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, payment, subscription } = body;

    console.log("[Asaas Webhook] Evento recebido:", event);
    console.log("[Asaas Webhook] Dados:", JSON.stringify(body, null, 2));

    // Eventos de pagamento
    if (event.startsWith("PAYMENT_")) {
      if (!payment) {
        return NextResponse.json({ error: "Payment data missing" }, { status: 400 });
      }

      const { id: paymentId, subscription: subscriptionId, status, externalReference } = payment;

      // Busca tenant pelo subscriptionId ou externalReference
      let tenant = null;

      if (subscriptionId) {
        tenant = await prisma.tenant.findFirst({
          where: { asaasSubscriptionId: subscriptionId },
        });
      }

      if (!tenant && externalReference) {
        tenant = await prisma.tenant.findUnique({
          where: { id: externalReference },
        });
      }

      if (!tenant) {
        console.log("[Asaas Webhook] Tenant não encontrado para:", subscriptionId || externalReference);
        return NextResponse.json({ received: true, warning: "Tenant not found" });
      }

      const statusInterno = mapearStatusAsaas(status);

      // Atualiza status do tenant baseado no pagamento
      switch (event) {
        case "PAYMENT_RECEIVED":
        case "PAYMENT_CONFIRMED":
          // Pagamento confirmado - ativa a conta
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
              ativo: true,
              // Se estava em trial, marca que não está mais
              ...(tenant.plano === "trial" && { plano: tenant.plano }),
            },
          });
          console.log(`[Asaas Webhook] Tenant ${tenant.id} ativado - Pagamento confirmado`);
          break;

        case "PAYMENT_OVERDUE":
          // Pagamento atrasado - pode enviar lembrete ou bloquear após X dias
          console.log(`[Asaas Webhook] Tenant ${tenant.id} - Pagamento atrasado`);
          // Por enquanto, só loga. Pode adicionar lógica de bloqueio depois de X dias
          break;

        case "PAYMENT_REFUNDED":
        case "PAYMENT_REFUND_REQUESTED":
          // Estorno - cancela a conta
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
              ativo: false,
              plano: "trial",
            },
          });
          console.log(`[Asaas Webhook] Tenant ${tenant.id} desativado - Estorno`);
          break;

        default:
          console.log(`[Asaas Webhook] Evento de pagamento não tratado: ${event}`);
      }
    }

    // Eventos de assinatura
    if (event.startsWith("SUBSCRIPTION_")) {
      const subscriptionId = subscription?.id;

      if (!subscriptionId) {
        return NextResponse.json({ error: "Subscription data missing" }, { status: 400 });
      }

      const tenant = await prisma.tenant.findFirst({
        where: { asaasSubscriptionId: subscriptionId },
      });

      if (!tenant) {
        console.log("[Asaas Webhook] Tenant não encontrado para subscription:", subscriptionId);
        return NextResponse.json({ received: true, warning: "Tenant not found" });
      }

      switch (event) {
        case "SUBSCRIPTION_DELETED":
        case "SUBSCRIPTION_INACTIVATED":
          // Assinatura cancelada - volta para trial ou desativa
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
              ativo: false,
              plano: "trial",
              asaasSubscriptionId: null,
            },
          });
          console.log(`[Asaas Webhook] Tenant ${tenant.id} - Assinatura cancelada`);
          break;

        case "SUBSCRIPTION_RENEWED":
          // Assinatura renovada - mantém ativo
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
              ativo: true,
            },
          });
          console.log(`[Asaas Webhook] Tenant ${tenant.id} - Assinatura renovada`);
          break;

        default:
          console.log(`[Asaas Webhook] Evento de assinatura não tratado: ${event}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Asaas Webhook] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}

// Asaas também envia GET para verificar se o endpoint existe
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Webhook Asaas ativo" });
}
