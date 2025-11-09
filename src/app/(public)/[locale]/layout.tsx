import React from "react";
import Link from "next/link";
import "../../globals.css"; // ✅ corrige le chemin

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // ✅ Nouvelle API Next.js 16 : params est une Promise
  const { locale } = React.use(params);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* 🧭 Header */}
      <header className="max-w-6xl mx-auto py-4 flex justify-between items-center border-b border-gray-200 px-4">
        <Link
          href={`/${locale}`}
          className="text-2xl font-bold text-blue-600 hover:opacity-80"
        >
          MassMe
        </Link>

        <nav className="flex gap-4 text-sm font-medium">
          <Link href={`/${locale}/products`} className="hover:text-blue-600">
            {locale === "fr" ? "Produits" : "Products"}
          </Link>
          <Link href={`/${locale}/cart`} className="hover:text-blue-600">
            {locale === "fr" ? "Panier" : "Cart"}
          </Link>
          <Link href={`/${locale}/checkout`} className="hover:text-blue-600">
            {locale === "fr" ? "Commander" : "Checkout"}
          </Link>
        </nav>

        <div className="flex gap-3 text-sm">
          <Link href="/fr" className="hover:text-blue-600">
            FR
          </Link>
          <Link href="/en" className="hover:text-blue-600">
            EN
          </Link>
        </div>
      </header>

      {/* 📦 Contenu */}
      <main className="flex-1">{children}</main>

      {/* ⚙️ Footer */}
      <footer className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} MassMe —{" "}
        {locale === "fr" ? "Fabriqué en France 🇫🇷" : "Made in France 🇫🇷"}
      </footer>
    </div>
  );
}
