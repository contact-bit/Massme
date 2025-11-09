"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <main className="max-w-2xl mx-auto py-16 text-center text-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-green-600">
        ✅ Paiement réussi !
      </h1>

      {sessionId ? (
        <p className="mb-6">
          Merci pour votre commande 💚 <br />
          <span className="text-sm text-gray-500">
            ID de session : {sessionId}
          </span>
        </p>
      ) : (
        <p className="mb-6">Commande confirmée.</p>
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

export default function SuccessPage() {
  // ✅ On protège le hook avec <Suspense>
  return (
    <Suspense fallback={<div className="p-10 text-center">Chargement...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
