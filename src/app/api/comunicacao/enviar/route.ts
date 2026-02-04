import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function replaceVariables(texto: string, vars: Record<string, string>): string {
  let result = texto;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const tenantId = (session.user as any).tenantId;
  const body = await req.json();

  const { templateId, clienteIds, filtro, variaveis } = body;

  if (!templateId) {
    return NextResponse.json({ error: "Template e obrigatorio" }, { status: 400 });
  }

  // Fetch template
  const template = await prisma.mensagemTemplate.findFirst({
    where: { id: templateId, tenantId },
  });

  if (!template) {
    return NextResponse.json({ error: "Template nao encontrado" }, { status: 404 });
  }

  // Fetch tenant info for {empresa} and {segmento} variables
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  // Determine which clients to send to
  let whereCliente: any = { tenantId, status: "ativo" };

  if (filtro === "todos") {
    // All active clients
  } else if (filtro === "vencendo") {
    // Clients with contracts expiring in the next 30 days
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const clientesComContratoVencendo = await prisma.contrato.findMany({
      where: {
        tenantId,
        status: "ativo",
        dataFim: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
      select: { clienteId: true },
    });
    const ids = [...new Set(clientesComContratoVencendo.map((c) => c.clienteId))];
    whereCliente.id = { in: ids };
  } else if (clienteIds && clienteIds.length > 0) {
    whereCliente.id = { in: clienteIds };
  }

  const clientes = await prisma.cliente.findMany({
    where: whereCliente,
    select: {
      id: true,
      nome: true,
      telefone: true,
      whatsapp: true,
    },
  });

  if (clientes.length === 0) {
    return NextResponse.json({ error: "Nenhum cliente encontrado" }, { status: 404 });
  }

  // Generate messages and WhatsApp links
  const results = [];
  const logsToCreate = [];

  for (const cliente of clientes) {
    const phone = cleanPhone(cliente.whatsapp || cliente.telefone || "");
    if (!phone) continue;

    const phoneWithCountry = phone.startsWith("55") ? phone : `55${phone}`;

    const vars: Record<string, string> = {
      nome: cliente.nome,
      empresa: tenant?.nome || "",
      segmento: tenant?.segmento || "",
      ...(variaveis || {}),
    };

    const mensagem = replaceVariables(template.texto, vars);
    const encodedMessage = encodeURIComponent(mensagem);
    const whatsappLink = `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`;

    results.push({
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      telefone: phone,
      mensagem,
      whatsappLink,
    });

    logsToCreate.push({
      tenantId,
      templateId: template.id,
      clienteId: cliente.id,
      telefone: phone,
      mensagem,
      tipo: template.tipo,
      status: "enviado",
    });
  }

  // Save logs
  if (logsToCreate.length > 0) {
    await prisma.mensagemLog.createMany({
      data: logsToCreate,
    });
  }

  return NextResponse.json({
    total: results.length,
    mensagens: results,
  });
}
