import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "AwaamCare AI — Pakistan Citizen Grievance & Municipal Intelligence Platform",
  description: "AwaamCare AI: Pakistan's first AI-powered civic complaint platform with Gemini AI, ML classification, Roman Urdu support, and real-time analytics.",
  keywords: "AwaamCare, Pakistan civic, municipal complaints, AI governance, citizen portal, Gemini AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
