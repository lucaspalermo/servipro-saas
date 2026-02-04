import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
}

const posts: Record<string, BlogPost> = {
  "como-montar-uma-dedetizadora": {
    slug: "como-montar-uma-dedetizadora",
    title: "Como Montar uma Dedetizadora: Guia Completo 2025",
    description:
      "Tudo que voce precisa saber para abrir sua empresa de dedetizacao: documentos, equipamentos, investimento inicial e como conseguir os primeiros clientes.",
    date: "2025-01-15",
    readTime: "12 min",
    category: "Guia",
    content: `
## O mercado de dedetizacao no Brasil

O mercado de controle de pragas movimenta mais de **R$ 12 bilhoes por ano** no Brasil e cresce a uma taxa de 7% ao ano. Com o aumento da urbanizacao e mudancas climaticas, a demanda por servicos de dedetizacao so tende a crescer.

## Documentos necessarios

Para abrir uma dedetizadora, voce precisa:

- **CNPJ** - Registro na Receita Federal (pode ser MEI inicialmente)
- **Alvara de funcionamento** - Obtido na prefeitura da sua cidade
- **Licenca da Vigilancia Sanitaria** - Obrigatorio para manipulacao de produtos quimicos
- **Registro no CRQ** - Conselho Regional de Quimica (responsavel tecnico)
- **Licenca Ambiental** - Exigida em alguns estados

## Investimento inicial

O investimento para montar uma dedetizadora varia de **R$ 5.000 a R$ 30.000**, dependendo da escala:

| Item | Custo Estimado |
|------|---------------|
| Equipamentos (pulverizadores, atomizadores) | R$ 3.000 - R$ 10.000 |
| Produtos quimicos iniciais | R$ 1.000 - R$ 3.000 |
| EPI (Equipamentos de Protecao Individual) | R$ 500 - R$ 1.500 |
| Marketing inicial (cartoes, site, anuncios) | R$ 500 - R$ 5.000 |
| Veiculo (usado) | R$ 0 - R$ 15.000 |
| Software de gestao | R$ 97 - R$ 397/mes |

## Como conseguir os primeiros clientes

1. **Google Meu Negocio** - Cadastre sua empresa gratuitamente
2. **Indicacoes** - Ofereca desconto para quem indicar novos clientes
3. **Parcerias com imobiliarias** - Oferte servicos para imoveis comerciais
4. **Google Ads** - Anuncios para "dedetizadora + sua cidade"
5. **WhatsApp Business** - Canal direto com potenciais clientes

## Dica profissional: use um sistema de gestao

O maior erro de dedetizadoras iniciantes e gerenciar tudo em planilhas. Um sistema como o **Servicfy** automatiza agendamentos recorrentes, gera OS digitais e envia lembretes por WhatsApp — o que reduz cancelamentos e aumenta a profissionalidade do seu negocio.
    `,
  },
  "quanto-cobra-um-dedetizador": {
    slug: "quanto-cobra-um-dedetizador",
    title: "Quanto Cobra um Dedetizador? Tabela de Precos Atualizada",
    description:
      "Descubra os precos praticados no mercado de dedetizacao por tipo de servico, tamanho do imovel e regiao.",
    date: "2025-01-20",
    readTime: "8 min",
    category: "Precos",
    content: `
## Tabela de precos de dedetizacao 2025

Os precos variam de acordo com o tipo de servico, area do imovel e regiao do pais. Abaixo, uma tabela com valores medios praticados:

| Servico | Ate 100m2 | 100-300m2 | Acima de 300m2 |
|---------|-----------|-----------|----------------|
| Dedetizacao geral | R$ 150 - R$ 250 | R$ 250 - R$ 400 | R$ 400 - R$ 800 |
| Desratizacao | R$ 200 - R$ 350 | R$ 350 - R$ 500 | R$ 500 - R$ 1.000 |
| Descupinizacao | R$ 400 - R$ 800 | R$ 800 - R$ 1.500 | R$ 1.500 - R$ 3.000 |
| Controle de mosquitos | R$ 150 - R$ 250 | R$ 250 - R$ 400 | R$ 400 - R$ 700 |
| Controle de escorpioes | R$ 200 - R$ 350 | R$ 350 - R$ 550 | Sob consulta |
| Desalojamento de pombos | R$ 300 - R$ 600 | R$ 600 - R$ 1.200 | Sob consulta |

## Fatores que influenciam o preco

- **Area do imovel** - Quanto maior, maior o custo de produto e tempo
- **Tipo de praga** - Cupins e escorpioes exigem tecnicas mais caras
- **Frequencia** - Contratos recorrentes costumam ter desconto de 15-30%
- **Regiao** - Capitais costumam ser 20-40% mais caras
- **Urgencia** - Atendimento emergencial pode custar 50% a mais

## Como precificar seus servicos

1. Calcule o custo dos produtos por m2
2. Adicione o custo de mao de obra (tempo + deslocamento)
3. Some custos fixos proporcionais (aluguel, veiculo, seguro)
4. Aplique sua margem de lucro (30-50% e o padrao do mercado)
5. Compare com a concorrencia local

## Controle financeiro e fundamental

Com um sistema como o **Servicfy**, voce sabe exatamente quanto gasta por servico e qual sua margem real de lucro. O modulo financeiro calcula automaticamente receitas, despesas e comissoes de tecnicos.
    `,
  },
  "sistema-gestao-servicos-recorrentes": {
    slug: "sistema-gestao-servicos-recorrentes",
    title: "Por que sua Empresa de Servicos Precisa de um Sistema de Gestao",
    description:
      "Planilhas nao escalam. Entenda como um sistema de gestao profissional pode triplicar sua capacidade de atendimento.",
    date: "2025-02-01",
    readTime: "6 min",
    category: "Gestao",
    content: `
## O problema das planilhas

A maioria dos prestadores de servico comeca com planilhas no Excel ou Google Sheets. Funciona para 10-20 clientes, mas rapidamente se torna caos:

- **Esquecimento de agendamentos** - Servicos recorrentes esquecidos = clientes perdidos
- **Sem historico organizado** - Qual tecnico foi? Que produto usou? Quando?
- **Financeiro no escuro** - Quanto voce realmente lucra por servico?
- **Comunicacao manual** - Ligar para cada cliente para confirmar e ineficiente

## Os numeros nao mentem

Empresas que migram de planilhas para um sistema de gestao reportam:

- **40% mais faturamento** em 6 meses
- **80% menos cancelamentos** por esquecimento
- **3 horas economizadas por dia** em tarefas administrativas
- **98% de taxa de retencao** de clientes

## O que um bom sistema precisa ter

1. **Agenda recorrente automatica** - Configure uma vez, nunca mais esqueca
2. **Ordem de servico digital** - Com checklist, fotos e assinatura
3. **Controle financeiro** - Receitas, despesas e comissoes
4. **WhatsApp integrado** - Lembretes automaticos para clientes
5. **Dashboard com metricas** - KPIs em tempo real
6. **Gestao de equipe** - Atribua tecnicos, controle produtividade

## Quando migrar?

Se voce tem mais de 20 clientes ou uma equipe de 2+ pessoas, ja esta na hora. O custo de um sistema (a partir de R$ 97/mes) se paga rapidamente ao evitar a perda de um unico cliente.
    `,
  },
  "como-organizar-agenda-dedetizadora": {
    slug: "como-organizar-agenda-dedetizadora",
    title: "Como Organizar a Agenda da sua Dedetizadora e Nao Perder Clientes",
    description:
      "Aprenda a organizar servicos recorrentes, evitar conflitos de agenda e garantir que nenhum cliente fique sem atendimento.",
    date: "2025-02-10",
    readTime: "7 min",
    category: "Produtividade",
    content: `
## O desafio da agenda recorrente

Uma dedetizadora tipica atende clientes com diferentes periodicidades: mensal, bimestral, trimestral, semestral. Manter isso em dia manualmente e quase impossivel.

## 5 dicas para organizar sua agenda

### 1. Agrupe servicos por regiao

Organize os atendimentos do dia por proximidade geografica. Isso economiza combustivel e tempo de deslocamento.

### 2. Defina janelas de horario

Nao agende horarios exatos. Use janelas: "manha (8h-12h)" ou "tarde (13h-17h)". Isso da flexibilidade para imprevistos.

### 3. Deixe folga entre servicos

Reserve pelo menos 30 minutos entre atendimentos. Atrasos acontecem e voce nao quer estourar a agenda do dia.

### 4. Automatize lembretes

Envie lembretes por WhatsApp 1 dia antes do servico. Isso reduz no-shows em ate 80%.

### 5. Use um sistema com recorrencia automatica

O maior erro e depender da memoria humana. Um sistema como o **Servicfy** agenda automaticamente o proximo servico baseado na recorrencia do contrato.

## Metricas para acompanhar

- **Taxa de ocupacao** - Quantos servicos voce realiza vs. capacidade total
- **No-show rate** - Percentual de clientes que nao estavam disponiveis
- **Servicos por tecnico/dia** - Media de atendimentos por profissional
- **Tempo medio de servico** - Quanto tempo leva cada tipo de servico

## Conclusao

Uma agenda bem organizada e a base de uma dedetizadora lucrativa. Investir em organizacao retorna em mais clientes atendidos, menos cancelamentos e uma equipe mais produtiva.
    `,
  },
  "ordem-de-servico-digital": {
    slug: "ordem-de-servico-digital",
    title: "Ordem de Servico Digital: Vantagens e Como Implementar",
    description:
      "Chega de OS em papel. Veja como a ordem de servico digital profissionaliza seu negocio.",
    date: "2025-02-15",
    readTime: "5 min",
    category: "Tecnologia",
    content: `
## Por que abandonar a OS em papel?

A ordem de servico em papel tem diversos problemas:

- **Se perde facilmente** - Chuva, vento, extravio
- **Letra ilegivel** - O tecnico escreveu mas ninguem entende
- **Sem historico** - Impossivel consultar servicos antigos
- **Nao profissional** - Passa imagem amadora para o cliente
- **Sem fotos** - Nao registra o antes/depois

## Vantagens da OS digital

### Profissionalismo
Uma OS digital com logo da empresa, dados formatados e PDF automatico impressiona o cliente. Isso gera confianca e facilita a fidelizacao.

### Controle total
Saiba exatamente:
- Que tecnico realizou o servico
- Quanto tempo levou
- Que produtos foram utilizados
- Observacoes do tecnico
- Fotos do antes/depois

### Historico completo
Com um clique, consulte todo o historico de servicos de um cliente. Isso e valioso para diagnosticar problemas recorrentes.

### Assinatura digital
O cliente assina no celular do tecnico. Prova de que o servico foi realizado, sem papel.

### Geracao automatica de PDF
Gere o PDF da OS com um clique e envie por WhatsApp ou email. O **Servicfy** gera PDFs profissionais com logo da empresa, dados do servico e assinatura.

## Como implementar

1. Escolha um sistema que gere OS digitais (como o Servicfy)
2. Cadastre seus servicos com checklist padrao
3. Treine seus tecnicos no uso do sistema (celular)
4. Envie a OS em PDF para o cliente apos o servico
5. Use o historico para melhorar a qualidade do atendimento
    `,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return { title: "Artigo nao encontrado" };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Artigo nao encontrado</h1>
          <Link href="/blog" className="text-brand-400 hover:text-brand-300">
            Voltar ao blog
          </Link>
        </div>
      </div>
    );
  }

  // Simple markdown-to-html (basic)
  const htmlContent = post.content
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-white mt-10 mb-4">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-white mt-8 mb-3">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(
      /\| (.*) \|/g,
      (match) => {
        const cells = match
          .split("|")
          .filter((c) => c.trim())
          .map((c) => c.trim());
        return `<tr>${cells.map((c) => `<td class="px-4 py-2 border border-dark-700 text-dark-300 text-sm">${c}</td>`).join("")}</tr>`;
      }
    )
    .replace(/^- (.*$)/gm, '<li class="text-dark-300 text-sm leading-relaxed ml-4">$1</li>')
    .replace(
      /(<li.*<\/li>\n?)+/g,
      (match) => `<ul class="space-y-2 my-4 list-disc list-inside">${match}</ul>`
    )
    .replace(
      /(<tr>.*<\/tr>\n?)+/g,
      (match) =>
        `<div class="overflow-x-auto my-6"><table class="w-full border-collapse border border-dark-700 rounded-lg overflow-hidden">${match}</table></div>`
    )
    .replace(/^(?!<[hultd])(.*\S.*)$/gm, '<p class="text-dark-400 text-sm leading-relaxed my-3">$1</p>')
    .replace(/^\d+\. (.*$)/gm, '<li class="text-dark-300 text-sm leading-relaxed ml-4">$1</li>');

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "Servicfy" },
    publisher: { "@type": "Organization", name: "Servicfy" },
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Servicfy</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-dark-400 hover:text-white transition-colors text-sm">Home</Link>
              <Link href="/blog" className="text-brand-400 text-sm font-medium">Blog</Link>
              <Link href="/registro" className="btn-primary text-sm !px-5 !py-2.5">
                Teste Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-dark-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Blog
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="badge text-xs bg-brand-500/10 text-brand-400">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-dark-500">
              <Calendar className="w-3 h-3" />
              {new Date(post.date).toLocaleDateString("pt-BR")}
            </span>
            <span className="flex items-center gap-1 text-xs text-dark-500">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-8">
            {post.title}
          </h1>

          <div
            className="prose-dark"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* CTA */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-brand-500/10 to-blue-500/10 border border-brand-500/20 text-center">
            <h3 className="text-xl font-bold text-white mb-3">
              Automatize a gestao do seu negocio
            </h3>
            <p className="text-dark-400 text-sm mb-6">
              Teste o Servicfy gratis por 14 dias. Sem cartao de credito.
            </p>
            <Link href="/registro" className="btn-primary !px-8 !py-3">
              Comecar Gratis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-dark-500 text-sm">
          &copy; {new Date().getFullYear()} Servicfy. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
