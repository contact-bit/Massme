import type { ReactNode } from "react";


import "@/styles/shop/index.css";
import "@/styles/components/cartDrawer.css";

import "./home.css";
import "./products/products.css";
import "./checkout/checkout.css";
import "./contact/contact.css";
import "./success/success.css";
import "./blog/blog.css";
import "./public-identity.css";

import { CartProvider } from "@/context/CartContext";
import { isLocale } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "fr";

  return (
    <CartProvider>
      <div className="public-shell">
        <Navbar locale={safeLocale} />
        <CartDrawer />
        <main className="public-main">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
