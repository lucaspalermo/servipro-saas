import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Tenant demo
  const tenant = await prisma.tenant.create({
    data: {
      nome: "Dedetiza Pro SP",
      cnpj: "12.345.678/0001-90",
      email: "contato@dedetizapro.com.br",
      telefone: "(11) 3000-0000",
      endereco: "Rua Augusta, 500 - São Paulo/SP",
      segmento: "dedetizadora",
      plano: "profissional",
    },
  });

  // Admin user
  const senhaHash = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      nome: "Administrador",
      email: "admin@servicfy.com",
      senha: senhaHash,
      role: "admin",
    },
  });

  // Técnicos
  const tec1 = await prisma.tecnico.create({
    data: {
      tenantId: tenant.id,
      nome: "Carlos Silva",
      telefone: "(11) 99999-0001",
      email: "carlos@dedetizapro.com.br",
      regiao: "Zona Sul",
      especialidades: "Dedetização, Descupinização",
      comissao: 10,
    },
  });
  const tec2 = await prisma.tecnico.create({
    data: {
      tenantId: tenant.id,
      nome: "Maria Santos",
      telefone: "(11) 99999-0002",
      email: "maria@dedetizapro.com.br",
      regiao: "Zona Norte",
      especialidades: "Dedetização, Desratização",
      comissao: 12,
    },
  });

  // Serviços
  const servicos = await Promise.all([
    prisma.servico.create({ data: { tenantId: tenant.id, nome: "Dedetização Geral", descricao: "Controle de baratas, formigas e insetos rasteiros", precoBase: 250, duracaoMin: 90, recorrenciaDias: 90 } }),
    prisma.servico.create({ data: { tenantId: tenant.id, nome: "Desratização", descricao: "Controle de roedores com iscagem", precoBase: 300, duracaoMin: 60, recorrenciaDias: 90 } }),
    prisma.servico.create({ data: { tenantId: tenant.id, nome: "Descupinização", descricao: "Tratamento contra cupins de solo e madeira", precoBase: 500, duracaoMin: 120, recorrenciaDias: 180 } }),
    prisma.servico.create({ data: { tenantId: tenant.id, nome: "Controle de Mosquitos", descricao: "Nebulização e larvicida", precoBase: 200, duracaoMin: 45, recorrenciaDias: 30 } }),
    prisma.servico.create({ data: { tenantId: tenant.id, nome: "Sanitização de Ambientes", descricao: "Desinfecção profissional", precoBase: 180, duracaoMin: 60, recorrenciaDias: 30 } }),
  ]);

  // Clientes
  const hoje = new Date();
  const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  const clientes = await Promise.all([
    prisma.cliente.create({ data: { tenantId: tenant.id, tipoPessoa: "PF", nome: "João Mendes", cpfCnpj: "123.456.789-00", email: "joao@email.com", telefone: "(11) 98765-0001", whatsapp: "(11) 98765-0001", cep: "01310-100", endereco: "Av. Paulista", numero: "1000", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", tipoImovel: "residencial", areaM2: 85 } }),
    prisma.cliente.create({ data: { tenantId: tenant.id, tipoPessoa: "PJ", nome: "Restaurante Sabor & Arte", razaoSocial: "Sabor e Arte Ltda", cpfCnpj: "12.345.678/0001-90", email: "contato@saborarte.com", telefone: "(11) 3333-0001", whatsapp: "(11) 99999-0010", cep: "04538-132", endereco: "Rua Funchal", numero: "500", bairro: "Vila Olímpia", cidade: "São Paulo", estado: "SP", tipoImovel: "comercial", areaM2: 200 } }),
    prisma.cliente.create({ data: { tenantId: tenant.id, tipoPessoa: "PJ", nome: "Condomínio Jardins", razaoSocial: "Cond. Res. Jardins", cpfCnpj: "23.456.789/0001-01", email: "sindico@condjardin.com", telefone: "(11) 3333-0002", cep: "01424-001", endereco: "Rua Oscar Freire", numero: "800", bairro: "Jardins", cidade: "São Paulo", estado: "SP", tipoImovel: "condominio", areaM2: 5000 } }),
    prisma.cliente.create({ data: { tenantId: tenant.id, tipoPessoa: "PF", nome: "Ana Paula Costa", cpfCnpj: "987.654.321-00", email: "ana@email.com", telefone: "(11) 98765-0003", whatsapp: "(11) 98765-0003", endereco: "Rua Voluntários da Pátria", numero: "200", bairro: "Santana", cidade: "São Paulo", estado: "SP", tipoImovel: "residencial", areaM2: 120 } }),
    prisma.cliente.create({ data: { tenantId: tenant.id, tipoPessoa: "PJ", nome: "Padaria Central", razaoSocial: "Padaria Central Ltda ME", cpfCnpj: "34.567.890/0001-12", email: "padaria@email.com", telefone: "(11) 3333-0004", whatsapp: "(11) 99999-0040", endereco: "Rua do Oratório", numero: "150", bairro: "Mooca", cidade: "São Paulo", estado: "SP", tipoImovel: "comercial", areaM2: 150 } }),
  ]);

  // Contratos
  const contratos = await Promise.all([
    prisma.contrato.create({ data: { tenantId: tenant.id, clienteId: clientes[0].id, servicoId: servicos[0].id, descricao: "Dedetização trimestral residencial", valorMensal: 250, recorrenciaDias: 90, dataInicio: addDays(hoje, -60), proximoServico: addDays(hoje, 30), status: "ativo" } }),
    prisma.contrato.create({ data: { tenantId: tenant.id, clienteId: clientes[1].id, servicoId: servicos[0].id, descricao: "Dedetização mensal - restaurante", valorMensal: 400, recorrenciaDias: 30, dataInicio: addDays(hoje, -90), proximoServico: addDays(hoje, 5), status: "ativo" } }),
    prisma.contrato.create({ data: { tenantId: tenant.id, clienteId: clientes[1].id, servicoId: servicos[1].id, descricao: "Desratização mensal - restaurante", valorMensal: 300, recorrenciaDias: 30, dataInicio: addDays(hoje, -90), proximoServico: addDays(hoje, 3), status: "ativo" } }),
    prisma.contrato.create({ data: { tenantId: tenant.id, clienteId: clientes[2].id, servicoId: servicos[0].id, descricao: "Dedetização bimestral - condomínio", valorMensal: 800, recorrenciaDias: 60, dataInicio: addDays(hoje, -30), proximoServico: addDays(hoje, 30), status: "ativo" } }),
    prisma.contrato.create({ data: { tenantId: tenant.id, clienteId: clientes[4].id, servicoId: servicos[0].id, descricao: "Dedetização mensal - padaria", valorMensal: 350, recorrenciaDias: 30, dataInicio: addDays(hoje, -60), proximoServico: addDays(hoje, -5), status: "ativo" } }),
  ]);

  // Agendamentos
  await Promise.all([
    prisma.agendamento.create({ data: { tenantId: tenant.id, clienteId: clientes[0].id, servicoId: servicos[0].id, tecnicoId: tec1.id, dataAgendada: hoje, horaInicio: "08:00", horaFim: "09:30", status: "confirmado", observacoes: "Cliente solicitou horário pela manhã", recorrente: true } }),
    prisma.agendamento.create({ data: { tenantId: tenant.id, clienteId: clientes[1].id, servicoId: servicos[0].id, tecnicoId: tec1.id, dataAgendada: hoje, horaInicio: "10:00", horaFim: "11:00", status: "agendado", recorrente: true } }),
    prisma.agendamento.create({ data: { tenantId: tenant.id, clienteId: clientes[1].id, servicoId: servicos[1].id, tecnicoId: tec2.id, dataAgendada: hoje, horaInicio: "14:00", horaFim: "15:00", status: "agendado", recorrente: true } }),
    prisma.agendamento.create({ data: { tenantId: tenant.id, clienteId: clientes[2].id, servicoId: servicos[0].id, tecnicoId: tec2.id, dataAgendada: addDays(hoje, 1), horaInicio: "08:00", horaFim: "10:00", status: "agendado", recorrente: true } }),
    prisma.agendamento.create({ data: { tenantId: tenant.id, clienteId: clientes[3].id, servicoId: servicos[0].id, tecnicoId: tec1.id, dataAgendada: addDays(hoje, 2), horaInicio: "09:00", horaFim: "10:30", status: "agendado" } }),
    prisma.agendamento.create({ data: { tenantId: tenant.id, clienteId: clientes[4].id, servicoId: servicos[0].id, tecnicoId: tec2.id, dataAgendada: addDays(hoje, -1), horaInicio: "08:00", horaFim: "09:00", status: "concluido", recorrente: true } }),
    prisma.agendamento.create({ data: { tenantId: tenant.id, clienteId: clientes[0].id, servicoId: servicos[3].id, tecnicoId: tec1.id, dataAgendada: addDays(hoje, 5), horaInicio: "08:00", horaFim: "09:00", status: "agendado", recorrente: true } }),
    prisma.agendamento.create({ data: { tenantId: tenant.id, clienteId: clientes[4].id, servicoId: servicos[4].id, tecnicoId: tec2.id, dataAgendada: addDays(hoje, -3), horaInicio: "10:00", horaFim: "11:00", status: "concluido" } }),
  ]);

  // Ordens de Serviço
  await Promise.all([
    prisma.ordemServico.create({ data: { tenantId: tenant.id, numero: "OS-2026-0001", clienteId: clientes[4].id, tecnicoId: tec2.id, servicoId: servicos[0].id, contratoId: contratos[4].id, dataExecucao: addDays(hoje, -1), horaInicio: "08:00", horaFim: "08:50", status: "concluida", valor: 350, descricao: "Dedetização geral realizada", obsTecnico: "Sem intercorrências" } }),
    prisma.ordemServico.create({ data: { tenantId: tenant.id, numero: "OS-2026-0002", clienteId: clientes[4].id, tecnicoId: tec2.id, servicoId: servicos[4].id, dataExecucao: addDays(hoje, -3), horaInicio: "10:00", horaFim: "10:45", status: "faturada", valor: 180, descricao: "Sanitização completa", obsTecnico: "Produto aplicado em todas as superfícies" } }),
    prisma.ordemServico.create({ data: { tenantId: tenant.id, numero: "OS-2026-0003", clienteId: clientes[1].id, tecnicoId: tec1.id, servicoId: servicos[0].id, contratoId: contratos[1].id, dataExecucao: addDays(hoje, -7), horaInicio: "10:00", horaFim: "10:55", status: "faturada", valor: 400, descricao: "Dedetização mensal realizada" } }),
    prisma.ordemServico.create({ data: { tenantId: tenant.id, numero: "OS-2026-0004", clienteId: clientes[0].id, tecnicoId: tec1.id, servicoId: servicos[0].id, contratoId: contratos[0].id, dataExecucao: hoje, status: "aberta", valor: 250, descricao: "Dedetização trimestral" } }),
    prisma.ordemServico.create({ data: { tenantId: tenant.id, numero: "OS-2026-0005", clienteId: clientes[1].id, tecnicoId: tec1.id, servicoId: servicos[0].id, contratoId: contratos[1].id, dataExecucao: hoje, status: "aberta", valor: 400, descricao: "Dedetização mensal restaurante" } }),
  ]);

  // Financeiro
  await Promise.all([
    prisma.financeiro.create({ data: { tenantId: tenant.id, tipo: "receita", categoria: "Serviço", descricao: "OS-0001 - Dedetização Padaria", valor: 350, dataVencimento: addDays(hoje, -1), dataPagamento: addDays(hoje, -1), status: "pago", clienteId: clientes[4].id, formaPagamento: "pix" } }),
    prisma.financeiro.create({ data: { tenantId: tenant.id, tipo: "receita", categoria: "Serviço", descricao: "OS-0002 - Sanitização Padaria", valor: 180, dataVencimento: addDays(hoje, -3), dataPagamento: addDays(hoje, -2), status: "pago", clienteId: clientes[4].id, formaPagamento: "pix" } }),
    prisma.financeiro.create({ data: { tenantId: tenant.id, tipo: "receita", categoria: "Serviço", descricao: "OS-0003 - Dedetização Restaurante", valor: 400, dataVencimento: addDays(hoje, -7), dataPagamento: addDays(hoje, -6), status: "pago", clienteId: clientes[1].id, formaPagamento: "boleto" } }),
    prisma.financeiro.create({ data: { tenantId: tenant.id, tipo: "receita", categoria: "Contrato", descricao: "Mensalidade Restaurante", valor: 400, dataVencimento: addDays(hoje, 5), status: "pendente", clienteId: clientes[1].id } }),
    prisma.financeiro.create({ data: { tenantId: tenant.id, tipo: "receita", categoria: "Contrato", descricao: "Desratização Restaurante", valor: 300, dataVencimento: addDays(hoje, 3), status: "pendente", clienteId: clientes[1].id } }),
    prisma.financeiro.create({ data: { tenantId: tenant.id, tipo: "despesa", categoria: "Produto", descricao: "Inseticida Demand CS 250ml (5un)", valor: 450, dataVencimento: addDays(hoje, -10), dataPagamento: addDays(hoje, -10), status: "pago", formaPagamento: "cartao" } }),
    prisma.financeiro.create({ data: { tenantId: tenant.id, tipo: "despesa", categoria: "Produto", descricao: "Gel Maxforce Prime (10 bisnagas)", valor: 280, dataVencimento: addDays(hoje, -15), dataPagamento: addDays(hoje, -15), status: "pago", formaPagamento: "cartao" } }),
    prisma.financeiro.create({ data: { tenantId: tenant.id, tipo: "despesa", categoria: "Comissão", descricao: "Comissão Carlos - OS-0001", valor: 35, dataVencimento: addDays(hoje, 5), status: "pendente", tecnicoId: tec1.id } }),
    prisma.financeiro.create({ data: { tenantId: tenant.id, tipo: "despesa", categoria: "Combustível", descricao: "Combustível veículo operacional", valor: 200, dataVencimento: addDays(hoje, -5), dataPagamento: addDays(hoje, -5), status: "pago", formaPagamento: "dinheiro" } }),
  ]);

  console.log("Seed completed!");
  console.log("Login: admin@servicfy.com / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
