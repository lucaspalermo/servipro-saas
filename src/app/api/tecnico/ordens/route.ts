import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get today's service orders for the logged-in user's tenant
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;
  const url = req.nextUrl.searchParams;
  const tecnicoId = url.get("tecnicoId") || "";
  const data = url.get("data") || new Date().toISOString().split("T")[0];

  const startOfDay = new Date(data);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(data);
  endOfDay.setHours(23, 59, 59, 999);

  const where: any = {
    tenantId,
    dataExecucao: {
      gte: startOfDay,
      lte: endOfDay,
    },
  };

  if (tecnicoId) {
    where.tecnicoId = tecnicoId;
  }

  try {
    const ordens = await prisma.ordemServico.findMany({
      where,
      include: {
        cliente: {
          select: {
            nome: true,
            telefone: true,
            whatsapp: true,
            endereco: true,
            numero: true,
            bairro: true,
            cidade: true,
          },
        },
        servico: { select: { nome: true, duracaoMin: true } },
        tecnico: { select: { id: true, nome: true } },
      },
      orderBy: { horaInicio: "asc" },
    });

    return NextResponse.json({ ordens });
  } catch (error) {
    console.error("[Tecnico API] Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// Update service order status (for technician to mark as completed, add notes)
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;
  const body = await req.json();
  const { ordemId, status, obsTecnico } = body;

  if (!ordemId) {
    return NextResponse.json({ error: "ordemId obrigatorio" }, { status: 400 });
  }

  try {
    const ordem = await prisma.ordemServico.findFirst({
      where: { id: ordemId, tenantId },
    });

    if (!ordem) {
      return NextResponse.json({ error: "OS nao encontrada" }, { status: 404 });
    }

    const data: any = {};
    if (status) data.status = status;
    if (obsTecnico !== undefined) data.obsTecnico = obsTecnico;

    if (status === "concluida") {
      data.horaFim = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (status === "em_deslocamento" || status === "em_andamento") {
      if (!ordem.horaInicio) {
        data.horaInicio = new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    await prisma.ordemServico.update({
      where: { id: ordemId },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Tecnico API] Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
