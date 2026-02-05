import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  criarClienteAsaas,
  criarAssinaturaAsaas,
  buscarClientePorTenant,
  PLANOS,
  proximaDataVencimento,
} from "@/lib/asaas";

/**
 * GET /api/assinaturas - Busca assinatura atual do tenant
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        id: true,
        nome: true,
        plano: true,
        planoPeriodo: true,
        asaasCustomerId: true,
        asaasSubscriptionId: true,
        trialEnd: true,
        ativo: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
    }

    // Calcula dias restantes do trial
    let diasRestantesTrial = 0;
    if (tenant.plano === "trial" && tenant.trialEnd) {
      const hoje = new Date();
      const trialEnd = new Date(tenant.trialEnd);
      diasRestantesTrial = Math.max(0, Math.ceil((trialEnd.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)));
    }

    return NextResponse.json({
      ...tenant,
      diasRestantesTrial,
      planos: PLANOS,
    });
  } catch (error) {
    console.error("[Assinaturas GET] Erro:", error);
    return NextResponse.json({ error: "Erro ao buscar assinatura" }, { status: 500 });
  }
}

/**
 * POST /api/assinaturas - Cria nova assinatura
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { plano, periodo, cpfCnpj, formaPagamento } = body;

    // Valida plano
    if (!["starter", "profissional", "enterprise"].includes(plano)) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    // Valida período
    if (!["mensal", "anual"].includes(periodo)) {
      return NextResponse.json({ error: "Período inválido" }, { status: 400 });
    }

    // Valida CPF/CNPJ
    if (!cpfCnpj || cpfCnpj.length < 11) {
      return NextResponse.json({ error: "CPF/CNPJ inválido" }, { status: 400 });
    }

    // Busca tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      include: {
        users: {
          where: { role: "admin" },
          take: 1,
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
    }

    const adminUser = tenant.users[0];
    const planoInfo = PLANOS[plano as keyof typeof PLANOS];
    const valor = periodo === "anual" ? planoInfo.precoAnual : planoInfo.precoMensal;

    // Cria ou busca cliente no Asaas
    let asaasCustomer = await buscarClientePorTenant(tenant.id);

    if (!asaasCustomer) {
      asaasCustomer = await criarClienteAsaas({
        name: tenant.nome,
        email: adminUser?.email || tenant.email || "",
        cpfCnpj: cpfCnpj.replace(/\D/g, ""),
        phone: tenant.telefone?.replace(/\D/g, "") || undefined,
        externalReference: tenant.id,
      });
    }

    if (!asaasCustomer.id) {
      return NextResponse.json({ error: "Erro ao criar cliente no Asaas" }, { status: 500 });
    }

    // Mapeia forma de pagamento
    let billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED" = "UNDEFINED";
    if (formaPagamento === "pix") billingType = "PIX";
    else if (formaPagamento === "boleto") billingType = "BOLETO";
    else if (formaPagamento === "cartao") billingType = "CREDIT_CARD";

    // Cria assinatura no Asaas
    const assinatura = await criarAssinaturaAsaas({
      customer: asaasCustomer.id,
      billingType,
      value: valor,
      nextDueDate: proximaDataVencimento(),
      cycle: periodo === "anual" ? "YEARLY" : "MONTHLY",
      description: `Servicfy - Plano ${planoInfo.nome} (${periodo})`,
      externalReference: tenant.id,
    });

    // Atualiza tenant com IDs do Asaas
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        asaasCustomerId: asaasCustomer.id,
        asaasSubscriptionId: assinatura.id,
        plano: plano,
        planoPeriodo: periodo,
        // Não ativa ainda - aguarda confirmação do pagamento via webhook
      },
    });

    return NextResponse.json({
      success: true,
      assinatura: {
        id: assinatura.id,
        valor,
        plano: planoInfo.nome,
        periodo,
      },
      mensagem: "Assinatura criada! Aguardando confirmação do pagamento.",
    });
  } catch (error) {
    console.error("[Assinaturas POST] Erro:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao criar assinatura" },
      { status: 500 }
    );
  }
}
