import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;
  const { id } = await params;

  const os = await prisma.ordemServico.findFirst({
    where: { id, tenantId },
    include: {
      cliente: true,
      tecnico: { select: { id: true, nome: true, telefone: true, email: true } },
      servico: { select: { id: true, nome: true, descricao: true, precoBase: true } },
      contrato: {
        select: {
          id: true,
          descricao: true,
          valorMensal: true,
          recorrenciaDias: true,
          status: true,
        },
      },
      tenant: {
        select: {
          id: true,
          nome: true,
          cnpj: true,
          email: true,
          telefone: true,
          endereco: true,
          segmento: true,
        },
      },
    },
  });

  if (!os) {
    return NextResponse.json({ error: "Ordem de servico nao encontrada" }, { status: 404 });
  }

  return NextResponse.json(os);
}
