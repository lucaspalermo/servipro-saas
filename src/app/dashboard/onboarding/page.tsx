"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Building2,
  HardHat,
  Users,
  PartyPopper,
  ChevronRight,
  ChevronLeft,
  SkipForward,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface EmpresaData {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
}

interface TecnicoData {
  nome: string;
  telefone: string;
  email: string;
  regiao: string;
  comissao: string;
}

interface ClienteData {
  nome: string;
  tipoPessoa: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
  endereco: string;
}

const steps = [
  { title: "Dados da Empresa", icon: Building2 },
  { title: "Primeiro Tecnico", icon: HardHat },
  { title: "Primeiro Cliente", icon: Users },
  { title: "Pronto!", icon: PartyPopper },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skipTecnico, setSkipTecnico] = useState(false);
  const [skipCliente, setSkipCliente] = useState(false);
  const [existingTecnicos, setExistingTecnicos] = useState(0);
  const [existingClientes, setExistingClientes] = useState(0);

  const [empresa, setEmpresa] = useState<EmpresaData>({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
  });

  const [tecnico, setTecnico] = useState<TecnicoData>({
    nome: "",
    telefone: "",
    email: "",
    regiao: "",
    comissao: "10",
  });

  const [cliente, setCliente] = useState<ClienteData>({
    nome: "",
    tipoPessoa: "PF",
    cpfCnpj: "",
    telefone: "",
    email: "",
    endereco: "",
  });

  // Load existing data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/onboarding");
        if (res.ok) {
          const data = await res.json();

          if (data.onboardingCompleto) {
            router.push("/dashboard");
            return;
          }

          if (data.tenant) {
            setEmpresa({
              nome: data.tenant.nome || "",
              cnpj: data.tenant.cnpj || "",
              telefone: data.tenant.telefone || "",
              email: data.tenant.email || "",
              endereco: data.tenant.endereco || "",
            });
          }

          setExistingTecnicos(data.totalTecnicos || 0);
          setExistingClientes(data.totalClientes || 0);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const payload: any = { empresa };

      if (!skipTecnico && tecnico.nome) {
        payload.tecnico = tecnico;
      }

      if (!skipCliente && cliente.nome) {
        payload.cliente = cliente;
      }

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setCurrentStep(3);
      } else {
        alert("Erro ao salvar dados. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar dados. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-4">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span className="text-sm text-brand-400 font-medium">
            Configuracao Inicial
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Bem-vindo ao ServiPro!
        </h1>
        <p className="text-dark-400 max-w-md mx-auto">
          Vamos configurar sua conta em poucos passos para voce comecar a usar o
          sistema.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between mb-3">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <div
                key={index}
                className="flex flex-col items-center gap-1.5 relative"
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${
                      isCompleted
                        ? "bg-brand-500 text-white"
                        : isCurrent
                        ? "bg-brand-500/20 text-brand-400 ring-2 ring-brand-500"
                        : "bg-dark-800 text-dark-500"
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isCurrent
                      ? "text-brand-400"
                      : isCompleted
                      ? "text-brand-500"
                      : "text-dark-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-dark-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-center mt-2">
          <span className="text-xs text-dark-500">
            Passo {currentStep + 1} de {steps.length}
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="w-full max-w-2xl">
        <div className="bg-dark-900/80 backdrop-blur-xl border border-dark-700 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Step 1: Dados da Empresa */}
          {currentStep === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Dados da Empresa
                  </h2>
                  <p className="text-sm text-dark-400">
                    Informacoes basicas da sua empresa
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    value={empresa.nome}
                    onChange={(e) =>
                      setEmpresa({ ...empresa, nome: e.target.value })
                    }
                    className="input-field"
                    placeholder="Ex: Dedetizadora Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={empresa.cnpj}
                    onChange={(e) =>
                      setEmpresa({ ...empresa, cnpj: e.target.value })
                    }
                    className="input-field"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={empresa.telefone}
                    onChange={(e) =>
                      setEmpresa({ ...empresa, telefone: e.target.value })
                    }
                    className="input-field"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={empresa.email}
                    onChange={(e) =>
                      setEmpresa({ ...empresa, email: e.target.value })
                    }
                    className="input-field"
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Endereco
                  </label>
                  <input
                    type="text"
                    value={empresa.endereco}
                    onChange={(e) =>
                      setEmpresa({ ...empresa, endereco: e.target.value })
                    }
                    className="input-field"
                    placeholder="Rua, numero, bairro, cidade"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Primeiro Tecnico */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Primeiro Tecnico
                  </h2>
                  <p className="text-sm text-dark-400">
                    Cadastre seu primeiro tecnico de campo
                  </p>
                </div>
              </div>

              {existingTecnicos > 0 && (
                <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg p-3 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0" />
                  <span className="text-sm text-brand-300">
                    Voce ja tem {existingTecnicos} tecnico(s) cadastrado(s). Pode
                    pular esta etapa.
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg border border-dark-700">
                <input
                  type="checkbox"
                  id="skipTecnico"
                  checked={skipTecnico}
                  onChange={(e) => setSkipTecnico(e.target.checked)}
                  className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                />
                <label
                  htmlFor="skipTecnico"
                  className="text-sm text-dark-300 cursor-pointer"
                >
                  Pular esta etapa - cadastrar tecnicos depois
                </label>
              </div>

              {!skipTecnico && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                      Nome do Tecnico *
                    </label>
                    <input
                      type="text"
                      value={tecnico.nome}
                      onChange={(e) =>
                        setTecnico({ ...tecnico, nome: e.target.value })
                      }
                      className="input-field"
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={tecnico.telefone}
                      onChange={(e) =>
                        setTecnico({ ...tecnico, telefone: e.target.value })
                      }
                      className="input-field"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={tecnico.email}
                      onChange={(e) =>
                        setTecnico({ ...tecnico, email: e.target.value })
                      }
                      className="input-field"
                      placeholder="tecnico@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                      Regiao de Atuacao
                    </label>
                    <input
                      type="text"
                      value={tecnico.regiao}
                      onChange={(e) =>
                        setTecnico({ ...tecnico, regiao: e.target.value })
                      }
                      className="input-field"
                      placeholder="Ex: Zona Sul, Centro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                      Comissao (%)
                    </label>
                    <input
                      type="number"
                      value={tecnico.comissao}
                      onChange={(e) =>
                        setTecnico({ ...tecnico, comissao: e.target.value })
                      }
                      className="input-field"
                      placeholder="10"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Primeiro Cliente */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Primeiro Cliente
                  </h2>
                  <p className="text-sm text-dark-400">
                    Cadastre seu primeiro cliente
                  </p>
                </div>
              </div>

              {existingClientes > 0 && (
                <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg p-3 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0" />
                  <span className="text-sm text-brand-300">
                    Voce ja tem {existingClientes} cliente(s) cadastrado(s). Pode
                    pular esta etapa.
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg border border-dark-700">
                <input
                  type="checkbox"
                  id="skipCliente"
                  checked={skipCliente}
                  onChange={(e) => setSkipCliente(e.target.checked)}
                  className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                />
                <label
                  htmlFor="skipCliente"
                  className="text-sm text-dark-300 cursor-pointer"
                >
                  Pular esta etapa - cadastrar clientes depois
                </label>
              </div>

              {!skipCliente && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      value={cliente.nome}
                      onChange={(e) =>
                        setCliente({ ...cliente, nome: e.target.value })
                      }
                      className="input-field"
                      placeholder="Nome completo ou razao social"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                      Tipo
                    </label>
                    <select
                      value={cliente.tipoPessoa}
                      onChange={(e) =>
                        setCliente({ ...cliente, tipoPessoa: e.target.value })
                      }
                      className="input-field"
                    >
                      <option value="PF">Pessoa Fisica</option>
                      <option value="PJ">Pessoa Juridica</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                      {cliente.tipoPessoa === "PF" ? "CPF" : "CNPJ"}
                    </label>
                    <input
                      type="text"
                      value={cliente.cpfCnpj}
                      onChange={(e) =>
                        setCliente({ ...cliente, cpfCnpj: e.target.value })
                      }
                      className="input-field"
                      placeholder={
                        cliente.tipoPessoa === "PF"
                          ? "000.000.000-00"
                          : "00.000.000/0000-00"
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={cliente.telefone}
                      onChange={(e) =>
                        setCliente({ ...cliente, telefone: e.target.value })
                      }
                      className="input-field"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={cliente.email}
                      onChange={(e) =>
                        setCliente({ ...cliente, email: e.target.value })
                      }
                      className="input-field"
                      placeholder="cliente@email.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                      Endereco
                    </label>
                    <input
                      type="text"
                      value={cliente.endereco}
                      onChange={(e) =>
                        setCliente({ ...cliente, endereco: e.target.value })
                      }
                      className="input-field"
                      placeholder="Rua, numero, bairro, cidade"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Pronto! */}
          {currentStep === 3 && (
            <div className="text-center py-6">
              {/* CSS Confetti Animation */}
              <div className="confetti-container">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="confetti-piece"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 3}s`,
                      backgroundColor: [
                        "#22c55e",
                        "#3b82f6",
                        "#eab308",
                        "#ef4444",
                        "#a855f7",
                        "#06b6d4",
                      ][Math.floor(Math.random() * 6)],
                    }}
                  />
                ))}
              </div>

              <div className="w-20 h-20 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-6 animate-bounce">
                <PartyPopper className="w-10 h-10 text-brand-400" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">
                Tudo Pronto!
              </h2>
              <p className="text-dark-400 mb-8 max-w-md mx-auto">
                Sua conta foi configurada com sucesso. Veja o resumo do que foi
                configurado:
              </p>

              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-dark-800/60 border border-dark-700 rounded-xl p-4">
                  <Building2 className="w-6 h-6 text-brand-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Empresa</p>
                  <p className="text-xs text-dark-400 mt-1">
                    {empresa.nome || "Configurada"}
                  </p>
                </div>
                <div className="bg-dark-800/60 border border-dark-700 rounded-xl p-4">
                  <HardHat className="w-6 h-6 text-brand-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Tecnico</p>
                  <p className="text-xs text-dark-400 mt-1">
                    {skipTecnico
                      ? "Pulado"
                      : tecnico.nome
                      ? tecnico.nome
                      : "Nenhum cadastrado"}
                  </p>
                </div>
                <div className="bg-dark-800/60 border border-dark-700 rounded-xl p-4">
                  <Users className="w-6 h-6 text-brand-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Cliente</p>
                  <p className="text-xs text-dark-400 mt-1">
                    {skipCliente
                      ? "Pulado"
                      : cliente.nome
                      ? cliente.nome
                      : "Nenhum cadastrado"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleGoToDashboard}
                className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base"
              >
                Ir para o Dashboard
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 3 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-700">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`btn-secondary inline-flex items-center gap-2 ${
                  currentStep === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="flex items-center gap-3">
                {currentStep === 1 && (
                  <button
                    onClick={() => {
                      setSkipTecnico(true);
                      handleNext();
                    }}
                    className="text-sm text-dark-400 hover:text-dark-300 inline-flex items-center gap-1 transition-colors"
                  >
                    <SkipForward className="w-4 h-4" />
                    Pular
                  </button>
                )}
                {currentStep === 2 && (
                  <button
                    onClick={() => {
                      setSkipCliente(true);
                      handleFinish();
                    }}
                    className="text-sm text-dark-400 hover:text-dark-300 inline-flex items-center gap-1 transition-colors"
                  >
                    <SkipForward className="w-4 h-4" />
                    Pular
                  </button>
                )}

                {currentStep < 2 && (
                  <button
                    onClick={handleNext}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Proximo
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {currentStep === 2 && (
                  <button
                    onClick={handleFinish}
                    disabled={saving}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        Finalizar
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confetti CSS */}
      <style jsx>{`
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: 50;
        }
        .confetti-piece {
          position: absolute;
          top: -10px;
          width: 10px;
          height: 10px;
          opacity: 0;
          animation: confetti-fall linear forwards;
        }
        .confetti-piece:nth-child(odd) {
          border-radius: 50%;
        }
        .confetti-piece:nth-child(3n) {
          width: 8px;
          height: 14px;
          border-radius: 2px;
        }
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(1);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg) scale(0.5);
          }
        }
      `}</style>
    </div>
  );
}
