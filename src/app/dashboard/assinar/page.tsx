"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  ArrowLeft,
  CreditCard,
  Zap,
  Users,
  Building,
  Star,
  Shield,
  Clock,
  Loader2,
} from "lucide-react";

interface PlanoInfo {
  nome: string;
  precoMensal: number;
  precoAnual: number;
  usuarios: number;
  clientes: number;
  descricao: string;
}

interface AssinaturaData {
  plano: string;
  planoPeriodo: string;
  diasRestantesTrial: number;
  planos: Record<string, PlanoInfo>;
}

export default function AssinarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<AssinaturaData | null>(null);
  const [selectedPlano, setSelectedPlano] = useState<string>("profissional");
  const [periodo, setPeriodo] = useState<"mensal" | "anual">("mensal");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<"pix" | "boleto" | "cartao">("pix");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchAssinatura();
  }, []);

  async function fetchAssinatura() {
    try {
      const res = await fetch("/api/assinaturas");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/assinaturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plano: selectedPlano,
          periodo,
          cpfCnpj: cpfCnpj.replace(/\D/g, ""),
          formaPagamento,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Erro ao criar assinatura");
      }

      setSuccess("Assinatura criada com sucesso! Você receberá as instruções de pagamento por email.");

      // Redireciona após 3 segundos
      setTimeout(() => {
        router.push("/dashboard/configuracoes");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar assinatura");
    } finally {
      setSubmitting(false);
    }
  }

  function formatarCpfCnpj(value: string) {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const planos = data?.planos || {};
  const planoSelecionado = planos[selectedPlano];
  const valorFinal = periodo === "anual" ? planoSelecionado?.precoAnual : planoSelecionado?.precoMensal;
  const economia = periodo === "anual" ? (planoSelecionado?.precoMensal * 12) - planoSelecionado?.precoAnual : 0;

  return (
    <div className="min-h-screen bg-dark-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-dark-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Assinar Plano</h1>
            <p className="text-dark-400 text-sm">
              {data?.diasRestantesTrial && data.diasRestantesTrial > 0
                ? `${data.diasRestantesTrial} dias restantes no trial`
                : "Escolha o melhor plano para sua empresa"}
            </p>
          </div>
        </div>

        {/* Erro/Sucesso */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna da esquerda - Seleção de plano */}
          <div className="lg:col-span-2 space-y-6">
            {/* Toggle Mensal/Anual */}
            <div className="flex items-center justify-center gap-4 p-2 rounded-xl bg-dark-800">
              <button
                type="button"
                onClick={() => setPeriodo("mensal")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  periodo === "mensal"
                    ? "bg-brand-500 text-white"
                    : "text-dark-400 hover:text-white"
                }`}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setPeriodo("anual")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  periodo === "anual"
                    ? "bg-brand-500 text-white"
                    : "text-dark-400 hover:text-white"
                }`}
              >
                Anual
                <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                  2 meses grátis
                </span>
              </button>
            </div>

            {/* Cards dos Planos */}
            <div className="grid sm:grid-cols-3 gap-4">
              {Object.entries(planos).map(([key, plano]) => {
                const isSelected = selectedPlano === key;
                const preco = periodo === "anual" ? plano.precoAnual : plano.precoMensal;
                const Icon = key === "starter" ? Zap : key === "profissional" ? Users : Building;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedPlano(key)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-brand-500 bg-brand-500/10"
                        : "border-dark-700 bg-dark-800 hover:border-dark-600"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-5 h-5 ${isSelected ? "text-brand-400" : "text-dark-400"}`} />
                      <span className={`font-semibold ${isSelected ? "text-white" : "text-dark-300"}`}>
                        {plano.nome}
                      </span>
                      {key === "profissional" && (
                        <span className="text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded font-bold">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <div className="mb-2">
                      <span className={`text-2xl font-bold ${isSelected ? "text-white" : "text-dark-200"}`}>
                        R$ {preco.toLocaleString("pt-BR")}
                      </span>
                      <span className="text-dark-500 text-sm">/{periodo === "anual" ? "ano" : "mês"}</span>
                    </div>
                    <p className="text-dark-400 text-xs">{plano.descricao}</p>
                    <div className="mt-3 pt-3 border-t border-dark-700 text-xs text-dark-400">
                      <p>{plano.usuarios === -1 ? "Usuários ilimitados" : `${plano.usuarios} usuário(s)`}</p>
                      <p>{plano.clientes === -1 ? "Clientes ilimitados" : `Até ${plano.clientes} clientes`}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* CPF/CNPJ */}
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  CPF ou CNPJ *
                </label>
                <input
                  type="text"
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(formatarCpfCnpj(e.target.value))}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  maxLength={18}
                  required
                  className="input-field"
                />
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Forma de Pagamento *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "pix", label: "PIX", desc: "Aprovação imediata" },
                    { id: "boleto", label: "Boleto", desc: "Até 3 dias úteis" },
                    { id: "cartao", label: "Cartão", desc: "Aprovação imediata" },
                  ].map((forma) => (
                    <button
                      key={forma.id}
                      type="button"
                      onClick={() => setFormaPagamento(forma.id as typeof formaPagamento)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        formaPagamento === forma.id
                          ? "border-brand-500 bg-brand-500/10"
                          : "border-dark-700 bg-dark-800 hover:border-dark-600"
                      }`}
                    >
                      <span className={`block font-medium ${formaPagamento === forma.id ? "text-white" : "text-dark-300"}`}>
                        {forma.label}
                      </span>
                      <span className="text-dark-500 text-xs">{forma.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botão Submit */}
              <button
                type="submit"
                disabled={submitting || !cpfCnpj}
                className="btn-primary w-full justify-center !py-4 text-base disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Assinar Agora - R$ {valorFinal?.toLocaleString("pt-BR")}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Coluna da direita - Resumo */}
          <div className="space-y-4">
            {/* Resumo do Pedido */}
            <div className="p-5 rounded-xl bg-dark-800 border border-dark-700">
              <h3 className="text-white font-semibold mb-4">Resumo do Pedido</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">Plano</span>
                  <span className="text-white font-medium">{planoSelecionado?.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Período</span>
                  <span className="text-white">{periodo === "anual" ? "Anual" : "Mensal"}</span>
                </div>
                {periodo === "anual" && economia > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Economia</span>
                    <span>R$ {economia.toLocaleString("pt-BR")}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-dark-700 flex justify-between">
                  <span className="text-dark-300 font-medium">Total</span>
                  <span className="text-white font-bold text-lg">
                    R$ {valorFinal?.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>

            {/* Garantias */}
            <div className="p-5 rounded-xl bg-dark-800 border border-dark-700">
              <h3 className="text-white font-semibold mb-4">Garantias</h3>
              <div className="space-y-3">
                {[
                  { icon: Shield, text: "Garantia de 30 dias" },
                  { icon: Clock, text: "Cancele quando quiser" },
                  { icon: Star, text: "Suporte prioritário" },
                  { icon: CheckCircle, text: "Dados seguros (LGPD)" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-dark-400">
                    <item.icon className="w-4 h-4 text-brand-500" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Precisa de ajuda? */}
            <div className="p-5 rounded-xl bg-brand-500/5 border border-brand-500/20">
              <h3 className="text-white font-semibold mb-2">Precisa de ajuda?</h3>
              <p className="text-dark-400 text-sm mb-3">
                Fale com nossa equipe pelo WhatsApp
              </p>
              <a
                href="https://wa.me/5548991420313"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full justify-center text-sm"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
