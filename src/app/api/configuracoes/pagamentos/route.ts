import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obter configuracoes de pagamento do tenant
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const configs = await prisma.configuracao.findMany({
    where: {
      tenantId,
      chave: { in: ["mp_access_token", "mp_public_key", "pix_chave", "gateway_ativo"] },
    },
  });

  const result: Record<string, string> = {};
  configs.forEach((c: any) => {
    result[c.chave] = c.valor || "";
  });

  // Mascarar o access token (mostrar apenas ultimos 8 chars)
  if (result.mp_access_token) {
    const token = result.mp_access_token;
    result.mp_access_token_masked =
      token.length > 8 ? "****" + token.slice(-8) : "****";
    result.mp_access_token_configurado = "true";
  } else {
    result.mp_access_token_masked = "";
    result.mp_access_token_configurado = "false";
  }

  return NextResponse.json(result);
}

// PUT - Salvar configuracoes de pagamento
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const body = await req.json();
  const { mp_access_token, mp_public_key, pix_chave, gateway_ativo } = body;

  const upserts = [];

  // Somente atualizar access token se foi enviado (nao mascarado)
  if (mp_access_token && !mp_access_token.startsWith("****")) {
    upserts.push(
      prisma.configuracao.upsert({
        where: { tenantId_chave: { tenantId, chave: "mp_access_token" } },
        update: { valor: mp_access_token },
        create: { tenantId, chave: "mp_access_token", valor: mp_access_token },
      })
    );
  }

  if (mp_public_key !== undefined) {
    upserts.push(
      prisma.configuracao.upsert({
        where: { tenantId_chave: { tenantId, chave: "mp_public_key" } },
        update: { valor: mp_public_key },
        create: { tenantId, chave: "mp_public_key", valor: mp_public_key },
      })
    );
  }

  if (pix_chave !== undefined) {
    upserts.push(
      prisma.configuracao.upsert({
        where: { tenantId_chave: { tenantId, chave: "pix_chave" } },
        update: { valor: pix_chave },
        create: { tenantId, chave: "pix_chave", valor: pix_chave },
      })
    );
  }

  if (gateway_ativo !== undefined) {
    upserts.push(
      prisma.configuracao.upsert({
        where: { tenantId_chave: { tenantId, chave: "gateway_ativo" } },
        update: { valor: gateway_ativo },
        create: { tenantId, chave: "gateway_ativo", valor: gateway_ativo },
      })
    );
  }

  // Validar access token fazendo uma chamada de teste ao MercadoPago
  if (mp_access_token && !mp_access_token.startsWith("****")) {
    try {
      const res = await fetch("https://api.mercadopago.com/v1/payment_methods", {
        headers: { Authorization: `Bearer ${mp_access_token}` },
      });
      if (!res.ok) {
        return NextResponse.json(
          { error: "Access Token invalido. Verifique suas credenciais no MercadoPago." },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Erro ao validar token. Verifique sua conexao." },
        { status: 500 }
      );
    }
  }

  await Promise.all(upserts);

  return NextResponse.json({ success: true });
}
