"use client";

import React, { use } from "react"; // ✅ <-- important
import Link from "next/link";

export default function SuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // ✅ On utilise la nouvelle API React 19 / Next.js 16
  const { locale } = use(params);

  return (
    <main className="max-w-3xl mx-auto py-10 text-center text-gray-900">
      <h1 className="text-3xl font-bold mb-4">
        {locale === "fr" ? "🎉 Paiement réussi !" : "🎉 Payment successful!"}
      </h1>

      <p className="text-gray-600 mb-6">
        {locale === "fr"
          ? "Merci pour votre commande. Vous recevrez un e-mail de confirmation."
          : "Thank you for your order. You’ll receive a confirmation email soon."}
      </p>

      <Link
        href={`/${locale}/products`}
        className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
      >
        {locale === "fr" ? "Retour à la boutique" : "Back to shop"}
      </Link>
    </main>
  );
}
