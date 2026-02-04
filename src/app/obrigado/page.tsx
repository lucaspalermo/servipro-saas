"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Mail,
  LogIn,
  Settings,
  ArrowRight,
  PartyPopper,
  Clock,
} from "lucide-react";
import { trackConversion } from "../components/ConversionTracker";

export default function ObrigadoPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  // Fire conversion events on mount
  useEffect(() => {
    trackConversion("Lead");
    trackConversion("CompleteRegistration");
  }, []);

  // Countdown and auto-redirect
  useEffect(() => {
    if (countdown <= 0) {
      router.push("/login?registrado=1");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  const steps = [
    {
      icon: Mail,
      number: "1",
      title: "Acesse seu email",
      description: "Enviamos um email de confirmacao para voce.",
    },
    {
      icon: LogIn,
      number: "2",
      title: "Faca login",
      description: "Use seu email e senha para acessar o painel.",
    },
    {
      icon: Settings,
      number: "3",
      title: "Configure seus servicos",
      description: "Cadastre clientes, servicos e comece a faturar.",
    },
  ];

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
            <span className="text-2xl font-bold text-white">ServiPro</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-brand-500/10 border-2 border-brand-500/30 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-brand-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
                <PartyPopper className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Success message */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Conta criada com sucesso!
            </h1>
            <p className="text-dark-400 text-sm">
              Bem-vindo ao ServiPro! Sua conta foi criada e esta pronta para uso.
            </p>
          </div>

          {/* Next steps */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4 text-center">
              Proximos passos
            </h2>
            <div className="space-y-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="flex items-start gap-4 p-4 rounded-xl bg-dark-800/60 border border-dark-700 hover:border-dark-600 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      {step.title}
                    </h3>
                    <p className="text-dark-400 text-xs mt-0.5">
                      {step.description}
                    </p>
                  </div>
                  <step.icon className="w-5 h-5 text-dark-500 flex-shrink-0 ml-auto mt-0.5" />
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/login?registrado=1"
            className="btn-primary w-full justify-center !py-3.5 text-base"
          >
            Acessar meu painel
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Countdown */}
          <div className="mt-6 flex items-center justify-center gap-2 text-dark-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>
              Redirecionando em{" "}
              <span className="text-brand-400 font-semibold">{countdown}</span>{" "}
              segundo{countdown !== 1 ? "s" : ""}...
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-dark-600 text-xs">
            &copy; {new Date().getFullYear()} ServiPro. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
