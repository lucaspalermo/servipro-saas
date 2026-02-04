import Link from "next/link";
import { ArrowRight, Calendar, Clock, CheckCircle } from "lucide-react";

const posts = [
  {
    slug: "como-montar-uma-dedetizadora",
    title: "Como Montar uma Dedetizadora: Guia Completo 2025",
    excerpt:
      "Tudo que voce precisa saber para abrir sua empresa de dedetizacao: documentos, equipamentos, investimento inicial e como conseguir os primeiros clientes.",
    date: "2025-01-15",
    readTime: "12 min",
    category: "Guia",
  },
  {
    slug: "quanto-cobra-um-dedetizador",
    title: "Quanto Cobra um Dedetizador? Tabela de Precos Atualizada",
    excerpt:
      "Descubra os precos praticados no mercado de dedetizacao por tipo de servico, tamanho do imovel e regiao. Inclui dicas para precificar seus servicos.",
    date: "2025-01-20",
    readTime: "8 min",
    category: "Precos",
  },
  {
    slug: "sistema-gestao-servicos-recorrentes",
    title: "Por que sua Empresa de Servicos Precisa de um Sistema de Gestao",
    excerpt:
      "Planilhas nao escalam. Entenda como um sistema de gestao profissional pode triplicar sua capacidade de atendimento e reduzir cancelamentos.",
    date: "2025-02-01",
    readTime: "6 min",
    category: "Gestao",
  },
  {
    slug: "como-organizar-agenda-dedetizadora",
    title: "Como Organizar a Agenda da sua Dedetizadora e Nao Perder Clientes",
    excerpt:
      "Aprenda a organizar servicos recorrentes, evitar conflitos de agenda e garantir que nenhum cliente fique sem atendimento.",
    date: "2025-02-10",
    readTime: "7 min",
    category: "Produtividade",
  },
  {
    slug: "ordem-de-servico-digital",
    title: "Ordem de Servico Digital: Vantagens e Como Implementar",
    excerpt:
      "Chega de OS em papel. Veja como a ordem de servico digital profissionaliza seu negocio, melhora o controle e impressiona seus clientes.",
    date: "2025-02-15",
    readTime: "5 min",
    category: "Tecnologia",
  },
];

const categoryColors: Record<string, string> = {
  Guia: "bg-blue-500/10 text-blue-400",
  Precos: "bg-amber-500/10 text-amber-400",
  Gestao: "bg-purple-500/10 text-purple-400",
  Produtividade: "bg-emerald-500/10 text-emerald-400",
  Tecnologia: "bg-brand-500/10 text-brand-400",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ServiPro</span>
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

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-brand-400 text-sm font-semibold uppercase tracking-wider">Blog</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-3">
            Dicas para <span className="gradient-text">crescer</span> seu negocio
          </h1>
          <p className="text-dark-400 mt-4 text-lg max-w-2xl mx-auto">
            Guias praticos, dicas de gestao e tendencias do mercado de servicos recorrentes.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block card-hover group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`badge text-xs ${categoryColors[post.category] || "bg-dark-700 text-dark-300"}`}>
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
                    <h2 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-dark-400 text-sm mt-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm text-brand-400 mt-4 font-medium group-hover:gap-2 transition-all">
                      Ler artigo <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-dark-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Pronto para profissionalizar sua gestao?
          </h2>
          <p className="text-dark-400 mb-8">Teste o ServiPro gratis por 14 dias.</p>
          <Link href="/registro" className="btn-primary text-base !px-8 !py-4">
            Comecar Gratis <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-dark-500 text-sm">
          &copy; {new Date().getFullYear()} ServiPro. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
