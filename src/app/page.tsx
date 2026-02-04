"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar, ClipboardList, DollarSign, MessageCircle, Users, BarChart3,
  CheckCircle, ArrowRight, Star, Shield, Zap, Clock, ChevronDown, Menu,
  Phone, Mail, MapPin, TrendingUp, Award, Target, X, Check, Minus,
  ShieldCheck, RefreshCw, Lock, FileText, Download
} from "lucide-react";
import dynamic from "next/dynamic";
const WhatsAppButton = dynamic(() => import("./components/WhatsAppButton"), { ssr: false });
const ExitIntentPopup = dynamic(() => import("./components/ExitIntentPopup"), { ssr: false });
import UrgencyBanner from "./components/UrgencyBanner";
import { captureUTM, trackCTAClick } from "./components/ConversionTracker";

/* ============================================================
   LANDING PAGE - Otimizada para Google Ads (conversao)
   ============================================================ */

export default function LandingPage() {
  useEffect(() => { captureUTM(); }, []);
  return (
    <div className="min-h-screen">
      <UrgencyBanner />
      <Navbar />
      <Hero />
      <CustomerLogos />
      <Problems />
      <Features />
      <ComparisonTable />
      <HowItWorks />
      <Stats />
      <Pricing />
      <Guarantee />
      <Testimonials />
      <LeadMagnet />
      <FAQ />
      <FinalCTA />
      <Footer />
      <WhatsAppButton />
      <ExitIntentPopup />
    </div>
  );
}

/* ------ NAVBAR ------ */
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-[44px] w-full z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Servicfy</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-dark-400 hover:text-white transition-colors text-sm">Recursos</a>
            <a href="#comparacao" className="text-dark-400 hover:text-white transition-colors text-sm">Comparacao</a>
            <a href="#pricing" className="text-dark-400 hover:text-white transition-colors text-sm">Precos</a>
            <a href="#faq" className="text-dark-400 hover:text-white transition-colors text-sm">FAQ</a>
            <Link href="/blog" className="text-dark-400 hover:text-white transition-colors text-sm">Blog</Link>
            <Link href="/login" className="text-dark-300 hover:text-white transition-colors text-sm font-medium">Entrar</Link>
            <Link href="/registro" className="btn-primary text-sm !px-5 !py-2.5">
              Teste Gratis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/registro" className="btn-primary text-sm !px-4 !py-2">Teste Gratis</Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-dark-400 p-1.5">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-dark-700 py-4 space-y-3 animate-fade-in">
            <a href="#features" onClick={() => setMenuOpen(false)} className="block text-dark-300 hover:text-white text-sm py-1">Recursos</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)} className="block text-dark-300 hover:text-white text-sm py-1">Precos</a>
            <a href="#faq" onClick={() => setMenuOpen(false)} className="block text-dark-300 hover:text-white text-sm py-1">FAQ</a>
            <Link href="/blog" className="block text-dark-300 hover:text-white text-sm py-1">Blog</Link>
            <Link href="/login" className="block text-dark-300 hover:text-white text-sm py-1">Entrar</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ------ HERO ------ */
