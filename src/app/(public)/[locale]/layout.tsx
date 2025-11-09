import Link from "next/link";
import "../../globals.css";

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  return (
    <>
      <header className="max-w-6xl mx-auto py-4 flex justify-between items-center border-b">
        <Link href={`/${locale}`} className="text-xl font-bold text-blue-600">
          MassMe
        </Link>

        <nav className="flex gap-3 text-sm">
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
      </header>

      <main className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </main>
    </>
  );
}
