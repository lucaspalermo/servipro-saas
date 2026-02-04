// ══════════════════════════════════════════════════════════════════════
// MercadoPago Payment Gateway Integration
// Documentacao: https://www.mercadopago.com.br/developers/pt/reference
// ══════════════════════════════════════════════════════════════════════

const MP_API_BASE = "https://api.mercadopago.com";

interface MPPaymentRequest {
  accessToken: string;
  valor: number;
  descricao: string;
  tipo: "pix" | "boleto";
  pagadorEmail: string;
  pagadorNome: string;
  pagadorCpf?: string;
  dataVencimento?: string; // YYYY-MM-DD
  externalReference?: string;
  notificationUrl?: string;
}

interface MPPixResponse {
  id: number;
  status: string;
  qrCode: string;         // Copia-e-cola do PIX
  qrCodeBase64: string;   // QR code image em base64
  ticketUrl: string;       // Link para pagamento
}

interface MPBoletoResponse {
  id: number;
  status: string;
  barcodeContent: string;  // Linha digitavel
  externalResourceUrl: string; // Link do boleto PDF
  ticketUrl: string;
}

export interface MPPaymentResult {
  success: boolean;
  paymentId?: number;
  status?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  codigoBoleto?: string;
  linkPagamento?: string;
  linkBoleto?: string;
  error?: string;
}

export interface MPPaymentStatus {
  id: number;
  status: string;
  statusDetail: string;
  dataPagamento?: string;
  valorPago?: number;
}

// ── Criar pagamento PIX ─────────────────────────────────────────────
export async function criarPagamentoPix(params: MPPaymentRequest): Promise<MPPaymentResult> {
  try {
    const body = {
      transaction_amount: params.valor,
      description: params.descricao,
      payment_method_id: "pix",
      payer: {
        email: params.pagadorEmail,
        first_name: params.pagadorNome.split(" ")[0],
        last_name: params.pagadorNome.split(" ").slice(1).join(" ") || "Cliente",
        identification: params.pagadorCpf
          ? { type: "CPF", number: params.pagadorCpf.replace(/\D/g, "") }
          : undefined,
      },
      external_reference: params.externalReference || undefined,
      notification_url: params.notificationUrl || undefined,
    };

    const res = await fetch(`${MP_API_BASE}/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.accessToken}`,
        "X-Idempotency-Key": `pix-${params.externalReference || Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || `Erro MercadoPago: ${res.status}`,
      };
    }

    return {
      success: true,
      paymentId: data.id,
      status: data.status,
      qrCode: data.point_of_interaction?.transaction_data?.qr_code || "",
      qrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64 || "",
      linkPagamento: data.point_of_interaction?.transaction_data?.ticket_url || "",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao conectar com MercadoPago" };
  }
}

// ── Criar pagamento Boleto ──────────────────────────────────────────
export async function criarPagamentoBoleto(params: MPPaymentRequest): Promise<MPPaymentResult> {
  try {
    const dataVenc = params.dataVencimento
      ? new Date(params.dataVencimento + "T23:59:59.000-03:00").toISOString()
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const body = {
      transaction_amount: params.valor,
      description: params.descricao,
      payment_method_id: "bolbradesco",
      payer: {
        email: params.pagadorEmail,
        first_name: params.pagadorNome.split(" ")[0],
        last_name: params.pagadorNome.split(" ").slice(1).join(" ") || "Cliente",
        identification: params.pagadorCpf
          ? { type: "CPF", number: params.pagadorCpf.replace(/\D/g, "") }
          : { type: "CPF", number: "00000000000" },
      },
      date_of_expiration: dataVenc,
      external_reference: params.externalReference || undefined,
      notification_url: params.notificationUrl || undefined,
    };

    const res = await fetch(`${MP_API_BASE}/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.accessToken}`,
        "X-Idempotency-Key": `boleto-${params.externalReference || Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || `Erro MercadoPago: ${res.status}`,
      };
    }

    return {
      success: true,
      paymentId: data.id,
      status: data.status,
      codigoBoleto: data.barcode?.content || "",
      linkBoleto: data.transaction_details?.external_resource_url || "",
      linkPagamento: data.transaction_details?.external_resource_url || "",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao conectar com MercadoPago" };
  }
}

// ── Consultar status do pagamento ───────────────────────────────────
export async function consultarPagamento(
  accessToken: string,
  paymentId: number | string
): Promise<MPPaymentStatus | null> {
  try {
    const res = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();

    return {
      id: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      dataPagamento: data.date_approved || undefined,
      valorPago: data.transaction_amount,
    };
  } catch {
    return null;
  }
}

// ── Mapear status do MercadoPago para status interno ────────────────
export function mapearStatusMP(mpStatus: string): string {
  const map: Record<string, string> = {
    approved: "pago",
    pending: "pendente",
    authorized: "pendente",
    in_process: "pendente",
    in_mediation: "pendente",
    rejected: "cancelado",
    cancelled: "cancelado",
    refunded: "cancelado",
    charged_back: "cancelado",
  };
  return map[mpStatus] || "pendente";
}

// ── Obter access token do tenant via Configuracao ───────────────────
export async function getAccessToken(prisma: any, tenantId: string): Promise<string | null> {
  const config = await prisma.configuracao.findUnique({
    where: { tenantId_chave: { tenantId, chave: "mp_access_token" } },
  });
  return config?.valor || process.env.MERCADOPAGO_ACCESS_TOKEN || null;
}
