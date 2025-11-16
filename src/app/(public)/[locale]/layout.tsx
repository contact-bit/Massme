import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import "../../globals.css";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // ⬇️ OBLIGATOIRE car params est une Promise dans les layouts async
  const { locale } = await params;

  return (
    <CartProvider>
      <Navbar />

      <CartDrawer locale={locale} />

      <main className="flex-1">{children}</main>

      <footer className="border-t py-6 text-center text-sm text-gray-500">
        © 2025 MassMe — 
        {locale === "fr" ? " Fabriqué en France" : " Made in France"}
      </footer>
    </CartProvider>
  );
}
