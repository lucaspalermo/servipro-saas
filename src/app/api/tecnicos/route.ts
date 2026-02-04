import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const tecnicos = await prisma.tecnico.findMany({
    where: { tenantId },
    orderBy: { nome: "asc" },
  });

  // Enrich with stats
  const enriched = await Promise.all(
    tecnicos.map(async (t) => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      const [osConcluidas, osAbertas, agendaHoje] = await Promise.all([
        prisma.ordemServico.count({
          where: { tecnicoId: t.id, status: { in: ["concluida", "faturada"] } },
        }),
        prisma.ordemServico.count({
          where: { tecnicoId: t.id, status: { in: ["aberta", "em_deslocamento", "em_andamento"] } },
        }),
        prisma.agendamento.count({
          where: {
            tecnicoId: t.id,
            dataAgendada: { gte: hoje, lt: amanha },
            status: { not: "cancelado" },
          },
        }),
      ]);

      return { ...t, osConcluidas, osAbertas, agendaHoje };
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const body = await req.json();

  if (!body.nome) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

  const tecnico = await prisma.tecnico.create({
    data: {
      tenantId,
      nome: body.nome,
      telefone: body.telefone || null,
      email: body.email || null,
      cpf: body.cpf || null,
      regiao: body.regiao || null,
      especialidades: body.especialidades || null,
      comissao: body.comissao ? parseFloat(body.comissao) : 10,
    },
  });

  return NextResponse.json(tecnico, { status: 201 });
}
