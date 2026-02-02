// src/app/(public)/[locale]/layout.tsx
import type { ReactNode } from "react";

import "@/styles/tokens.css";
import "@/styles/themes.css";
import "@/styles/utilities.css";

import "@/styles/components/buttons.css";
import "@/styles/components/navbar.css";
import "@/styles/components/footer.css";
import "@/styles/components/cartDrawer.css";
import "@/styles/components/productCard.css";
import "@/styles/components/productList.css";

import "@/styles/pages/home.css";
import "@/styles/pages/products.css";
import "@/styles/pages/checkout.css";
import "@/styles/pages/contact.css";
import "@/styles/pages/success.css";
import "@/styles/pages/blog.css";
import "@/styles/pages/about.css";
import "@/styles/pages/besoins.css";

import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const safeLocale = locale === "fr" || locale === "en" ? locale : "fr";

  return (
    <CartProvider>
      <div className="public-shell">
        <Navbar locale={safeLocale} />
        <main className="public-main">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
