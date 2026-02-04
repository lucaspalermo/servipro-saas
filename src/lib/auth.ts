import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { tenant: true },
        });

        if (!user || !user.ativo) return null;

        const valid = await bcrypt.compare(credentials.senha, user.senha);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          tenantNome: user.tenant.nome,
          plano: user.tenant.plano,
          onboardingCompleto: user.onboardingCompleto,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        token.tenantNome = (user as any).tenantNome;
        token.plano = (user as any).plano;
        token.onboardingCompleto = (user as any).onboardingCompleto;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).tenantNome = token.tenantNome;
        (session.user as any).plano = token.plano;
        (session.user as any).onboardingCompleto = token.onboardingCompleto;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};
