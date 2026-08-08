import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AwaamCare AI — Pakistan Citizen Grievance & Municipal Intelligence Platform",
  description: "AwaamCare AI: Intelligent civic complaint management, real-time NLP routing, and statistical governance for Pakistani cities.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
