import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendTrialEndingEmail,
  sendServiceExpiringEmail,
  sendPaymentOverdueEmail,
} from "@/lib/email";

// This endpoint can be called by a cron job (e.g., daily) to send notification emails.
// Protect with a secret token in production.
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (token !== (process.env.CRON_SECRET || "servicfy-cron-secret")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    trialEnding: 0,
    serviceExpiring: 0,
    paymentOverdue: 0,
    errors: 0,
  };

  try {
    // 1. Trial ending notifications (3 days and 1 day before)
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    const expiringTenants = await prisma.tenant.findMany({
      where: {
        plano: "trial",
        ativo: true,
        trialEnd: {
          gte: now,
          lte: in3Days,
        },
      },
      include: {
        users: {
          where: { role: "admin", ativo: true },
          select: { email: true, nome: true },
        },
      },
    });

    for (const tenant of expiringTenants) {
      if (!tenant.trialEnd) continue;
      const diasRestantes = Math.ceil(
        (tenant.trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      for (const user of tenant.users) {
        try {
          await sendTrialEndingEmail(user.email, user.nome, diasRestantes);
          results.trialEnding++;
        } catch {
          results.errors++;
        }
      }
    }

    // 2. Service expiring notifications (next 7 days)
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expiringContracts = await prisma.contrato.findMany({
      where: {
        status: "ativo",
        proximoServico: {
          gte: now,
          lte: in7Days,
        },
      },
      include: {
        cliente: { select: { nome: true } },
        servico: { select: { nome: true } },
        tenant: {
          include: {
            users: {
              where: { role: "admin", ativo: true },
              select: { email: true },
            },
          },
        },
      },
    });

    for (const contrato of expiringContracts) {
      const adminEmail = contrato.tenant.users[0]?.email;
      if (!adminEmail) continue;
      try {
        await sendServiceExpiringEmail(
          adminEmail,
          contrato.cliente.nome,
          contrato.tenant.nome,
          contrato.servico?.nome || "Servico",
          contrato.proximoServico
            ? new Date(contrato.proximoServico).toLocaleDateString("pt-BR")
            : "-"
        );
        results.serviceExpiring++;
      } catch {
        results.errors++;
      }
    }

    // 3. Payment overdue notifications
    const overduePayments = await prisma.financeiro.findMany({
      where: {
        status: "pendente",
        tipo: "receita",
        dataVencimento: {
          lt: now,
        },
      },
      include: {
        tenant: {
          include: {
            users: {
              where: { role: "admin", ativo: true },
              select: { email: true },
            },
          },
        },
      },
    });

    for (const payment of overduePayments) {
      const adminEmail = payment.tenant.users[0]?.email;
      if (!adminEmail) continue;
      try {
        const valor = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(payment.valor);
        await sendPaymentOverdueEmail(
          adminEmail,
          payment.tenant.nome,
          payment.descricao || "Cobranca",
          valor,
          payment.dataVencimento
            ? new Date(payment.dataVencimento).toLocaleDateString("pt-BR")
            : "-"
        );
        results.paymentOverdue++;
      } catch {
        results.errors++;
      }
    }
  } catch (error) {
    console.error("[Notifications] Erro geral:", error);
    return NextResponse.json(
      { error: "Erro ao processar notificacoes", details: String(error) },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    ...results,
    total: results.trialEnding + results.serviceExpiring + results.paymentOverdue,
  });
}
