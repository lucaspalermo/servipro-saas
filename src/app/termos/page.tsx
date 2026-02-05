"use client";

import Link from "next/link";
import { CheckCircle, ArrowLeft, FileText, Shield, CreditCard, AlertTriangle, Scale, RefreshCw } from "lucide-react";

export default function TermosPage() {
  const lastUpdated = "01 de fevereiro de 2026";

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Servicfy</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao inicio
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="relative pt-16 pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6">
            <FileText className="w-4 h-4" /> Documento Legal
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Termos de Uso
          </h1>
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            Leia atentamente os termos e condicoes que regem o uso da plataforma Servicfy.
            Ao utilizar nossos servicos, voce concorda com estes termos.
          </p>
          <p className="text-dark-500 text-sm mt-6">
            Ultima atualizacao: {lastUpdated}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-8">

          {/* 1. Aceitacao */}
          <Section icon={FileText} number="1" title="Aceitacao dos Termos">
            <p className="text-dark-300 leading-relaxed mb-4">
              Ao acessar ou usar a plataforma Servicfy, voce concorda em ficar vinculado a estes
              Termos de Uso e a nossa Politica de Privacidade. Se voce nao concordar com qualquer
              parte destes termos, nao devera usar nossos servicos.
            </p>
            <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20">
              <p className="text-dark-300 text-sm leading-relaxed">
                <strong className="text-white">Importante:</strong> Estes termos constituem um
                acordo legal entre voce (usuario) e Servicfy Tecnologia Ltda. (empresa). Ao
                clicar em &quot;Criar Conta&quot; ou usar a plataforma, voce confirma que leu,
                entendeu e aceita estes termos.
              </p>
            </div>
          </Section>

          {/* 2. Servicos */}
          <Section icon={CheckCircle} number="2" title="Descricao dos Servicos">
            <p className="text-dark-300 leading-relaxed mb-4">
              O Servicfy e uma plataforma de software como servico (SaaS) que oferece:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Gestao de agendamentos e servicos recorrentes",
                "Emissao de ordens de servico digitais",
                "Controle financeiro (receitas e despesas)",
                "Gestao de clientes e contratos",
                "Comunicacao via WhatsApp integrado",
                "Relatorios e dashboards em tempo real",
                "Gestao de equipes e tecnicos em campo",
                "Portal do cliente para acompanhamento",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-dark-900/50">
                  <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                  <span className="text-dark-400 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* 3. Cadastro */}
          <Section icon={Shield} number="3" title="Cadastro e Conta">
            <p className="text-dark-300 leading-relaxed mb-4">
              Para usar o Servicfy, voce deve criar uma conta fornecendo informacoes precisas e completas:
            </p>
            <ul className="space-y-3 mb-4">
              {[
                "Voce deve ter pelo menos 18 anos ou capacidade legal para contratar",
                "As informacoes fornecidas devem ser verdadeiras e atualizadas",
                "Voce e responsavel por manter a seguranca da sua senha",
                "Voce e responsavel por todas as atividades realizadas em sua conta",
                "Deve notificar imediatamente qualquer uso nao autorizado da sua conta",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-dark-400 text-sm">
                  <span className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0 text-brand-400 text-xs font-bold">
                    {i + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-dark-400 text-sm leading-relaxed">
              Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos
              ou que apresentem atividades suspeitas.
            </p>
          </Section>

          {/* 4. Pagamento */}
          <Section icon={CreditCard} number="4" title="Planos e Pagamento">
            <p className="text-dark-300 leading-relaxed mb-4">
              O Servicfy oferece diferentes planos de assinatura com precos e recursos variados:
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-dark-900/50 border border-dark-700">
                <h4 className="text-white font-semibold text-sm mb-2">Periodo de Teste</h4>
                <p className="text-dark-400 text-sm leading-relaxed">
                  Novos usuarios tem direito a 14 dias de teste gratuito com acesso a todas as
                  funcionalidades. Nao e necessario cartao de credito para iniciar o teste.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-dark-900/50 border border-dark-700">
                <h4 className="text-white font-semibold text-sm mb-2">Cobranca</h4>
                <p className="text-dark-400 text-sm leading-relaxed">
                  Apos o periodo de teste, a cobranca e realizada de acordo com o plano escolhido
                  (mensal ou anual). O pagamento e processado automaticamente na data de renovacao.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-dark-900/50 border border-dark-700">
                <h4 className="text-white font-semibold text-sm mb-2">Garantia de 30 dias</h4>
                <p className="text-dark-400 text-sm leading-relaxed">
                  Oferecemos garantia de reembolso de 30 dias apos a primeira cobranca. Se nao
                  estiver satisfeito, basta solicitar o cancelamento e devolveremos 100% do valor.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-dark-900/50 border border-dark-700">
                <h4 className="text-white font-semibold text-sm mb-2">Alteracao de Precos</h4>
                <p className="text-dark-400 text-sm leading-relaxed">
                  Reservamo-nos o direito de alterar os precos dos planos. Alteracoes serao
                  comunicadas com 30 dias de antecedencia e nao afetarao o periodo ja pago.
                </p>
              </div>
            </div>
          </Section>

          {/* 5. Uso Aceitavel */}
          <Section icon={AlertTriangle} number="5" title="Uso Aceitavel">
            <p className="text-dark-300 leading-relaxed mb-4">
              Ao usar o Servicfy, voce concorda em NAO:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Violar leis ou regulamentos aplicaveis",
                "Usar a plataforma para fins ilegais ou fraudulentos",
                "Transmitir virus, malware ou codigo malicioso",
                "Tentar acessar contas de outros usuarios",
                "Sobrecarregar ou prejudicar nossos servidores",
                "Fazer engenharia reversa do software",
                "Revender ou sublicenciar o acesso sem autorizacao",
                "Usar bots ou scripts automatizados nao autorizados",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-dark-400 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* 6. Propriedade Intelectual */}
          <Section icon={Scale} number="6" title="Propriedade Intelectual">
            <p className="text-dark-300 leading-relaxed mb-4">
              Todo o conteudo e tecnologia do Servicfy sao protegidos por direitos autorais:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                "O software, codigo-fonte, design e marca Servicfy sao propriedade exclusiva da Servicfy Tecnologia Ltda.",
                "Voce recebe uma licenca limitada, nao exclusiva e revogavel para usar a plataforma",
                "Os dados inseridos por voce na plataforma permanecem de sua propriedade",
                "Voce nos concede licenca para processar seus dados conforme necessario para prestar o servico",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-dark-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* 7. Cancelamento */}
          <Section icon={RefreshCw} number="7" title="Cancelamento e Rescisao">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-dark-900/50 border border-dark-700">
                <h4 className="text-white font-semibold text-sm mb-2">Cancelamento pelo Usuario</h4>
                <p className="text-dark-400 text-sm leading-relaxed">
                  Voce pode cancelar sua assinatura a qualquer momento atraves do painel de
                  configuracoes. O acesso permanece ativo ate o fim do periodo pago. Nao ha
                  multas ou taxas de cancelamento.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-dark-900/50 border border-dark-700">
                <h4 className="text-white font-semibold text-sm mb-2">Suspensao pela Servicfy</h4>
                <p className="text-dark-400 text-sm leading-relaxed">
                  Podemos suspender ou encerrar sua conta em caso de: violacao destes termos,
                  inadimplencia superior a 30 dias, uso fraudulento ou atividades ilegais.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-dark-900/50 border border-dark-700">
                <h4 className="text-white font-semibold text-sm mb-2">Exportacao de Dados</h4>
                <p className="text-dark-400 text-sm leading-relaxed">
                  Antes do encerramento da conta, voce pode solicitar a exportacao dos seus
                  dados em formato padrao. Apos 90 dias do cancelamento, os dados serao
                  permanentemente excluidos.
                </p>
              </div>
            </div>
          </Section>

          {/* 8. Limitacao de Responsabilidade */}
          <section className="bg-dark-900/60 rounded-2xl border border-dark-700 p-6 sm:p-8">
            <h3 className="text-white font-bold text-lg mb-4">
              8. Limitacao de Responsabilidade
            </h3>
            <p className="text-dark-400 text-sm leading-relaxed mb-4">
              Na maxima extensao permitida por lei:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                "O Servicfy e fornecido \"como esta\", sem garantias de qualquer tipo",
                "Nao garantimos que o servico sera ininterrupto ou livre de erros",
                "Nao somos responsaveis por perdas indiretas, incidentais ou consequenciais",
                "Nossa responsabilidade total e limitada ao valor pago nos ultimos 12 meses",
                "Voce e responsavel por manter backups dos seus dados criticos",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-dark-400 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-dark-500 flex-shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 9. Alteracoes */}
          <section className="bg-dark-900/60 rounded-2xl border border-dark-700 p-6 sm:p-8">
            <h3 className="text-white font-bold text-lg mb-3">
              9. Alteracoes nos Termos
            </h3>
            <p className="text-dark-400 text-sm leading-relaxed mb-3">
              Podemos atualizar estes Termos de Uso periodicamente. Alteracoes significativas
              serao notificadas por e-mail ou aviso na plataforma com 30 dias de antecedencia.
            </p>
            <p className="text-dark-400 text-sm leading-relaxed">
              O uso continuado apos a publicacao das alteracoes constitui aceite dos novos termos.
              Se voce nao concordar com as alteracoes, devera encerrar sua conta antes da data
              de vigencia dos novos termos.
            </p>
          </section>

          {/* 10. Foro */}
          <section className="bg-dark-900/60 rounded-2xl border border-dark-700 p-6 sm:p-8">
            <h3 className="text-white font-bold text-lg mb-3">
              10. Lei Aplicavel e Foro
            </h3>
            <p className="text-dark-400 text-sm leading-relaxed mb-4">
              Estes Termos de Uso sao regidos pelas leis da Republica Federativa do Brasil.
            </p>
            <p className="text-dark-400 text-sm leading-relaxed">
              Fica eleito o foro da comarca de Sao Paulo/SP para dirimir quaisquer controversias
              decorrentes destes termos, com renuncia expressa a qualquer outro, por mais
              privilegiado que seja.
            </p>
          </section>

          {/* Contato */}
          <section className="bg-brand-500/5 rounded-2xl border border-brand-500/20 p-6 sm:p-8">
            <h3 className="text-white font-bold text-lg mb-3">
              Duvidas sobre os Termos?
            </h3>
            <p className="text-dark-400 text-sm leading-relaxed mb-4">
              Se voce tiver qualquer duvida sobre estes Termos de Uso, entre em contato:
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="mailto:contato@servicfy.com.br"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 text-brand-400 text-sm font-medium hover:bg-dark-700 transition-colors"
              >
                contato@servicfy.com.br
              </a>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 text-brand-400 text-sm font-medium hover:bg-dark-700 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-white">Servicfy</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-dark-500">
              <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
              <Link href="/politica-privacidade" className="hover:text-white transition-colors">Privacidade</Link>
              <Link href="/registro" className="hover:text-white transition-colors">Criar Conta</Link>
            </div>
            <p className="text-dark-600 text-xs">
              &copy; {new Date().getFullYear()} Servicfy. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({
  icon: Icon,
  number,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-dark-900/60 rounded-2xl border border-dark-700 p-6 sm:p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-brand-400" />
        </div>
        <div>
          <span className="text-brand-400 text-xs font-semibold uppercase tracking-wider">
            Secao {number}
          </span>
          <h3 className="text-white font-bold text-lg mt-0.5">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}
