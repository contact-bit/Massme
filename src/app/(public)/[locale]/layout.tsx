import type { ReactNode } from "react";


import "@/styles/shop/index.css";

import "./home.css";
import "./products/products.css";
import "./checkout/checkout.css";
import "./contact/contact.css";
import "./success/success.css";
import "./blog/blog.css";

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
