import type { Metadata } from "next";
import "./globals.css";
import Analytics from "./components/Analytics";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://servicfy.com.br";

export const metadata: Metadata = {
  title: {
    default: "Servicfy | Sistema de Gestão para Serviços Recorrentes",
    template: "%s | Servicfy",
  },
  description:
    "Software completo para gestão de dedetizadoras, empresas de limpeza e serviços recorrentes. Agenda automática, OS digital, financeiro e WhatsApp integrado. Teste grátis por 14 dias.",
  keywords:
    "sistema dedetizadora, software gestão serviços, controle pragas, agenda recorrente, ordem serviço digital, gestão dedetização, software dedetizadora, sistema ordem de serviço, gestão empresa limpeza, controle serviços recorrentes",
  authors: [{ name: "Servicfy" }],
  creator: "Servicfy",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Servicfy - Gestão Inteligente de Serviços Recorrentes",
    description: "Automatize agendamentos, controle financeiro e equipe em campo. Tudo em um só lugar.",
    type: "website",
    locale: "pt_BR",
    url: baseUrl,
    siteName: "Servicfy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Servicfy - Gestão Inteligente de Serviços Recorrentes",
    description: "Automatize agendamentos, controle financeiro e equipe em campo.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Servicfy",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Software completo para gestão de dedetizadoras, empresas de limpeza e serviços recorrentes.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "BRL",
    lowPrice: "97",
    highPrice: "397",
    offerCount: "3",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "500",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Servicfy" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
