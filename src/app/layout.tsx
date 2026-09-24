import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eventsproai.com.br"),
  title: "Events Pro AI | Gestão Completa para Assessorias de Eventos",
  description: "A plataforma definitiva para gerenciar casamentos e eventos. Ferramentas premium para organizar e encantar clientes com Portal White-label.",
  openGraph: {
    title: "Events Pro AI",
    description: "Gestão completa para assessorias de eventos. Eleve o nível das suas entregas.",
    url: "https://eventsproai.com.br",
    siteName: "Events Pro AI",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Events Pro AI Logo",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
