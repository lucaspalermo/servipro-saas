"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

export default function UrgencyBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Calcula meia-noite do dia seguinte como prazo
    const getDeadline = () => {
      let saved = localStorage.getItem("urgency_deadline");
      if (saved) {
        const d = new Date(saved);
        if (d > new Date()) return d;
      }
      // Cria um deadline de 24h a partir do primeiro acesso
      const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
      localStorage.setItem("urgency_deadline", deadline.toISOString());
      return deadline;
    };

    const deadline = getDeadline();

    const tick = () => {
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="bg-gradient-to-r from-brand-600/90 via-brand-500/90 to-emerald-500/90 border-b border-brand-400/20">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 text-white text-sm font-medium">
          <Zap className="w-4 h-4" />
          <span>Oferta por tempo limitado: <strong>20% OFF</strong> no primeiro mes</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1.5">
          {[
            { value: pad(timeLeft.hours), label: "h" },
            { value: pad(timeLeft.minutes), label: "m" },
            { value: pad(timeLeft.seconds), label: "s" },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-0.5">
              <span className="bg-black/30 text-white font-mono font-bold text-sm px-1.5 py-0.5 rounded">
                {t.value}
              </span>
              <span className="text-white/60 text-xs">{t.label}</span>
            </div>
          ))}
        </div>

        <Link
          href="/registro"
          className="inline-flex items-center gap-1 bg-white text-brand-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-white/90 transition-colors"
        >
          Garantir desconto <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
