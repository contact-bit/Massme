import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Massme",
  description: "Boutique Massme",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white text-black">{children}</body>
    </html>
  );
}
