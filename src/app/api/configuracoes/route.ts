import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const url = req.nextUrl.searchParams;
  const tipo = url.get("tipo"); // "servicos" | "tenant" | null

  if (tipo === "servicos") {
    const servicos = await prisma.servico.findMany({
      where: { tenantId },
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(servicos);
  }

  if (tipo === "tenant") {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    return NextResponse.json(tenant);
  }

  // Configs gerais
  const configs = await prisma.configuracao.findMany({ where: { tenantId } });
  return NextResponse.json(configs);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const body = await req.json();

  // Update tenant info
  if (body.tipo === "tenant") {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        nome: body.nome,
        cnpj: body.cnpj || null,
        email: body.email || null,
        telefone: body.telefone || null,
        endereco: body.endereco || null,
      },
    });
    return NextResponse.json({ message: "Atualizado" });
  }

  // Update/create servico
  if (body.tipo === "servico") {
    if (body.id) {
      await prisma.servico.updateMany({
        where: { id: body.id, tenantId },
        data: {
          nome: body.nome,
          descricao: body.descricao || null,
          precoBase: body.precoBase ? parseFloat(body.precoBase) : 0,
          duracaoMin: body.duracaoMin ? parseInt(body.duracaoMin) : 60,
          recorrenciaDias: body.recorrenciaDias ? parseInt(body.recorrenciaDias) : 30,
          ativo: body.ativo !== undefined ? body.ativo : true,
        },
      });
    } else {
      await prisma.servico.create({
        data: {
          tenantId,
          nome: body.nome,
          descricao: body.descricao || null,
          precoBase: body.precoBase ? parseFloat(body.precoBase) : 0,
          duracaoMin: body.duracaoMin ? parseInt(body.duracaoMin) : 60,
          recorrenciaDias: body.recorrenciaDias ? parseInt(body.recorrenciaDias) : 30,
        },
      });
    }
    return NextResponse.json({ message: "Salvo" });
  }

  return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
}
