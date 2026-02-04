import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Dicas, guias e novidades para prestadores de servicos recorrentes. Dedetizadoras, limpeza, manutencao e muito mais.",
  openGraph: {
    title: "Blog | ServiPro",
    description: "Dicas e guias para prestadores de servicos recorrentes.",
    type: "website",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
