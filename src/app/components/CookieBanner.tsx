"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Delay to avoid layout shift
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setIsVisible(false);
    // Enable analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
      });
    }
  };

  const acceptEssential = () => {
    localStorage.setItem("cookie-consent", "essential");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-dark-800/95 backdrop-blur-xl border border-dark-700 rounded-2xl p-4 sm:p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-5 h-5 text-brand-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold text-sm sm:text-base mb-1">
                    Utilizamos cookies
                  </h3>
                  <p className="text-dark-400 text-xs sm:text-sm leading-relaxed">
                    Usamos cookies para melhorar sua experiencia, analisar o trafego e personalizar
                    conteudo. Ao clicar em &quot;Aceitar todos&quot;, voce concorda com o uso de cookies
                    conforme nossa{" "}
                    <Link href="/politica-privacidade" className="text-brand-400 hover:text-brand-300 underline">
                      Politica de Privacidade
                    </Link>
                    .
                  </p>
                </div>
                <button
                  onClick={acceptEssential}
                  className="text-dark-500 hover:text-white transition-colors p-1 -mt-1 -mr-1 sm:hidden"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={acceptAll}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/30"
                >
                  Aceitar todos
                </button>
                <button
                  onClick={acceptEssential}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm text-dark-300 bg-dark-700 hover:bg-dark-600 transition-all duration-300"
                >
                  Apenas essenciais
                </button>
                <Link
                  href="/politica-privacidade"
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm text-dark-400 hover:text-white transition-colors text-center"
                >
                  Saber mais
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add gtag type to window
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, string>) => void;
  }
}
