import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

// Default services per segment
const SERVICOS_POR_SEGMENTO: Record<string, { nome: string; descricao: string; duracaoMin: number; recorrenciaDias: number; precoBase: number }[]> = {
  dedetizadora: [
    { nome: "Dedetizacao Geral", descricao: "Controle de insetos rasteiros e voadores em ambientes internos e externos.", duracaoMin: 90, recorrenciaDias: 30, precoBase: 250 },
    { nome: "Desratizacao", descricao: "Controle e eliminacao de roedores com iscas e armadilhas.", duracaoMin: 60, recorrenciaDias: 30, precoBase: 200 },
    { nome: "Descupinizacao", descricao: "Tratamento contra cupins de solo e madeira seca.", duracaoMin: 120, recorrenciaDias: 180, precoBase: 500 },
    { nome: "Controle de Mosquitos", descricao: "Nebulizacao e larvicida para controle de mosquitos (dengue, zika).", duracaoMin: 60, recorrenciaDias: 30, precoBase: 180 },
    { nome: "Controle de Escorpioes", descricao: "Aplicacao de produto especifico para escorpioes em areas de risco.", duracaoMin: 60, recorrenciaDias: 60, precoBase: 220 },
    { nome: "Desalojamento de Pombos", descricao: "Instalacao de barreiras fisicas e repelentes para pombos.", duracaoMin: 120, recorrenciaDias: 90, precoBase: 350 },
  ],
  limpeza: [
    { nome: "Limpeza Residencial", descricao: "Limpeza completa de residencia incluindo cozinha e banheiros.", duracaoMin: 180, recorrenciaDias: 7, precoBase: 200 },
    { nome: "Limpeza Comercial", descricao: "Limpeza de escritorios e estabelecimentos comerciais.", duracaoMin: 120, recorrenciaDias: 7, precoBase: 300 },
    { nome: "Limpeza Pos-Obra", descricao: "Limpeza pesada apos reforma ou construcao.", duracaoMin: 480, recorrenciaDias: 0, precoBase: 800 },
    { nome: "Higienizacao de Estofados", descricao: "Limpeza profunda de sofas, poltronas e colchoes.", duracaoMin: 120, recorrenciaDias: 180, precoBase: 250 },
    { nome: "Limpeza de Vidros", descricao: "Limpeza de fachadas e vidros internos e externos.", duracaoMin: 120, recorrenciaDias: 30, precoBase: 350 },
  ],
  "ar-condicionado": [
    { nome: "Limpeza de Ar-Condicionado Split", descricao: "Higienizacao completa do evaporador e filtros do split.", duracaoMin: 60, recorrenciaDias: 90, precoBase: 150 },
    { nome: "Manutencao Preventiva", descricao: "Revisao completa: gas, eletrica, limpeza e teste de funcionamento.", duracaoMin: 90, recorrenciaDias: 180, precoBase: 250 },
    { nome: "Instalacao de Ar-Condicionado", descricao: "Instalacao completa de aparelho split com tubulacao.", duracaoMin: 240, recorrenciaDias: 0, precoBase: 500 },
    { nome: "Carga de Gas Refrigerante", descricao: "Recarga de gas R410a ou R22 com teste de vazamento.", duracaoMin: 60, recorrenciaDias: 0, precoBase: 300 },
    { nome: "Limpeza de Duto Central", descricao: "Higienizacao de dutos e grelhas de ar-condicionado central.", duracaoMin: 180, recorrenciaDias: 180, precoBase: 600 },
  ],
  jardinagem: [
    { nome: "Manutencao de Jardim", descricao: "Poda, adubacao, irrigacao e limpeza geral do jardim.", duracaoMin: 120, recorrenciaDias: 15, precoBase: 200 },
    { nome: "Corte de Grama", descricao: "Corte e aparacao de grama com acabamento.", duracaoMin: 90, recorrenciaDias: 15, precoBase: 150 },
    { nome: "Poda de Arvores", descricao: "Poda de formacao e limpeza de arvores e arbustos.", duracaoMin: 180, recorrenciaDias: 90, precoBase: 400 },
    { nome: "Projeto Paisagistico", descricao: "Elaboracao de projeto e implantacao de paisagismo.", duracaoMin: 480, recorrenciaDias: 0, precoBase: 1500 },
    { nome: "Controle de Pragas do Jardim", descricao: "Aplicacao de defensivos e controle biologico de pragas.", duracaoMin: 60, recorrenciaDias: 30, precoBase: 180 },
  ],
  outros: [
    { nome: "Servico Avulso", descricao: "Servico personalizado conforme demanda do cliente.", duracaoMin: 60, recorrenciaDias: 30, precoBase: 150 },
    { nome: "Visita Tecnica", descricao: "Avaliacao e orcamento no local.", duracaoMin: 30, recorrenciaDias: 0, precoBase: 0 },
    { nome: "Manutencao Preventiva", descricao: "Manutencao recorrente conforme contrato.", duracaoMin: 90, recorrenciaDias: 30, precoBase: 200 },
  ],
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nomeEmpresa, nome, email, senha, segmento, codigoIndicacao } = body;

    // Validation
    if (!nomeEmpresa || !nome || !email || !senha || !segmento) {
      return NextResponse.json(
        { error: "Todos os campos sao obrigatorios." },
        { status: 400 }
      );
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email ja esta cadastrado." },
        { status: 409 }
      );
    }

    // Hash password
    const senhaHash = await bcrypt.hash(senha, 12);

    // Calculate trial end date (14 days from now)
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    // Check referral code
    let indicadorTenantId: string | null = null;
    if (codigoIndicacao) {
      const indicador = await prisma.tenant.findUnique({
        where: { codigoIndicacao },
      });
      if (indicador) {
        indicadorTenantId = indicador.id;
      }
    }

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        nome: nomeEmpresa,
        email,
        segmento,
        plano: "trial",
        trialEnd,
        indicadoPorId: indicadorTenantId,
      },
    });

    // Register referral if applicable
    if (indicadorTenantId) {
      await prisma.indicacao.create({
        data: {
          tenantId: indicadorTenantId,
          indicadoEmail: email,
          indicadoNome: nomeEmpresa,
          indicadoTenantId: tenant.id,
          status: "convertida",
          recompensa: "1_mes_gratis",
        },
      });
    }

    // Create admin user
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        nome,
        email,
        senha: senhaHash,
        role: "admin",
      },
    });

    // Create default services for the segment
    const servicosPadrao = SERVICOS_POR_SEGMENTO[segmento] || SERVICOS_POR_SEGMENTO["outros"];

    if (servicosPadrao && servicosPadrao.length > 0) {
      await prisma.servico.createMany({
        data: servicosPadrao.map((servico) => ({
          tenantId: tenant.id,
          nome: servico.nome,
          descricao: servico.descricao,
          duracaoMin: servico.duracaoMin,
          recorrenciaDias: servico.recorrenciaDias,
          precoBase: servico.precoBase,
          ativo: true,
        })),
      });
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, nome).catch((err) =>
      console.error("[Registro] Erro ao enviar email de boas-vindas:", err)
    );

    return NextResponse.json(
      { message: "Conta criada com sucesso!", tenantId: tenant.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar registro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Tente novamente." },
      { status: 500 }
    );
  }
}
