import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const user = session.user as any;
  const tenantId = user.tenantId;

  const [tenant, tecnicos, clientes] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.tecnico.count({ where: { tenantId } }),
    prisma.cliente.count({ where: { tenantId } }),
  ]);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { onboardingCompleto: true },
  });

  return NextResponse.json({
    onboardingCompleto: dbUser?.onboardingCompleto ?? false,
    tenant,
    totalTecnicos: tecnicos,
    totalClientes: clientes,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const user = session.user as any;
  const tenantId = user.tenantId;
  const body = await req.json();

  try {
    // Step 1: Update tenant/company info
    if (body.empresa) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          nome: body.empresa.nome || undefined,
          cnpj: body.empresa.cnpj || undefined,
          telefone: body.empresa.telefone || undefined,
          email: body.empresa.email || undefined,
          endereco: body.empresa.endereco || undefined,
        },
      });
    }

    // Step 2: Create technician if provided
    if (body.tecnico && body.tecnico.nome) {
      await prisma.tecnico.create({
        data: {
          tenantId,
          nome: body.tecnico.nome,
          telefone: body.tecnico.telefone || null,
          email: body.tecnico.email || null,
          regiao: body.tecnico.regiao || null,
          comissao: body.tecnico.comissao
            ? parseFloat(body.tecnico.comissao)
            : 10,
        },
      });
    }

    // Step 3: Create client if provided
    if (body.cliente && body.cliente.nome) {
      await prisma.cliente.create({
        data: {
          tenantId,
          nome: body.cliente.nome,
          tipoPessoa: body.cliente.tipoPessoa || "PF",
          cpfCnpj: body.cliente.cpfCnpj || null,
          telefone: body.cliente.telefone || null,
          email: body.cliente.email || null,
          endereco: body.cliente.endereco || null,
        },
      });
    }

    // Mark onboarding as complete
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompleto: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no onboarding:", error);
    return NextResponse.json(
      { error: "Erro ao salvar dados do onboarding" },
      { status: 500 }
    );
  }
}
