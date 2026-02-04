import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "servicfy-secret";

function verifyTecnicoToken(req: NextRequest): { tecnicoId: string; tenantId: string } | null {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  try {
    const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET) as any;
    if (decoded.tipo !== "tecnico") return null;
    return { tecnicoId: decoded.tecnicoId, tenantId: decoded.tenantId };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const auth = verifyTecnicoToken(req);
  if (!auth) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const url = req.nextUrl.searchParams;
  const data = url.get("data") || new Date().toISOString().split("T")[0];

  const startOfDay = new Date(data);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(data);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const ordens = await prisma.ordemServico.findMany({
      where: {
        tenantId: auth.tenantId,
        tecnicoId: auth.tecnicoId,
        dataExecucao: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        cliente: {
          select: { nome: true, telefone: true, whatsapp: true, endereco: true, numero: true, bairro: true, cidade: true },
        },
        servico: { select: { nome: true, duracaoMin: true } },
        tecnico: { select: { id: true, nome: true } },
      },
      orderBy: { horaInicio: "asc" },
    });

    return NextResponse.json({ ordens });
  } catch (error) {
    console.error("[Tecnico Painel] Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = verifyTecnicoToken(req);
  if (!auth) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const body = await req.json();
  const { ordemId, status, obsTecnico } = body;

  if (!ordemId) return NextResponse.json({ error: "ordemId obrigatorio" }, { status: 400 });

  try {
    const ordem = await prisma.ordemServico.findFirst({
      where: { id: ordemId, tenantId: auth.tenantId, tecnicoId: auth.tecnicoId },
    });
    if (!ordem) return NextResponse.json({ error: "OS nao encontrada" }, { status: 404 });

    const data: any = {};
    if (status) data.status = status;
    if (obsTecnico !== undefined) data.obsTecnico = obsTecnico;
    if (status === "concluida") {
      data.horaFim = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
    if ((status === "em_deslocamento" || status === "em_andamento") && !ordem.horaInicio) {
      data.horaInicio = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }

    await prisma.ordemServico.update({ where: { id: ordemId }, data });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Tecnico Painel] Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