function Hero() {
  return (
    <section className="relative pt-40 pb-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -right-40 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute -bottom-20 -left-40 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8 animate-fade-in">
            <Zap className="w-4 h-4" /> Teste gratis por 14 dias — sem cartao de credito
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 animate-slide-up">
            Pare de perder clientes.{" "}
            <span className="gradient-text">Automatize sua gestao</span>{" "}
            de servicos recorrentes.
          </h1>

          <p className="text-lg sm:text-xl text-dark-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Agenda inteligente, ordens de servico digitais, controle financeiro e
            WhatsApp integrado. Tudo que sua dedetizadora ou empresa de servicos precisa em um so lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/registro" className="btn-primary text-base !px-8 !py-4">
              Comecar Gratis Agora <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#video-demo" className="btn-secondary text-base">
              Assistir Video
            </a>
          </div>

          <p className="text-dark-500 text-xs mt-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Sem cartao de credito · Configuracao em 2 minutos · Cancele quando quiser
          </p>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-14 text-dark-500 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-xs uppercase tracking-wider">Empresas Ativas</div>
            </div>
            <div className="w-px h-8 bg-dark-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50.000+</div>
              <div className="text-xs uppercase tracking-wider">OS Geradas</div>
            </div>
            <div className="w-px h-8 bg-dark-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">R$ 10M+</div>
              <div className="text-xs uppercase tracking-wider">Faturados</div>
            </div>
            <div className="w-px h-8 bg-dark-700" />
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              <span className="ml-1 text-sm text-white font-medium">4.9/5</span>
            </div>
          </div>
        </div>

        {/* Video Demo */}
        <div id="video-demo" className="mt-16 relative animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="max-w-3xl mx-auto">
            <div className="glass rounded-2xl p-2 sm:p-3">
              <video
                className="w-full rounded-xl bg-dark-900 border border-dark-700"
                controls
                autoPlay
                muted
                loop
                preload="auto"
                playsInline
              >
                <source src="/videos/demo.mp4" type="video/mp4" />
                Seu navegador nao suporta video.
              </video>
            </div>
            <p className="text-center text-dark-500 text-xs mt-3">Veja como o Servicfy transforma a gestao da sua empresa em 33 segundos</p>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="mt-16 relative animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="glass rounded-2xl p-2 sm:p-4 max-w-5xl mx-auto">
            <div className="bg-dark-900 rounded-xl overflow-hidden border border-dark-700">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-700">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-dark-500">app.servicfy.com.br/dashboard</span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Clientes Ativos", value: "247", color: "text-brand-400", icon: Users },
                    { label: "OS do Dia", value: "12", color: "text-blue-400", icon: ClipboardList },
                    { label: "Vencendo em 7d", value: "8", color: "text-amber-400", icon: Clock },
                    { label: "Receita Mensal", value: "R$ 45.800", color: "text-brand-300", icon: TrendingUp },
                  ].map((kpi, i) => (
                    <div key={i} className="bg-dark-800/60 rounded-xl p-4 border border-dark-700">
                      <kpi.icon className={`w-5 h-5 ${kpi.color} mb-2`} />
                      <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
                      <div className="text-xs text-dark-500 mt-0.5">{kpi.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-800/40 rounded-xl p-4 border border-dark-700 h-40 flex items-end gap-2">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="flex-1 bg-brand-500/30 rounded-t" style={{ height: `${h}%` }}>
                        <div className="bg-brand-500 rounded-t h-3/4 w-full" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-dark-800/40 rounded-xl p-4 border border-dark-700 space-y-3">
                    {["Joao M. - Dedetizacao", "Rest. Sabor - Desratizacao", "Cond. Jardins - Trimestral"].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-400" />
                        <span className="text-xs text-dark-300 truncate">{item}</span>
                        <span className="ml-auto text-xs text-brand-400">08:{i}0</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

/* ------ CUSTOMER LOGOS (Social Proof) ------ */
function CustomerLogos() {
  const logos = [
    { name: "Dedetiza SP", segment: "Dedetizacao" },
    { name: "LimpMax", segment: "Limpeza" },
    { name: "PragZero", segment: "Controle de Pragas" },
    { name: "AirTech", segment: "Ar Condicionado" },
    { name: "VerdePro", segment: "Jardinagem" },
    { name: "CleanHouse", segment: "Limpeza" },
    { name: "FrioCerto", segment: "Refrigeracao" },
    { name: "BugFree", segment: "Dedetizacao" },
  ];

  return (
    <section className="py-12 border-t border-dark-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-dark-500 text-sm mb-8 uppercase tracking-wider font-medium">
          Empresas que confiam no Servicfy
        </p>
        <div className="flex items-center justify-center flex-wrap gap-6 sm:gap-10">
          {logos.map((logo, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800/30 border border-dark-700/50 opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/20 to-brand-600/20 flex items-center justify-center">
                <span className="text-brand-400 font-bold text-xs">{logo.name[0]}{logo.name.split(/[^A-Z]/g).filter(Boolean)[1]?.[0] || logo.name[1]}</span>
              </div>
              <div>
                <div className="text-white text-xs font-semibold">{logo.name}</div>
                <div className="text-dark-500 text-[10px]">{logo.segment}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------ PROBLEMS ------ */
function Problems() {
  return (
    <section className="py-20 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-4">
          Cansado de perder contratos por{" "}
          <span className="text-red-400">desorganizacao</span>?
        </h2>
        <p className="text-dark-400 text-center max-w-2xl mx-auto mb-12">
          Se voce enfrenta esses problemas, o Servicfy foi feito para voce.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Clock, title: "Esquece de agendar servicos recorrentes", desc: "Clientes cancelam porque voce nao lembrou de retornar no prazo." },
            { icon: ClipboardList, title: "OS em papel ou planilha", desc: "Informacoes perdidas, sem historico, sem fotos, sem controle." },
            { icon: DollarSign, title: "Nao sabe quanto faturou no mes", desc: "Contas a receber esquecidas, comissoes erradas, prejuizo invisivel." },
            { icon: Users, title: "Nao consegue escalar a equipe", desc: "Tecnicos sem agenda, rotas desorganizadas, tempo desperdicado." },
            { icon: MessageCircle, title: "Cliente reclama de falta de aviso", desc: "Sem lembretes automaticos, o cliente e pego de surpresa." },
            { icon: Target, title: "Perde tempo com tarefas manuais", desc: "Gerar OS, cobrar, agendar... tudo manual e repetitivo." },
          ].map((item, i) => (
            <div key={i} className="card-hover group">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500/10 transition-colors">
                <item.icon className="w-6 h-6 text-red-400 group-hover:text-brand-400 transition-colors" />
              </div>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-dark-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------ FEATURES ------ */
function Features() {
  return (
    <section id="features" className="py-20 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-brand-400 text-sm font-semibold uppercase tracking-wider">Recursos</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3">
            Tudo que voce precisa para{" "}
            <span className="gradient-text">crescer</span>
          </h2>
          <p className="text-dark-400 mt-4 max-w-2xl mx-auto">
            Do agendamento a cobranca, automatize cada etapa do seu negocio.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Calendar, color: "from-brand-500 to-brand-600",
              title: "Agenda Recorrente Inteligente",
              desc: "Configure uma vez e nunca mais perca um servico. Recorrencia de 30, 60, 90, 180 ou 365 dias com alerta automatico.",
              features: ["Calendario visual", "Recorrencia automatica", "Alerta de vencimento", "Filtro por tecnico/regiao"]
            },
            {
              icon: ClipboardList, color: "from-blue-500 to-blue-600",
              title: "OS 100% Digital",
              desc: "Gere ordens de servico completas com checklist, fotos antes/depois e assinatura digital do cliente.",
              features: ["Checklist dinamico", "Fotos antes/depois", "Assinatura digital", "PDF automatico"]
            },
            {
              icon: DollarSign, color: "from-emerald-500 to-emerald-600",
              title: "Controle Financeiro Completo",
              desc: "Receitas, despesas, contas a receber e comissoes de tecnicos. Saiba exatamente quanto voce lucra.",
              features: ["Receitas por OS", "Comissoes automaticas", "Contas a receber", "Relatorio mensal"]
            },
            {
              icon: MessageCircle, color: "from-green-500 to-green-600",
              title: "WhatsApp Integrado",
              desc: "Envie lembretes, confirmacoes e pesquisas de satisfacao automaticamente pelo WhatsApp.",
              features: ["Lembretes automaticos", "Confirmacao de agenda", "Pos-servico", "Templates prontos"]
            },
            {
              icon: Users, color: "from-purple-500 to-purple-600",
              title: "Gestao de Equipe",
              desc: "Cadastre tecnicos, atribua regioes, controle comissoes e acompanhe a produtividade em tempo real.",
              features: ["Agenda do tecnico", "Comissao configuravel", "Ranking de performance", "GPS em campo"]
            },
            {
              icon: BarChart3, color: "from-amber-500 to-amber-600",
              title: "Relatorios e Dashboard",
              desc: "Indicadores em tempo real, taxa de retencao, receita recorrente e produtividade da equipe.",
              features: ["KPIs em tempo real", "Receita recorrente vs avulsa", "Taxa de retencao", "Exportar relatorios"]
            },
          ].map((feature, i) => (
            <div key={i} className="card-hover group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-dark-400 text-sm mb-4">{feature.desc}</p>
              <ul className="space-y-2">
                {feature.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-dark-300">
                    <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------ COMPARISON TABLE ------ */
function ComparisonTable() {
  const features = [
    { name: "Agenda recorrente automatica", servicfy: true, planilha: false, papel: false, concorrente: true },
    { name: "OS digital com checklist e foto", servicfy: true, planilha: false, papel: false, concorrente: true },
    { name: "WhatsApp integrado (lembretes)", servicfy: true, planilha: false, papel: false, concorrente: false },
    { name: "Cobranca PIX/Boleto integrada", servicfy: true, planilha: false, papel: false, concorrente: false },
    { name: "Portal do cliente (link publico)", servicfy: true, planilha: false, papel: false, concorrente: false },
    { name: "App para tecnico em campo", servicfy: true, planilha: false, papel: false, concorrente: true },
    { name: "Controle financeiro completo", servicfy: true, planilha: "partial", papel: false, concorrente: true },
    { name: "Comissoes automaticas", servicfy: true, planilha: false, papel: false, concorrente: false },
    { name: "Relatorios em PDF", servicfy: true, planilha: "partial", papel: false, concorrente: true },
    { name: "Preco acessivel para MEI", servicfy: true, planilha: true, papel: true, concorrente: false },
    { name: "Setup em menos de 5 minutos", servicfy: true, planilha: false, papel: true, concorrente: false },
    { name: "Sem risco de perder dados", servicfy: true, planilha: "partial", papel: false, concorrente: true },
  ];

  const renderIcon = (val: boolean | string) => {
    if (val === true) return <Check className="w-5 h-5 text-emerald-400" />;
    if (val === "partial") return <Minus className="w-5 h-5 text-amber-400" />;
    return <X className="w-5 h-5 text-red-400/50" />;
  };

  return (
    <section id="comparacao" className="py-20 border-t border-dark-800 bg-dark-900/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-brand-400 text-sm font-semibold uppercase tracking-wider">Comparacao</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3">
            Por que escolher o{" "}
            <span className="gradient-text">Servicfy</span>?
          </h2>
          <p className="text-dark-400 mt-4">
            Veja como nos comparamos com as alternativas que voce usa hoje.
          </p>
        </div>

        <div className="card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left p-4 text-dark-400 font-medium">Recurso</th>
                  <th className="text-center p-4 w-28">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mb-1">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-brand-400 font-bold text-xs">Servicfy</span>
                    </div>
                  </th>
                  <th className="text-center p-4 w-28">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center mb-1 text-dark-400 text-xs font-bold">XLS</div>
                      <span className="text-dark-400 font-medium text-xs">Planilha</span>
                    </div>
                  </th>
                  <th className="text-center p-4 w-28 hidden sm:table-cell">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center mb-1 text-dark-400 text-xs font-bold">
                        <ClipboardList className="w-4 h-4" />
                      </div>
                      <span className="text-dark-400 font-medium text-xs">Papel</span>
                    </div>
                  </th>
                  <th className="text-center p-4 w-28 hidden md:table-cell">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center mb-1 text-dark-400 text-xs font-bold">$$</div>
                      <span className="text-dark-400 font-medium text-xs">Outros SaaS</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr key={i} className="border-b border-dark-800 hover:bg-dark-800/30 transition-colors">
                    <td className="p-4 text-dark-300">{f.name}</td>
                    <td className="p-4 text-center"><div className="flex justify-center">{renderIcon(f.servicfy)}</div></td>
                    <td className="p-4 text-center"><div className="flex justify-center">{renderIcon(f.planilha)}</div></td>
                    <td className="p-4 text-center hidden sm:table-cell"><div className="flex justify-center">{renderIcon(f.papel)}</div></td>
                    <td className="p-4 text-center hidden md:table-cell"><div className="flex justify-center">{renderIcon(f.concorrente)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Preco row */}
          <div className="border-t border-dark-700 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5">
            <div className="p-4 text-dark-400 font-medium text-sm flex items-center">Preco mensal</div>
            <div className="p-4 text-center"><span className="text-brand-400 font-bold">R$ 97</span></div>
            <div className="p-4 text-center"><span className="text-dark-400">R$ 0</span><span className="text-dark-600 text-xs block">(+ seu tempo)</span></div>
            <div className="p-4 text-center hidden sm:block"><span className="text-dark-400">R$ 0</span><span className="text-dark-600 text-xs block">(+ risco de perda)</span></div>
            <div className="p-4 text-center hidden md:block"><span className="text-dark-400">R$ 200-500</span></div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/registro" className="btn-primary">
            Testar Servicfy Gratis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------ HOW IT WORKS ------ */
function HowItWorks() {
  return (
    <section className="py-20 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-brand-400 text-sm font-semibold uppercase tracking-wider">Como Funciona</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3">Comece em 3 passos simples</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-8 relative">
          <div className="hidden sm:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-brand-500/0 via-brand-500/50 to-brand-500/0" />
          {[
            { step: "1", title: "Crie sua conta", desc: "Cadastre-se em 30 segundos. Sem cartao de credito, sem compromisso." },
            { step: "2", title: "Configure seus servicos", desc: "Cadastre clientes, servicos e tecnicos. Importe de planilhas se quiser." },
            { step: "3", title: "Comece a faturar", desc: "Agende, gere OS, envie lembretes e cobre — tudo automatizado." },
          ].map((s, i) => (
            <div key={i} className="text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6 shadow-lg shadow-brand-500/20">
                {s.step}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-dark-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------ STATS ------ */
function Stats() {
  return (
    <section className="py-16 border-t border-dark-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "98%", label: "Taxa de Retencao" },
            { value: "3h", label: "Economizadas por dia" },
            { value: "40%", label: "Aumento no Faturamento" },
            { value: "< 2min", label: "Para gerar uma OS" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl sm:text-4xl font-extrabold gradient-text">{stat.value}</div>
              <div className="text-sm text-dark-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------ PRICING ------ */
function Pricing() {
  return (
    <section id="pricing" className="py-20 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-brand-400 text-sm font-semibold uppercase tracking-wider">Precos</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3">
            Planos que cabem no seu{" "}
            <span className="gradient-text">bolso</span>
          </h2>
          <p className="text-dark-400 mt-4">Comece gratis. Escale quando quiser.</p>
        </div>

        <PricingToggle />

        <p className="text-center text-dark-500 text-sm mt-8">
          Todos os planos incluem 14 dias gratis. Cancele quando quiser.
        </p>
      </div>
    </section>
  );
}

function PricingToggle() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: "Starter", priceMonthly: 97, priceAnnual: 81, popular: false,
      features: ["1 usuario", "50 clientes", "100 OS/mes", "Agenda recorrente", "OS digital com checklist", "Relatorios basicos", "Suporte por email"],
      cta: "Comecar Gratis"
    },
    {
      name: "Profissional", priceMonthly: 197, priceAnnual: 164, popular: true,
      features: ["5 usuarios", "200 clientes", "OS ilimitadas", "Tudo do Starter +", "WhatsApp integrado", "Financeiro completo", "Comissoes automaticas", "Relatorios avancados", "Suporte prioritario"],
      cta: "Comecar Gratis"
    },
    {
      name: "Enterprise", priceMonthly: 397, priceAnnual: 331, popular: false,
      features: ["Usuarios ilimitados", "Clientes ilimitados", "OS ilimitadas", "Tudo do Profissional +", "Multi-filial", "API de integracao", "White-label", "Gerente de sucesso dedicado"],
      cta: "Falar com Vendas"
    },
  ];

  return (
    <>
      {/* Toggle Mensal/Anual */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`text-sm font-medium ${!annual ? "text-white" : "text-dark-500"}`}>Mensal</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-14 h-7 rounded-full transition-colors ${annual ? "bg-brand-500" : "bg-dark-700"}`}
        >
          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${annual ? "left-8" : "left-1"}`} />
        </button>
        <span className={`text-sm font-medium ${annual ? "text-white" : "text-dark-500"}`}>
          Anual
        </span>
        {annual && (
          <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-1 rounded-full border border-brand-500/20">
            2 meses gratis
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, i) => {
          const price = annual ? plan.priceAnnual : plan.priceMonthly;
          return (
            <div key={i} className={`relative rounded-2xl p-8 ${plan.popular ? "bg-gradient-to-b from-brand-500/10 to-dark-800 border-2 border-brand-500/30 scale-105" : "card"}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-500 text-white text-xs font-bold uppercase tracking-wider">
                  Mais Popular
                </div>
              )}
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-sm text-dark-400">R$</span>
                <span className="text-5xl font-extrabold text-white">{price}</span>
                <span className="text-dark-400">/mes</span>
              </div>
              {annual && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-dark-500 line-through">R$ {plan.priceMonthly}/mes</span>
                  <span className="text-xs text-brand-400 font-medium">Economia de R$ {(plan.priceMonthly - plan.priceAnnual) * 12}/ano</span>
                </div>
              )}
              <ul className="mt-8 space-y-3">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-dark-300">
                    <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/registro"
                className={`mt-8 w-full text-center block ${plan.popular ? "btn-primary" : "btn-secondary"}`}
              >
                {plan.cta}
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ------ GUARANTEE ------ */
function Guarantee() {
  return (
    <section className="py-16 border-t border-dark-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-2xl p-8 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Garantia de 30 dias</h3>
          <p className="text-dark-400 text-sm max-w-lg mx-auto mb-6">
            Se em ate 30 dias voce nao ficar satisfeito com o Servicfy, devolvemos 100% do valor pago.
            Sem perguntas, sem burocracia. Seu unico risco e nao experimentar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Reembolso total</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <Lock className="w-4 h-4" />
              <span>Dados protegidos (LGPD)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <RefreshCw className="w-4 h-4" />
              <span>Cancele a qualquer momento</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------ TESTIMONIALS ------ */
function Testimonials() {
  const testimonials = [
    {
      name: "Carlos Alberto M.",
      role: "Dono - Dedetiza SP",
      city: "Sao Paulo, SP",
      text: "Antes eu perdia 3 a 4 contratos por mes por esquecimento. Hoje a recorrencia e automatica e meu faturamento subiu 40%. Melhor investimento que fiz.",
      rating: 5,
      metric: "+40% faturamento",
      avatar: "CA",
      gradient: "from-brand-500 to-emerald-500",
    },
    {
      name: "Fernanda Lima",
      role: "Gerente - LimpMax Servicos",
      city: "Rio de Janeiro, RJ",
      text: "O controle financeiro mudou meu negocio. Agora sei exatamente quanto cada tecnico gera e quanto lucro por servico. Reduzi custos em 25%.",
      rating: 5,
      metric: "-25% custos",
      avatar: "FL",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "Roberto Santos",
      role: "Socio - PragZero",
      city: "Belo Horizonte, MG",
      text: "O WhatsApp integrado reduziu nosso no-show em 80%. Os clientes adoram receber lembrete e confirmam na hora. Sistema essencial.",
      rating: 5,
      metric: "-80% no-show",
      avatar: "RS",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      name: "Ana Paula Vieira",
      role: "Dona - AirTech Refrigeracao",
      city: "Curitiba, PR",
      text: "Com 3 tecnicos na rua, eu vivia perdida. Agora cada um tem a agenda no celular, o cliente recebe aviso e a OS sai pronta. Profissionalizou demais.",
      rating: 5,
      metric: "+60% produtividade",
      avatar: "AV",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      name: "Marcos Oliveira",
      role: "Proprietario - VerdePro Jardins",
      city: "Campinas, SP",
      text: "Mandava proposta por WhatsApp e rezava. Agora tenho portal do cliente, cobranca por PIX automatica e controle de tudo. Dobrei meus clientes em 6 meses.",
      rating: 5,
      metric: "2x clientes",
      avatar: "MO",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      name: "Lucia Ferreira",
      role: "Gerente - CleanHouse",
      city: "Brasilia, DF",
      text: "Testei 3 sistemas antes do Servicfy. Os outros eram caros e complicados. Esse e simples, barato e faz tudo que preciso. Minha equipe adotou em 1 dia.",
      rating: 5,
      metric: "Setup em 1 dia",
      avatar: "LF",
      gradient: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <section className="py-20 border-t border-dark-800 bg-dark-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-brand-400 text-sm font-semibold uppercase tracking-wider">Depoimentos</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3">
            Empresas que ja{" "}
            <span className="gradient-text">transformaram</span>{" "}
            sua gestao
          </h2>
          <p className="text-dark-400 mt-4">Mais de 500 empresas confiam no Servicfy</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="card hover:border-dark-600 transition-all">
              {/* Stars + Metric */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= t.rating ? "fill-amber-400 text-amber-400" : "text-dark-600"}`} />
                  ))}
                </div>
                <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
                  {t.metric}
                </span>
              </div>

              {/* Text */}
              <p className="text-dark-300 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-dark-700">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-sm`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{t.name}</div>
                  <div className="text-dark-500 text-xs">{t.role}</div>
                  <div className="text-dark-600 text-[10px]">{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------ FAQ ------ */
function FAQ() {
  return (
    <section id="faq" className="py-20 border-t border-dark-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-brand-400 text-sm font-semibold uppercase tracking-wider">FAQ</span>
          <h2 className="text-3xl font-bold mt-3">Perguntas Frequentes</h2>
        </div>
        <div className="space-y-4">
          {[
            { q: "Preciso instalar algum programa?", a: "Nao! O Servicfy funciona 100% no navegador e no celular. Basta acessar e usar. Tambem funciona offline como app (PWA)." },
            { q: "Funciona para qual segmento?", a: "Dedetizadoras, empresas de limpeza, manutencao de ar-condicionado, jardinagem, eletricistas, encanadores, e qualquer servico recorrente ou sob demanda." },
            { q: "Posso cancelar a qualquer momento?", a: "Sim, sem fidelidade. Cancele quando quiser, sem multa ou burocracia. Alem disso, oferecemos garantia de 30 dias com reembolso total." },
            { q: "Meus dados estao seguros?", a: "Sim! Usamos criptografia de ponta a ponta e servidores no Brasil com backup diario. Estamos em conformidade com a LGPD (Lei Geral de Protecao de Dados)." },
            { q: "Como funciona o teste gratis?", a: "Sao 14 dias com acesso completo a todas as funcionalidades, incluindo WhatsApp, financeiro, relatorios e app do tecnico. Sem cartao de credito." },
            { q: "Voces oferecem treinamento?", a: "Sim! Oferecemos onboarding guiado passo a passo dentro do sistema, videos tutoriais e suporte por WhatsApp em horario comercial." },
            { q: "O que acontece apos os 14 dias?", a: "Voce escolhe um plano para continuar. Se nao quiser, sua conta e pausada (nao perdemos seus dados por 90 dias). Sem cobranca automatica." },
            { q: "Posso trocar de plano depois?", a: "Sim! Voce pode fazer upgrade ou downgrade a qualquer momento. O valor e ajustado proporcionalmente." },
            { q: "E se eu nao ficar satisfeito?", a: "Oferecemos garantia de 30 dias. Se nao gostar, devolvemos 100% do valor pago sem perguntas." },
            { q: "Tem integracao com MercadoPago?", a: "Sim! Geramos cobranças PIX e boleto automaticamente via MercadoPago. Seu cliente recebe o link de pagamento por WhatsApp." },
          ].map((item, i) => (
            <details key={i} className="card group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium text-white">{item.q}</span>
                <ChevronDown className="w-5 h-5 text-dark-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-dark-400 text-sm mt-4 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------ FINAL CTA ------ */
/* ------ LEAD MAGNET ------ */
function LeadMagnet() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    trackCTAClick("lead_magnet_download");
    // Simula envio - em producao, conectar a um servico de email marketing
    await new Promise((r) => setTimeout(r, 1000));
    setEnviado(true);
    setLoading(false);
  }

  return (
    <section className="py-20 border-t border-dark-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-2xl p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-4">
              <FileText className="w-3.5 h-3.5" /> Material Gratuito
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Guia: Como Escalar sua Empresa de Servicos
            </h2>
            <p className="text-dark-400 text-sm mb-2">
              Baixe gratis o guia com as 7 estrategias que empresas de dedetizacao, limpeza e manutencao usam para faturar mais de R$ 50 mil/mes.
            </p>
            <ul className="text-dark-400 text-xs space-y-1">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-brand-400" /> Como precificar seus servicos corretamente</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-brand-400" /> Automatizacao que reduz custos em 40%</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-brand-400" /> Estrategias para fidelizar clientes recorrentes</li>
            </ul>
          </div>
          <div className="w-full lg:w-80 flex-shrink-0">
            {enviado ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-brand-400 mx-auto mb-3" />
                <p className="text-white font-semibold">Guia enviado!</p>
                <p className="text-dark-400 text-sm mt-1">Verifique seu email.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="Seu melhor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field w-full text-sm"
                />
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3 text-sm">
                  {loading ? "Enviando..." : (<>Baixar Guia Gratis <Download className="w-4 h-4" /></>)}
                </button>
                <p className="text-dark-600 text-[10px] text-center">Sem spam. Seus dados estao protegidos.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 border-t border-dark-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-500/5 rounded-3xl blur-3xl" />
          <div className="relative glass rounded-3xl p-12 sm:p-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Pronto para escalar seu negocio?
            </h2>
            <p className="text-dark-400 text-lg max-w-xl mx-auto mb-8">
              Junte-se a mais de 500 empresas que ja automatizaram sua gestao com o Servicfy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/registro" className="btn-primary text-base !px-8 !py-4">
                Criar Conta Gratis <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <p className="text-dark-500 text-sm mt-6 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" /> 14 dias gratis · Sem cartao · Garantia de 30 dias
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------ FOOTER ------ */
function Footer() {
  return (
    <footer className="border-t border-dark-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Servicfy</span>
            </div>
            <p className="text-dark-500 text-sm mb-4">
              Sistema de gestao para prestadores de servico recorrente.
            </p>
            {/* Trust badges */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                <Lock className="w-3 h-3" /> SSL Seguro
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium">
                <ShieldCheck className="w-3 h-3" /> LGPD
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Produto</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li><a href="#features" className="hover:text-white transition-colors">Recursos</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Precos</a></li>
              <li><a href="#comparacao" className="hover:text-white transition-colors">Comparacao</a></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Entrar</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li><Link href="/politica-privacidade" className="hover:text-white transition-colors">Politica de Privacidade</Link></li>
              <li><Link href="/politica-privacidade" className="hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Contato</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> contato@servicfy.com.br</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> (11) 99999-0000</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-dark-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-dark-500 text-sm">
            &copy; {new Date().getFullYear()} Servicfy. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4 text-dark-600 text-xs">
            <span>Servidores no Brasil</span>
            <span>·</span>
            <span>Backup diario</span>
            <span>·</span>
            <span>Criptografia de ponta a ponta</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
