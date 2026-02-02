import "./globals.css";
import type { ReactNode } from "react";
import { MouseGradient } from "./MouseGradient";

export const metadata = {
  title: "OculaRest",
  description: "Boutique OculaRest",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="w-full h-full">
      <body
        className="w-full min-h-full text-gray-900"
        style={{
          background:
            "radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(59,130,246,0.18), transparent 55%), linear-gradient(135deg, #e0f2fe 0%, #ecfdf5 50%, #f9fafb 100%)",
          transition: "background 0.25s ease-out",
        }}
      >
        <MouseGradient />
        {children}
      </body>
    </html>
  );
}
