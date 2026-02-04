"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function TecnicoLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!email || !senha) { setErro("Preencha todos os campos."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/tecnico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error || "Erro ao fazer login."); return; }

      localStorage.setItem("tecnico_token", data.token);
      localStorage.setItem("tecnico_data", JSON.stringify(data.tecnico));
      router.push("/tecnico/painel");
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-brand-500/15 rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 mb-4 shadow-lg shadow-brand-500/20">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Login do Tecnico</h1>
          <p className="text-dark-400 text-sm mt-2">Acesse o painel de campo</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {erro && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {erro}
            </div>
          )}

          <div>
            <label className="block text-sm text-dark-400 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full pl-10"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-dark-400 mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type={showPass ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field w-full pl-10 pr-10"
                placeholder="Sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
          </button>
        </form>

        <p className="text-center text-dark-500 text-xs mt-6">
          Acesso exclusivo para tecnicos cadastrados.
          <br />Solicite seu acesso ao administrador.
        </p>
      </div>
    </div>
  );
}
