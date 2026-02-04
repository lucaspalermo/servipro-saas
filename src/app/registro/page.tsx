"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { captureUTM, getUTM, trackCTAClick } from "../components/ConversionTracker";
import Link from "next/link";
import {
  Building2,
  User,
  Mail,
  Lock,
  Briefcase,
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
} from "lucide-react";

const SEGMENTOS = [
  { value: "dedetizadora", label: "Dedetizadora / Controle de Pragas" },
  { value: "limpeza", label: "Limpeza e Conservacao" },
  { value: "ar-condicionado", label: "Ar-condicionado e Refrigeracao" },
  { value: "jardinagem", label: "Jardinagem e Paisagismo" },
  { value: "outros", label: "Outros segmentos" },
];

export default function RegistroPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nomeEmpresa: "",
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    segmento: "",
    codigoIndicacao: typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("ref") || "" : "",
  });

  useEffect(() => { captureUTM(); }, []);

  const [aceitaTermos, setAceitaTermos] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    // Validations
    if (!form.nomeEmpresa || !form.nome || !form.email || !form.senha || !form.confirmarSenha || !form.segmento) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (!aceitaTermos) {
      setErro("Voce precisa aceitar os termos de uso e politica de privacidade.");
      return;
    }

    if (form.senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas nao coincidem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeEmpresa: form.nomeEmpresa,
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          segmento: form.segmento,
          codigoIndicacao: form.codigoIndicacao || undefined,
          utm: getUTM(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao criar conta. Tente novamente.");
        return;
      }

      trackCTAClick("registro_submit");
      router.push("/obrigado");
    } catch {
      setErro("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-brand-500/15 rounded-full blur-[150px]" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-lg relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Servicfy</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Crie sua conta gratis</h1>
            <p className="text-dark-400 mt-2 text-sm">
              14 dias gratis para testar todos os recursos
            </p>
          </div>

          {/* Error message */}
          {erro && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Company name */}
            <div>
              <label htmlFor="nomeEmpresa" className="block text-sm font-medium text-dark-300 mb-2">
                Nome da Empresa
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="nomeEmpresa"
                  name="nomeEmpresa"
                  type="text"
                  placeholder="Minha Empresa Ltda"
                  value={form.nomeEmpresa}
                  onChange={handleChange}
                  className="input-field !pl-12"
                />
              </div>
            </div>

            {/* Owner name */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-dark-300 mb-2">
                Seu Nome
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Joao da Silva"
                  value={form.nome}
                  onChange={handleChange}
                  className="input-field !pl-12"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field !pl-12"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Segment */}
            <div>
              <label htmlFor="segmento" className="block text-sm font-medium text-dark-300 mb-2">
                Segmento
              </label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <select
                  id="segmento"
                  name="segmento"
                  value={form.segmento}
                  onChange={handleChange}
                  className="input-field !pl-12 appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Selecione o segmento
                  </option>
                  {SEGMENTOS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-dark-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="senha"
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimo 6 caracteres"
                  value={form.senha}
                  onChange={handleChange}
                  className="input-field !pl-12 !pr-12"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-dark-300 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repita a senha"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  className="input-field !pl-12 !pr-12"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* LGPD Consent */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="aceitaTermos"
                checked={aceitaTermos}
                onChange={(e) => setAceitaTermos(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-dark-600 bg-dark-800 text-brand-500 focus:ring-brand-500/20 cursor-pointer"
              />
              <label htmlFor="aceitaTermos" className="text-dark-400 text-xs leading-relaxed cursor-pointer">
                Eu concordo com os{" "}
                <Link href="/politica-privacidade" target="_blank" className="text-brand-400 hover:underline">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link href="/politica-privacidade" target="_blank" className="text-brand-400 hover:underline">
                  Politica de Privacidade
                </Link>
                . Seus dados sao protegidos conforme a LGPD.
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !aceitaTermos}
              className="btn-primary w-full justify-center !py-3.5 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar Conta Gratis
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-4 text-dark-500 text-xs">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Dados seguros
            </span>
            <span className="w-1 h-1 rounded-full bg-dark-600" />
            <span>Sem cartao de credito</span>
            <span className="w-1 h-1 rounded-full bg-dark-600" />
            <span>Cancele quando quiser</span>
          </div>
        </div>

        {/* Login link */}
        <div className="text-center mt-6">
          <p className="text-dark-400 text-sm">
            Ja tem uma conta?{" "}
            <Link
              href="/login"
              className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-dark-600 text-xs">
            &copy; {new Date().getFullYear()} Servicfy. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
