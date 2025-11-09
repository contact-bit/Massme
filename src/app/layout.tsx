import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Massme",
  description: "Boutique Massme",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      {/* ✅ Même classes que dans /app/admin/layout.tsx */}
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
