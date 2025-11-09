"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ⚙️ Sous-composant qui lit les query params
function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        ✅ Paiement réussi !
      </h1>

      {sessionId ? (
        <p className="text-gray-700 mb-6">
          Merci pour votre commande 💚 <br />
          <span className="text-sm text-gray-500">
            Session ID : {sessionId}
          </span>
        </p>
      ) : (
        <p className="text-gray-700 mb-6">Commande confirmée.</p>
      )}

      <Link
        href="/fr"
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
      >
        Retourner à la boutique
      </Link>
    </main>
  );
}

// ✅ Page principale avec Suspense
export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Chargement...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
