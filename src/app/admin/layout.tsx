import Link from "next/link";
import "../globals.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      {/* ✅ même classes que dans RootLayout */}
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white py-4 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4">
            <Link href="/admin" className="text-2xl font-bold text-blue-700">
              Massme Admin
            </Link>

            <nav className="flex items-center gap-6 text-sm">

              <Link href="/fr" className="hover:text-blue-600">
                🌐 Retour site
              </Link>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
