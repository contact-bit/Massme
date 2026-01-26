import { ReactNode } from "react";

/* TOKENS & THEMES */
import "@/styles/tokens.css";
import "@/styles/themes.css";
import "@/styles/utilities.css";

/* COMPONENTS */
import "@/styles/components/buttons.css";
import "@/styles/components/navbar.css";
import "@/styles/components/footer.css";
import "@/styles/components/cartDrawer.css";
import "@/styles/components/productCard.css";
import "@/styles/components/productList.css";

/* PAGES */
import "@/styles/pages/home.css";
import "@/styles/pages/products.css";
import "@/styles/pages/checkout.css";
import "@/styles/pages/contact.css";
import "@/styles/pages/success.css";
import "@/styles/pages/blog.css";
import "@/styles/pages/about.css";
import "@/styles/pages/besoins.css";

import Navbar from "@/components/Navbar";
// import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const safeLocale = locale === "fr" || locale === "en" ? locale : "fr";

  return (
    <CartProvider>
      <Navbar />
      {/* Panier latéral désactivé pour ce projet.
          Pour le réactiver dans une autre boutique :
          <CartDrawer /> */}
      <main>{children}</main>
      <Footer />
    </CartProvider>
  );
}
