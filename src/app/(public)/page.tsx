"use client";

import Link from "next/link";

const SUPPORTED_LOCALES = ["fr", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

export default function HomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-gray-900">
      {/* ===== TOP BAR ===== */}
      <div className="w-full bg-slate-900 text-white text-xs md:text-sm py-2">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2">
            🇫🇷 100% fabriqué en France • Dispositif Médical CE
          </p>
          <p className="text-slate-300">Paiement sécurisé • Livraison rapide</p>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-gradient-to-br from-blue-500 to-slate-800 flex items-center justify-center text-white font-bold shadow">
              M
            </div>
            <span className="font-semibold text-lg tracking-tight">MassMe</span>
          </Link>

          <nav className="hidden md:flex gap-6 text-sm text-slate-700">
            <Link href={`/${locale}/products`} className="hover:text-blue-600">
              Produits
            </Link>
            <a href="#concept" className="hover:text-blue-600">
              Concept
            </a>
            <a href="#usage" className="hover:text-blue-600">
              Usages
            </a>
            <a href="#why" className="hover:text-blue-600">
              Pourquoi MassMe
            </a>
          </nav>

          <div className="flex gap-3">
            <Link
              href={`/${locale}/cart`}
              className="hidden md:inline-flex px-3 py-1.5 rounded-md border border-slate-200 text-sm hover:border-slate-400"
            >
              Panier
            </Link>
            <Link
              href={`/${locale}/products`}
              className="px-4 py-1.5 rounded-md bg-blue-600 text-white text-sm shadow hover:bg-blue-700 transition"
            >
              Commander
            </Link>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
            Transformez votre lit ou bureau <br /> en espace de massage et de
            relaxation.
          </h1>
          <p className="text-slate-600 mb-6 text-lg leading-relaxed">
            MassMe est le premier accessoire bien-être qui offre une alternative
            innovante à la table de massage. Conçu, fabriqué et assemblé en
            France 🇫🇷.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href={`/${locale}/products`}
              className="px-5 py-2.5 rounded-md bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
            >
              Découvrir MassMe
            </Link>
            <a
              href="#why"
              className="px-5 py-2.5 rounded-md border border-slate-300 font-medium hover:bg-slate-100 transition"
            >
              Pourquoi choisir MassMe ?
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-slate-200 rounded-2xl shadow-md"></div>
          <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-md p-4 w-52">
            <p className="text-xs text-slate-500 mb-1">Positions</p>
            <p className="font-semibold text-slate-900">
              Allongée & assise
            </p>
            <p className="text-xs text-slate-500">
              Réglable & adaptable à tout support
            </p>
          </div>
        </div>
      </section>

      {/* ===== USAGES ===== */}
      <section
        id="usage"
        className="max-w-6xl mx-auto px-4 py-16 border-t border-slate-200"
      >
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">
          Accessoire bien-être pour particuliers et professionnels
        </h2>
        <p className="text-slate-600 mb-8 max-w-2xl">
          Allongé ou assis, au domicile ou au travail — MassMe s’adapte à votre
          confort et à votre espace.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Massage allongé",
              desc: "Ajoutez une fonction table de massage à votre literie.",
            },
            {
              title: "Position assise",
              desc: "Installez MassMe sur un bureau, une table ou un plan de travail.",
            },
            {
              title: "Anti-douleurs cervicales",
              desc: "Soulage la nuque et améliore l’alignement postural.",
            },
            {
              title: "Convalescence vitrectomie",
              desc: "Aide à maintenir la position bulle après opération.",
            },
            {
              title: "Relaxation au travail",
              desc: "Idéal en télétravail pour soulager les tensions.",
            },
            {
              title: "Professionnels",
              desc: "Fait évoluer votre table d’examen ou de massage.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md border border-slate-100 transition"
            >
              <h3 className="font-semibold mb-2 text-slate-900">
                {item.title}
              </h3>
              <p className="text-slate-600 text-sm mb-3">{item.desc}</p>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                En savoir plus →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ===== POURQUOI MASSME ===== */}
      <section
        id="why"
        className="max-w-6xl mx-auto px-4 py-16 border-t border-slate-200 grid md:grid-cols-2 gap-10 items-center"
      >
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-slate-900">
            Pourquoi choisir MassMe ?
          </h2>
          <ul className="space-y-3 text-slate-700 text-sm">
            <li>✔ Multi-supports : lit, canapé, table ou bureau</li>
            <li>✔ Réglable en hauteur et inclinaison</li>
            <li>✔ Compact, transportable et léger (1 kg)</li>
            <li>✔ Coussin à mémoire de forme, housse lavable</li>
            <li>✔ Conçu, fabriqué et assemblé en France</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl p-6 shadow border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            “Nos clients adorent MassMe”
          </h3>
          <p className="text-slate-600 text-sm mb-3">
            “Les utilisateurs MassMe témoignent de leur satisfaction sur la
            Société des Avis Garantis. Confort, innovation et bien-être au
            quotidien.”
          </p>
          <p className="text-3xl text-yellow-400">★★★★★</p>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-slate-900 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div>
            <h2 className="text-2xl font-semibold mb-2">
              Offrez-vous un moment de détente
            </h2>
            <p className="text-slate-200 text-sm max-w-xl">
              Remplacez votre table de massage, gagnez de la place et profitez
              d’un confort optimal.
            </p>
          </div>
          <Link
            href={`/${locale}/products`}
            className="bg-white text-slate-900 px-6 py-2.5 rounded-md font-semibold shadow hover:bg-slate-100"
          >
            Commander MassMe
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        <p>© 2025 LazurCo • Made in France • MassMe</p>
        <div className="flex gap-4 justify-center mt-2 text-xs">
          <Link href="/cgv">CGV</Link>
          <Link href="/rgpd">RGPD</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </footer>
    </main>
  );
}
