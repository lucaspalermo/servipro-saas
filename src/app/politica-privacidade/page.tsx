"use client";

import Link from "next/link";
import { CheckCircle, ArrowLeft, Shield, Database, Eye, Cookie, UserCheck, Lock, Server, Mail } from "lucide-react";

/* ============================================================
   POLITICA DE PRIVACIDADE - LGPD Compliant
   Servicfy - Sistema de Gestao para Prestadores de Servico
   ============================================================ */

export default function PoliticaPrivacidadePage() {
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
            <Shield className="w-4 h-4" /> LGPD Compliant
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Politica de Privacidade
          </h1>
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            Sua privacidade e importante para nos. Esta politica descreve como o Servicfy
            coleta, usa e protege seus dados pessoais em conformidade com a Lei Geral de
            Protecao de Dados (LGPD - Lei n. 13.709/2018).
          </p>
          <p className="text-dark-500 text-sm mt-6">
            Ultima atualizacao: {lastUpdated}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-8">

          {/* 1. Coleta de Dados */}
          <Section
            icon={Database}
            number="1"
            title="Coleta de Dados Pessoais"
          >
            <p className="text-dark-300 leading-relaxed mb-4">
              O Servicfy coleta dados pessoais de forma transparente e com base legal adequada,
              conforme previsto na LGPD. Os dados sao coletados nas seguintes situacoes:
            </p>
            <h4 className="text-white font-semibold text-sm mb-3 mt-6">1.1 Dados fornecidos pelo usuario</h4>
            <ul className="space-y-2 mb-4">
              {[
                "Nome completo e CPF/CNPJ para identificacao e emissao de documentos fiscais",
                "Endereco de e-mail para comunicacao, login e recuperacao de conta",
                "Numero de telefone/WhatsApp para notificacoes e suporte",
                "Endereco comercial para localizacao de servicos e rotas",
                "Dados de pagamento (processados por gateway seguro de terceiros)",
                "Informacoes sobre a empresa: razao social, nome fantasia e segmento de atuacao",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-dark-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <h4 className="text-white font-semibold text-sm mb-3 mt-6">1.2 Dados coletados automaticamente</h4>
            <ul className="space-y-2">
              {[
                "Endereco IP e dados de geolocalizacao aproximada",
                "Tipo de navegador, sistema operacional e dispositivo utilizado",
                "Paginas visitadas, tempo de permanencia e interacoes com a plataforma",
                "Dados de uso do sistema (funcionalidades acessadas, frequencia de uso)",
                "Logs de acesso conforme exigido pelo Marco Civil da Internet (Lei n. 12.965/2014)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-dark-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* 2. Uso dos Dados */}
          <Section
            icon={Eye}
            number="2"
            title="Uso dos Dados Pessoais"
          >
            <p className="text-dark-300 leading-relaxed mb-4">
              Os dados pessoais coletados sao utilizados para as seguintes finalidades,
              sempre com base legal adequada (Art. 7 da LGPD):
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  base: "Execucao de contrato (Art. 7, V)",
                  items: [
                    "Prestacao dos servicos contratados na plataforma Servicfy",
                    "Gerenciamento de conta, assinaturas e cobrancas",
                    "Emissao de notas fiscais e documentos relacionados",
                    "Comunicacao sobre atualizacoes, manutencoes e incidentes",
                  ],
                },
                {
                  base: "Legitimo interesse (Art. 7, IX)",
                  items: [
                    "Melhoria continua da plataforma e experiencia do usuario",
                    "Analise de uso agregada para desenvolvimento de novos recursos",
                    "Prevencao de fraudes e protecao da seguranca da plataforma",
                    "Envio de comunicacoes sobre novidades e funcionalidades relevantes",
                  ],
                },
                {
                  base: "Consentimento (Art. 7, I)",
                  items: [
                    "Envio de materiais de marketing e promocoes",
                    "Compartilhamento de dados com parceiros comerciais",
                    "Pesquisas de satisfacao e feedback sobre o produto",
                  ],
                },
                {
                  base: "Obrigacao legal (Art. 7, II)",
                  items: [
                    "Armazenamento de logs de acesso por 6 meses (Marco Civil da Internet)",
                    "Cumprimento de obrigacoes fiscais e tributarias",
                    "Atendimento a ordens judiciais e requisicoes de autoridades competentes",
                  ],
                },
              ].map((group, i) => (
                <div key={i} className="bg-dark-900/50 rounded-xl border border-dark-700 p-5">
                  <h4 className="text-brand-400 font-semibold text-sm mb-3">{group.base}</h4>
                  <ul className="space-y-2">
                    {group.items.map((item, j) => (
                      <li key={j} className="text-dark-400 text-sm flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          {/* 3. Compartilhamento de Dados */}
          <Section
            icon={UserCheck}
            number="3"
            title="Compartilhamento de Dados"
          >
            <p className="text-dark-300 leading-relaxed mb-4">
              O Servicfy nao vende, aluga ou comercializa dados pessoais de seus usuarios.
              O compartilhamento ocorre apenas nas seguintes situacoes:
            </p>
            <div className="space-y-4">
              {[
                {
                  title: "Prestadores de servicos essenciais",
                  desc: "Compartilhamos dados com empresas que nos auxiliam na operacao da plataforma, como provedores de hospedagem, gateways de pagamento, servicos de e-mail e ferramentas de analise. Todos os prestadores sao contratualmente obrigados a proteger seus dados.",
                },
                {
                  title: "Obrigacoes legais",
                  desc: "Podemos compartilhar dados pessoais quando exigido por lei, regulamentacao, processo judicial ou solicitacao governamental valida.",
                },
                {
                  title: "Protecao de direitos",
                  desc: "Podemos divulgar dados quando necessario para proteger nossos direitos, propriedade ou seguranca, bem como de nossos usuarios ou do publico.",
                },
                {
                  title: "Com consentimento do titular",
                  desc: "Em qualquer outra situacao, o compartilhamento so ocorrera mediante seu consentimento expresso e informado.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-dark-900/50 border border-dark-700">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-brand-400 font-bold text-sm">{String.fromCharCode(97 + i)}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
                    <p className="text-dark-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 4. Cookies */}
          <Section
            icon={Cookie}
            number="4"
            title="Cookies e Tecnologias de Rastreamento"
          >
            <p className="text-dark-300 leading-relaxed mb-4">
              O Servicfy utiliza cookies e tecnologias similares para melhorar sua experiencia
              na plataforma. Abaixo detalhamos os tipos de cookies utilizados:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left py-3 px-4 text-dark-300 font-semibold">Tipo</th>
                    <th className="text-left py-3 px-4 text-dark-300 font-semibold">Finalidade</th>
                    <th className="text-left py-3 px-4 text-dark-300 font-semibold">Duracao</th>
                  </tr>
                </thead>
                <tbody className="text-dark-400">
                  {[
                    { type: "Essenciais", purpose: "Autenticacao, seguranca e funcionamento basico da plataforma", duration: "Sessao" },
                    { type: "Funcionais", purpose: "Preferencias do usuario, idioma e configuracoes salvas", duration: "1 ano" },
                    { type: "Analiticos", purpose: "Dados de uso agregados para melhoria da plataforma (Google Analytics)", duration: "2 anos" },
                    { type: "Marketing", purpose: "Personalizacao de anuncios e remarketing (apenas com consentimento)", duration: "90 dias" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-dark-800">
                      <td className="py-3 px-4 text-white font-medium">{row.type}</td>
                      <td className="py-3 px-4">{row.purpose}</td>
                      <td className="py-3 px-4">{row.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-dark-400 text-sm mt-4 leading-relaxed">
              Voce pode gerenciar suas preferencias de cookies a qualquer momento atraves das
              configuracoes do seu navegador. Note que desabilitar cookies essenciais pode
              comprometer o funcionamento da plataforma.
            </p>
          </Section>

          {/* 5. Direitos do Usuario */}
          <Section
            icon={UserCheck}
            number="5"
            title="Seus Direitos como Titular de Dados"
          >
            <p className="text-dark-300 leading-relaxed mb-4">
              Em conformidade com os artigos 17 a 22 da LGPD, voce possui os seguintes
              direitos em relacao aos seus dados pessoais:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  right: "Confirmacao e Acesso",
                  desc: "Voce pode solicitar a confirmacao da existencia de tratamento e o acesso aos seus dados pessoais armazenados pelo Servicfy.",
                },
                {
                  right: "Correcao",
                  desc: "Voce pode solicitar a correcao de dados incompletos, inexatos ou desatualizados a qualquer momento.",
                },
                {
                  right: "Anonimizacao ou Eliminacao",
                  desc: "Voce pode solicitar a anonimizacao, bloqueio ou eliminacao de dados desnecessarios ou tratados em desconformidade com a LGPD.",
                },
                {
                  right: "Portabilidade",
                  desc: "Voce pode solicitar a portabilidade dos seus dados a outro fornecedor de servico, mediante requisicao expressa.",
                },
                {
                  right: "Eliminacao com Consentimento",
                  desc: "Voce pode solicitar a eliminacao dos dados tratados com base no seu consentimento, exceto nas hipoteses de conservacao previstas em lei.",
                },
                {
                  right: "Revogacao do Consentimento",
                  desc: "Voce pode revogar o consentimento a qualquer momento, de forma gratuita e facilitada, sem comprometer o tratamento realizado anteriormente.",
                },
                {
                  right: "Informacao sobre Compartilhamento",
                  desc: "Voce pode solicitar informacoes sobre entidades publicas e privadas com as quais compartilhamos seus dados.",
                },
                {
                  right: "Oposicao",
                  desc: "Voce pode se opor ao tratamento de dados realizado com base em hipoteses de dispensa de consentimento, caso haja descumprimento da LGPD.",
                },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-dark-900/50 border border-dark-700">
                  <h4 className="text-brand-400 font-semibold text-sm mb-2">{item.right}</h4>
                  <p className="text-dark-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-5 rounded-xl bg-brand-500/5 border border-brand-500/20">
              <p className="text-dark-300 text-sm leading-relaxed">
                <strong className="text-white">Como exercer seus direitos:</strong> Envie sua
                solicitacao para{" "}
                <a href="mailto:privacidade@servicfy.com.br" className="text-brand-400 hover:text-brand-300 underline">
                  privacidade@servicfy.com.br
                </a>{" "}
                com o assunto &quot;Exercicio de Direitos LGPD&quot;. Responderemos sua
                solicitacao em ate 15 (quinze) dias uteis, conforme previsto na legislacao.
              </p>
            </div>
          </Section>

          {/* 6. Seguranca */}
          <Section
            icon={Lock}
            number="6"
            title="Seguranca dos Dados"
          >
            <p className="text-dark-300 leading-relaxed mb-4">
              O Servicfy adota medidas tecnicas e organizacionais para proteger seus
              dados pessoais contra acesso nao autorizado, destruicao, perda, alteracao
              ou qualquer forma de tratamento inadequado:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Criptografia",
                  desc: "Todos os dados sao transmitidos usando criptografia TLS 1.3 (HTTPS) e armazenados com criptografia AES-256 em repouso.",
                },
                {
                  title: "Controle de Acesso",
                  desc: "Acesso aos dados pessoais e restrito a colaboradores autorizados, com autenticacao multifator e principio do menor privilegio.",
                },
                {
                  title: "Monitoramento",
                  desc: "Sistemas de deteccao de intrusao, monitoramento de logs e alertas de seguranca em tempo real.",
                },
                {
                  title: "Backups",
                  desc: "Backups automaticos diarios com retencao segura, permitindo a recuperacao de dados em caso de incidentes.",
                },
                {
                  title: "Auditorias",
                  desc: "Realizamos auditorias periodicas de seguranca e testes de penetracao para identificar e corrigir vulnerabilidades.",
                },
                {
                  title: "Resposta a Incidentes",
                  desc: "Possuimos um plano de resposta a incidentes de seguranca, incluindo notificacao a ANPD e aos titulares quando aplicavel.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-dark-900/50 border border-dark-700">
                  <Shield className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
                    <p className="text-dark-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 7. Armazenamento */}
          <Section
            icon={Server}
            number="7"
            title="Armazenamento e Retencao de Dados"
          >
            <p className="text-dark-300 leading-relaxed mb-4">
              Seus dados pessoais sao armazenados em servidores localizados no Brasil,
              em conformidade com a legislacao brasileira.
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-dark-900/50 border border-dark-700">
                <h4 className="text-white font-semibold text-sm mb-2">Localizacao dos servidores</h4>
                <p className="text-dark-400 text-sm leading-relaxed">
                  Nossos servidores estao localizados em data centers no Brasil (Sao Paulo),
                  garantindo que seus dados permanecam em territorio nacional e estejam sujeitos
                  a jurisdicao brasileira.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-dark-900/50 border border-dark-700">
                <h4 className="text-white font-semibold text-sm mb-2">Periodo de retencao</h4>
                <p className="text-dark-400 text-sm leading-relaxed mb-3">
                  Os dados pessoais sao retidos pelos seguintes periodos:
                </p>
                <ul className="space-y-2">
                  {[
                    "Dados da conta: enquanto a conta estiver ativa e por ate 6 meses apos o encerramento",
                    "Logs de acesso: 6 meses, conforme Marco Civil da Internet",
                    "Dados fiscais: 5 anos, conforme legislacao tributaria",
                    "Dados de marketing (com consentimento): ate a revogacao do consentimento",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-dark-400 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-dark-900/50 border border-dark-700">
                <h4 className="text-white font-semibold text-sm mb-2">Transferencia internacional</h4>
                <p className="text-dark-400 text-sm leading-relaxed">
                  Caso seja necessaria a transferencia internacional de dados (por exemplo,
                  para ferramentas de analise), essa transferencia sera realizada em conformidade
                  com o Capitulo V da LGPD, garantindo nivel adequado de protecao de dados.
                </p>
              </div>
            </div>
          </Section>

          {/* 8. Contato DPO */}
          <Section
            icon={Mail}
            number="8"
            title="Encarregado de Protecao de Dados (DPO)"
          >
            <p className="text-dark-300 leading-relaxed mb-6">
              Em conformidade com o Art. 41 da LGPD, o Servicfy nomeou um Encarregado
              de Protecao de Dados (Data Protection Officer - DPO) para atender as
              solicitacoes dos titulares de dados e intermediar a comunicacao com a
              Autoridade Nacional de Protecao de Dados (ANPD).
            </p>
            <div className="p-6 rounded-2xl bg-dark-900/50 border border-dark-700">
              <h4 className="text-white font-semibold mb-4">Canal de contato do DPO</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand-500" />
                  <div>
                    <span className="text-dark-500 text-sm">E-mail:</span>
                    <a
                      href="mailto:privacidade@servicfy.com.br"
                      className="text-brand-400 hover:text-brand-300 text-sm ml-2 underline"
                    >
                      privacidade@servicfy.com.br
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-brand-500" />
                  <div>
                    <span className="text-dark-500 text-sm">Empresa:</span>
                    <span className="text-dark-300 text-sm ml-2">Servicfy Tecnologia Ltda.</span>
                  </div>
                </div>
              </div>
              <p className="text-dark-400 text-sm mt-4 leading-relaxed">
                O DPO respondera suas solicitacoes em ate 15 (quinze) dias uteis.
                Para exercer seus direitos previstos na LGPD, utilize o e-mail acima
                com o assunto &quot;Exercicio de Direitos LGPD&quot; e inclua seus dados
                de identificacao para que possamos atender sua solicitacao de forma segura.
              </p>
            </div>
          </Section>

          {/* 9. Alteracoes */}
          <section className="bg-dark-900/60 rounded-2xl border border-dark-700 p-6 sm:p-8">
            <h3 className="text-white font-bold text-lg mb-3">
              9. Alteracoes nesta Politica
            </h3>
            <p className="text-dark-400 text-sm leading-relaxed mb-3">
              O Servicfy reserva-se o direito de modificar esta Politica de Privacidade
              a qualquer momento. As alteracoes serao publicadas nesta pagina com a data
              de atualizacao revisada.
            </p>
            <p className="text-dark-400 text-sm leading-relaxed">
              Caso as alteracoes sejam significativas, notificaremos voce por e-mail
              ou atraves de um aviso em destaque na plataforma antes de as mudancas
              entrarem em vigor. O uso continuado da plataforma apos a publicacao das
              alteracoes constitui aceite da politica revisada.
            </p>
          </section>

          {/* 10. Legislacao Aplicavel */}
          <section className="bg-dark-900/60 rounded-2xl border border-dark-700 p-6 sm:p-8">
            <h3 className="text-white font-bold text-lg mb-3">
              10. Legislacao Aplicavel e Foro
            </h3>
            <p className="text-dark-400 text-sm leading-relaxed mb-3">
              Esta Politica de Privacidade e regida pelas leis da Republica Federativa
              do Brasil, em especial:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                "Lei Geral de Protecao de Dados Pessoais (Lei n. 13.709/2018 - LGPD)",
                "Marco Civil da Internet (Lei n. 12.965/2014)",
                "Codigo de Defesa do Consumidor (Lei n. 8.078/1990)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-dark-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-dark-400 text-sm leading-relaxed">
              Fica eleito o foro da comarca de Sao Paulo/SP para dirimir quaisquer
              controversias decorrentes desta politica, com renuncia expressa a qualquer
              outro, por mais privilegiado que seja.
            </p>
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
              <Link href="/registro" className="hover:text-white transition-colors">Criar Conta</Link>
              <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
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

/* ------ REUSABLE SECTION COMPONENT ------ */
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
