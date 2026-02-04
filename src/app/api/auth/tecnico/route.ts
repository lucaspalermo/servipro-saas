import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "servipro-secret";

// POST - Login do tecnico
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json(
        { error: "Email e senha obrigatorios" },
        { status: 400 }
      );
    }

    const tecnico = await prisma.tecnico.findFirst({
      where: { email, loginAtivo: true, ativo: true },
      include: { tenant: { select: { id: true, nome: true } } },
    });

    if (!tecnico || !tecnico.senha) {
      return NextResponse.json(
        { error: "Credenciais invalidas" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(senha, tecnico.senha);
    if (!valid) {
      return NextResponse.json(
        { error: "Credenciais invalidas" },
        { status: 401 }
      );
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        tecnicoId: tecnico.id,
        tenantId: tecnico.tenant.id,
        tenantNome: tecnico.tenant.nome,
        nome: tecnico.nome,
        tipo: "tecnico",
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      token,
      tecnico: {
        id: tecnico.id,
        nome: tecnico.nome,
        email: tecnico.email,
        tenantNome: tecnico.tenant.nome,
      },
    });
  } catch (error) {
    console.error("[Tecnico Auth] Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
