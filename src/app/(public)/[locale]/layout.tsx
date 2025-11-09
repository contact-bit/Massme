import Link from "next/link";
import "../../globals.css";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // ✅ Attente de la Promise ici

  return (
    <html lang={locale}>
      <body className="bg-gray-50 text-gray-900">
        <header className="max-w-6xl mx-auto py-4 flex justify-between items-center border-b">
          <Link href={`/${locale}`} className="text-xl font-bold text-blue-600">
            Massme
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href={`/${locale}/products`} className="hover:text-blue-600">
              Produits
            </Link>
            <Link href={`/${locale}/cart`} className="hover:text-blue-600">
              Panier
            </Link>
            <div className="flex gap-3 text-sm">
              <Link href="/fr" className="hover:text-blue-600">
                FR
              </Link>
              <Link href="/en" className="hover:text-blue-600">
                EN
              </Link>
            </div>
          </nav>
        </header>

        <main className="max-w-6xl mx-auto py-10 px-4">{children}</main>
      </body>
    </html>
  );
}
