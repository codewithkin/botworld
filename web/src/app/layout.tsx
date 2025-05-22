import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import QueryClientProviderWrapper from "@/providers/QueryClientProviderWrapper";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Botworld – AI-Powered Chatbots for WhatsApp and Telegram",
    template: "%s | Botworld",
  },
  description:
    "Easily create smart, AI-powered bots for WhatsApp and Telegram. Upload documents, answer customer questions, and stay available 24/7 — no code required.",
  keywords: [
    "WhatsApp Bot",
    "Telegram Bot",
    "AI chatbot",
    "No-code bots",
    "Customer support bot",
    "Botworld",
    "Chatbot builder",
    "OpenAI assistant",
  ],
  metadataBase: new URL("https://botworld.pro"),
  openGraph: {
    title: "Botworld – AI-Powered Bots for WhatsApp & Telegram",
    description:
      "Create AI-powered WhatsApp and Telegram bots using your own documents and knowledge base. Perfect for small businesses and teams.",
    url: "https://botworld.pro",
    siteName: "Botworld",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Botworld – AI-Powered Bots for WhatsApp & Telegram",
    description:
      "Build and deploy AI chatbots powered by OpenAI for WhatsApp and Telegram — using your own knowledge base.",
    creator: "@botworld", // update if you have a real handle
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body className={`${poppins.variable} antialiased`}>
        <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
        <Toaster position="top-center" richColors expand visibleToasts={5} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
