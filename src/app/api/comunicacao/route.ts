import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const defaultTemplates = [
  {
    nome: "Lembrete de Servico",
    texto: "Ola {nome}! Lembramos que seu servico de {servico} esta agendado para {data} as {hora}. Confirma? Responda SIM ou NAO.",
    tipo: "lembrete",
  },
  {
    nome: "Confirmacao de Agendamento",
    texto: "Ola {nome}! Seu servico de {servico} foi agendado para {data} as {hora}. Tecnico: {tecnico}. Qualquer duvida, estamos a disposicao!",
    tipo: "confirmacao",
  },
  {
    nome: "Pos-Servico",
    texto: "Ola {nome}! O servico de {servico} foi concluido. Ficou satisfeito? Avalie de 1 a 5. Obrigado pela confianca!",
    tipo: "pos_servico",
  },
  {
    nome: "Cobranca",
    texto: "Ola {nome}! Informamos que sua fatura de R$ {valor} referente a {servico} vence em {data}. Para pagamento via PIX: {chave}.",
    tipo: "cobranca",
  },
  {
    nome: "Renovacao de Contrato",
    texto: "Ola {nome}! Seu contrato de {servico} esta proximo do vencimento. Deseja renovar? Entre em contato conosco.",
    tipo: "renovacao",
  },
  {
    nome: "Boas-vindas",
    texto: "Ola {nome}! Bem-vindo(a) a {empresa}! Somos especialistas em {segmento}. Conte conosco para manter seu ambiente seguro e saudavel.",
    tipo: "boas_vindas",
  },
];

const defaultAutomacoes = [
  { tipo: "lembrete_1dia", ativo: false },
  { tipo: "confirmacao_agendamento", ativo: false },
  { tipo: "pesquisa_pos_servico", ativo: false },
  { tipo: "cobranca_3dias", ativo: false },
  { tipo: "boas_vindas_cadastro", ativo: false },
];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const tenantId = (session.user as any).tenantId;

  // Fetch templates, create defaults if none exist
  let templates = await prisma.mensagemTemplate.findMany({
    where: { tenantId },
    orderBy: { createdAt: "asc" },
  });

  if (templates.length === 0) {
    await prisma.mensagemTemplate.createMany({
      data: defaultTemplates.map((t) => ({
        tenantId,
        nome: t.nome,
        texto: t.texto,
        tipo: t.tipo,
        ativo: true,
      })),
    });
    templates = await prisma.mensagemTemplate.findMany({
      where: { tenantId },
      orderBy: { createdAt: "asc" },
    });
  }

  // Fetch automation configs, create defaults if none exist
  let automacoes = await prisma.automacaoConfig.findMany({
    where: { tenantId },
    orderBy: { createdAt: "asc" },
  });

  if (automacoes.length === 0) {
    for (const a of defaultAutomacoes) {
      await prisma.automacaoConfig.create({
        data: {
          tenantId,
          tipo: a.tipo,
          ativo: a.ativo,
        },
      });
    }
    automacoes = await prisma.automacaoConfig.findMany({
      where: { tenantId },
      orderBy: { createdAt: "asc" },
    });
  }

  // Fetch recent message logs
  const logs = await prisma.mensagemLog.findMany({
    where: { tenantId },
    include: {
      cliente: { select: { nome: true } },
      template: { select: { nome: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ templates, automacoes, logs });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const tenantId = (session.user as any).tenantId;
  const body = await req.json();

  if (!body.nome || !body.texto) {
    return NextResponse.json({ error: "Nome e texto sao obrigatorios" }, { status: 400 });
  }

  if (body.id) {
    // Update existing template
    const template = await prisma.mensagemTemplate.update({
      where: { id: body.id },
      data: {
        nome: body.nome,
        texto: body.texto,
        tipo: body.tipo || "custom",
        ativo: body.ativo !== undefined ? body.ativo : true,
      },
    });
    return NextResponse.json(template);
  } else {
    // Create new template
    const template = await prisma.mensagemTemplate.create({
      data: {
        tenantId,
        nome: body.nome,
        texto: body.texto,
        tipo: body.tipo || "custom",
        ativo: true,
      },
    });
    return NextResponse.json(template, { status: 201 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const tenantId = (session.user as any).tenantId;
  const body = await req.json();

  if (!body.tipo) {
    return NextResponse.json({ error: "Tipo e obrigatorio" }, { status: 400 });
  }

  const automacao = await prisma.automacaoConfig.upsert({
    where: { tenantId_tipo: { tenantId, tipo: body.tipo } },
    update: { ativo: body.ativo },
    create: { tenantId, tipo: body.tipo, ativo: body.ativo },
  });

  return NextResponse.json(automacao);
}
