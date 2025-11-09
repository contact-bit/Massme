import Link from "next/link";
import { redirect } from "next/navigation";

export default function RootHome() {
  // 🧭 Redirige directement vers /fr (par défaut)
  redirect("/fr");

  // ⚠️ Ce code ne sera jamais affiché, mais si tu veux afficher une page d'accueil neutre, enlève la ligne ci-dessus.
  return (
    <main className="max-w-5xl mx-auto py-10 space-y-6 text-gray-900">
      <h1 className="text-3xl font-bold mb-4">👋 Bienvenue sur Massme</h1>
      <p className="text-gray-600 mb-6">
        Découvrez nos massages et prestations bien-être.
      </p>

      <div className="flex gap-4">
        <Link
          href="/fr"
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
        >
          Version française 🇫🇷
        </Link>
        <Link
          href="/en"
          className="bg-gray-200 text-gray-900 px-6 py-2 rounded-md hover:bg-gray-300 transition"
        >
          English version 🇬🇧
        </Link>
      </div>
    </main>
  );
}
