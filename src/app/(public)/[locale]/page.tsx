import Link from "next/link";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="max-w-5xl mx-auto py-10 space-y-6 text-gray-900">
      <h1 className="text-3xl font-bold mb-4">
        {locale === "fr" ? "👋 Bienvenue sur Massme" : "👋 Welcome to Massme"}
      </h1>

      <p className="text-gray-600 mb-6">
        {locale === "fr"
          ? "Découvrez nos massages et prestations bien-être."
          : "Discover our professional massage and wellness services."}
      </p>

      <div className="flex gap-4">
        <Link
          href={`/${locale}/products`}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-500 transition"
        >
          {locale === "fr" ? "Voir les produits" : "View products"}
        </Link>
        <Link
          href={`/${locale}/cart`}
          className="bg-gray-200 text-gray-900 px-6 py-2 rounded-md hover:bg-gray-300 transition"
        >
          {locale === "fr" ? "Mon panier" : "My cart"}
        </Link>
      </div>
    </main>
  );
}
