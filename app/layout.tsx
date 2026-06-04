import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AtlasOps SaaS Dashboard",
  description: "A portfolio-ready SaaS dashboard built with Next.js, Supabase, Stripe, Tailwind, and shadcn/ui."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen font-sans`}>{children}</body>
    </html>
  );
}
