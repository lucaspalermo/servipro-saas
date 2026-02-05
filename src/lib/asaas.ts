/**
 * Integração com Asaas para assinaturas recorrentes
 * Documentação: https://docs.asaas.com/
 */

const ASAAS_API_URL = process.env.ASAAS_SANDBOX === "true"
  ? "https://sandbox.asaas.com/api/v3"
  : "https://api.asaas.com/api/v3";

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

interface AsaasCustomer {
  id?: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  externalReference?: string;
}

interface AsaasSubscription {
  id?: string;
  customer: string;
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";
  value: number;
  nextDueDate: string;
  cycle: "MONTHLY" | "YEARLY";
  description: string;
  externalReference?: string;
}

interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  netValue: number;
  status: "PENDING" | "RECEIVED" | "CONFIRMED" | "OVERDUE" | "REFUNDED" | "RECEIVED_IN_CASH" | "REFUND_REQUESTED" | "CHARGEBACK_REQUESTED" | "CHARGEBACK_DISPUTE" | "AWAITING_CHARGEBACK_REVERSAL" | "DUNNING_REQUESTED" | "DUNNING_RECEIVED" | "AWAITING_RISK_ANALYSIS";
  billingType: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixQrCodeId?: string;
  pixCopiaECola?: string;
}

async function asaasRequest(endpoint: string, method: string = "GET", body?: object) {
  const response = await fetch(`${ASAAS_API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "access_token": ASAAS_API_KEY || "",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[Asaas] Erro:", data);
    throw new Error(data.errors?.[0]?.description || "Erro na API Asaas");
  }

  return data;
}

/**
 * Cria ou atualiza um cliente no Asaas
 */
export async function criarClienteAsaas(customer: AsaasCustomer): Promise<AsaasCustomer> {
  // Primeiro, busca se já existe pelo CPF/CNPJ
  const existing = await asaasRequest(`/customers?cpfCnpj=${customer.cpfCnpj}`);

  if (existing.data && existing.data.length > 0) {
    // Atualiza cliente existente
    const customerId = existing.data[0].id;
    return await asaasRequest(`/customers/${customerId}`, "PUT", customer);
  }

  // Cria novo cliente
  return await asaasRequest("/customers", "POST", customer);
}

/**
 * Busca cliente por CPF/CNPJ
 */
export async function buscarClienteAsaas(cpfCnpj: string): Promise<AsaasCustomer | null> {
  const result = await asaasRequest(`/customers?cpfCnpj=${cpfCnpj}`);
  return result.data?.[0] || null;
}

/**
 * Busca cliente por external reference (tenantId)
 */
export async function buscarClientePorTenant(tenantId: string): Promise<AsaasCustomer | null> {
  const result = await asaasRequest(`/customers?externalReference=${tenantId}`);
  return result.data?.[0] || null;
}

/**
 * Cria uma assinatura recorrente
 */
export async function criarAssinaturaAsaas(subscription: AsaasSubscription): Promise<AsaasSubscription> {
  return await asaasRequest("/subscriptions", "POST", subscription);
}

/**
 * Busca assinatura por ID
 */
export async function buscarAssinatura(subscriptionId: string): Promise<AsaasSubscription> {
  return await asaasRequest(`/subscriptions/${subscriptionId}`);
}

/**
 * Busca assinaturas de um cliente
 */
export async function buscarAssinaturasCliente(customerId: string) {
  return await asaasRequest(`/subscriptions?customer=${customerId}`);
}

/**
 * Cancela uma assinatura
 */
export async function cancelarAssinatura(subscriptionId: string): Promise<void> {
  await asaasRequest(`/subscriptions/${subscriptionId}`, "DELETE");
}

/**
 * Atualiza uma assinatura (ex: mudar plano)
 */
export async function atualizarAssinatura(subscriptionId: string, data: Partial<AsaasSubscription>) {
  return await asaasRequest(`/subscriptions/${subscriptionId}`, "PUT", data);
}

/**
 * Busca pagamento por ID
 */
export async function buscarPagamento(paymentId: string): Promise<AsaasPayment> {
  return await asaasRequest(`/payments/${paymentId}`);
}

/**
 * Busca pagamentos de uma assinatura
 */
export async function buscarPagamentosAssinatura(subscriptionId: string) {
  return await asaasRequest(`/subscriptions/${subscriptionId}/payments`);
}

/**
 * Gera QR Code PIX para um pagamento
 */
export async function gerarPixQrCode(paymentId: string) {
  return await asaasRequest(`/payments/${paymentId}/pixQrCode`);
}

/**
 * Gera link de pagamento (checkout Asaas)
 */
export async function gerarLinkPagamento(paymentId: string) {
  return await asaasRequest(`/payments/${paymentId}/identificationField`);
}

/**
 * Planos disponíveis
 */
export const PLANOS = {
  starter: {
    nome: "Starter",
    precoMensal: 97,
    precoAnual: 970, // ~2 meses grátis
    usuarios: 1,
    clientes: 100,
    descricao: "Ideal para começar",
  },
  profissional: {
    nome: "Profissional",
    precoMensal: 197,
    precoAnual: 1970, // ~2 meses grátis
    usuarios: 5,
    clientes: 500,
    descricao: "Para empresas em crescimento",
  },
  enterprise: {
    nome: "Enterprise",
    precoMensal: 397,
    precoAnual: 3970, // ~2 meses grátis
    usuarios: -1, // ilimitado
    clientes: -1, // ilimitado
    descricao: "Para grandes operações",
  },
};

/**
 * Mapeia status do Asaas para status interno
 */
export function mapearStatusAsaas(status: string): "ativo" | "pendente" | "cancelado" | "inadimplente" {
  switch (status) {
    case "RECEIVED":
    case "CONFIRMED":
    case "RECEIVED_IN_CASH":
      return "ativo";
    case "PENDING":
    case "AWAITING_RISK_ANALYSIS":
      return "pendente";
    case "OVERDUE":
    case "DUNNING_REQUESTED":
      return "inadimplente";
    case "REFUNDED":
    case "REFUND_REQUESTED":
    case "CHARGEBACK_REQUESTED":
    case "CHARGEBACK_DISPUTE":
      return "cancelado";
    default:
      return "pendente";
  }
}

/**
 * Calcula próxima data de vencimento
 */
export function proximaDataVencimento(): string {
  const hoje = new Date();
  // Se hoje for depois do dia 28, coloca pro próximo mês
  if (hoje.getDate() > 28) {
    hoje.setMonth(hoje.getMonth() + 1);
  }
  hoje.setDate(Math.min(hoje.getDate() + 1, 28)); // Max dia 28 para evitar problemas
  return hoje.toISOString().split("T")[0];
}
