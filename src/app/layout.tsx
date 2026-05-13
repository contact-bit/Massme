import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Vitrectomed.com",
  description: "Boutique Vitectromed",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="w-full h-full">
      <body>
        {children}
      </body>
    </html>
  );
}
