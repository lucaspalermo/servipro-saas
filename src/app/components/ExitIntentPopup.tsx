"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Gift, ArrowRight, Clock } from "lucide-react";

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Nao mostrar se ja foi dispensado nesta sessao
    if (sessionStorage.getItem("exit_popup_dismissed")) {
      setDismissed(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !dismissed) {
        setShow(true);
      }
    };

    // Tambem mostrar apos 45 segundos se o usuario nao interagiu
    const timer = setTimeout(() => {
      if (!dismissed && !sessionStorage.getItem("exit_popup_dismissed")) {
        setShow(true);
      }
    }, 45000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, [dismissed]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem("exit_popup_dismissed", "true");
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleDismiss} />

      {/* Popup */}
      <div className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
        {/* Gradiente topo */}
        <div className="h-1.5 bg-gradient-to-r from-brand-500 via-emerald-500 to-brand-500" />

        {/* Fechar */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-dark-500 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          {/* Icone */}
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-5">
            <Gift className="w-8 h-8 text-brand-400" />
          </div>

          {/* Titulo */}
          <h2 className="text-2xl font-bold text-white mb-2">
            Espera! Temos uma oferta
          </h2>
          <p className="text-dark-400 text-sm mb-6">
            Cadastre-se agora e ganhe <span className="text-brand-400 font-bold">20% de desconto</span> no primeiro mes de qualquer plano.
          </p>

          {/* Codigo */}
          <div className="bg-dark-800 border border-dashed border-brand-500/40 rounded-xl px-6 py-3 mb-6">
            <p className="text-dark-500 text-xs mb-1">Codigo do cupom</p>
            <p className="text-brand-400 text-2xl font-bold font-mono tracking-widest">BEMVINDO20</p>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-amber-400 text-xs mb-6">
            <Clock className="w-3.5 h-3.5" />
            <span>Oferta valida apenas para novos cadastros</span>
          </div>

          {/* CTA */}
          <Link
            href="/registro"
            onClick={handleDismiss}
            className="btn-primary w-full justify-center !py-3.5 text-base mb-3"
          >
            Quero meu desconto <ArrowRight className="w-5 h-5" />
          </Link>

          <button
            onClick={handleDismiss}
            className="text-dark-500 text-xs hover:text-dark-300 transition-colors"
          >
            Nao, obrigado
          </button>
        </div>
      </div>
    </div>
  );
}
