import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consultarPagamento, mapearStatusMP, getAccessToken } from "@/lib/mercadopago";

// GET - Buscar dados publicos da cobranca para pagina de pagamento
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Buscar por externalId (UUID gerado na criacao) ou por id do registro
  const cobranca = await prisma.cobranca.findFirst({
    where: {
      OR: [
        { externalId: id },
        { id: id },
      ],
    },
    include: {
      tenant: { select: { nome: true, telefone: true, email: true } },
      cliente: { select: { nome: true } },
    },
  });

  if (!cobranca) {
    return NextResponse.json({ error: "Cobranca nao encontrada" }, { status: 404 });
  }

  // Se pendente e tem payment ID numerico, tentar sincronizar status
  if (cobranca.status === "pendente" && cobranca.externalId && /^\d+$/.test(cobranca.externalId)) {
    const accessToken = await getAccessToken(prisma, cobranca.tenantId);
    if (accessToken) {
      const mpStatus = await consultarPagamento(accessToken, cobranca.externalId);
      if (mpStatus) {
        const novoStatus = mapearStatusMP(mpStatus.status);
        if (novoStatus !== cobranca.status) {
          await prisma.cobranca.update({
            where: { id: cobranca.id },
            data: {
              status: novoStatus,
              dataPagamento: novoStatus === "pago" ? new Date(mpStatus.dataPagamento || Date.now()) : null,
            },
          });
          cobranca.status = novoStatus;
        }
      }
    }
  }

  // Retornar dados publicos (sem expor tokens ou IDs internos)
  return NextResponse.json({
    descricao: cobranca.descricao,
    valor: cobranca.valor,
    tipo: cobranca.tipo,
    status: cobranca.status,
    dataVencimento: cobranca.dataVencimento,
    dataPagamento: cobranca.dataPagamento,
    chavePix: cobranca.chavePix,
    qrCode: cobranca.qrCode,
    codigoBoleto: cobranca.codigoBoleto,
    linkPagamento: cobranca.linkPagamento,
    empresa: cobranca.tenant.nome,
    empresaTelefone: cobranca.tenant.telefone,
    empresaEmail: cobranca.tenant.email,
    clienteNome: cobranca.cliente.nome,
  });
}
