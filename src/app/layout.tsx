import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "OculaRest",
  description: "Boutique OculaRest",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="w-full h-full">
      <body className="w-full min-h-full bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
