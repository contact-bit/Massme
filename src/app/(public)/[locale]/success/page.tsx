"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("⏳ Vérification du paiement...");

  useEffect(() => {
    if (!sessionId) {
      setStatus("⚠️ Session Stripe invalide ou manquante.");
      return;
    }

    // ✅ Nettoyer l’URL pour éviter le cache avec un ancien session_id
    window.history.replaceState({}, "", window.location.pathname);

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const data = await res.json();

        console.log("🔍 Résultat vérification Stripe:", data);

        if (data.success) {
          setStatus("✅ Paiement confirmé ! Merci pour votre commande 💚");
        } else if (data.status === "unpaid") {
          setStatus("⚠️ Paiement non confirmé. Veuillez patienter quelques instants ou contacter le support.");
        } else {
          setStatus("⚠️ Paiement non confirmé. Veuillez contacter le support.");
        }
      } catch (err) {
        console.error("❌ Erreur front verify-payment:", err);
        setStatus("❌ Erreur lors de la vérification du paiement.");
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <h1 className="text-3xl font-bold mb-4">{status}</h1>
      {sessionId && (
        <p className="text-gray-500">
          ID de session Stripe : <span className="font-mono">{sessionId}</span>
        </p>
      )}
    </main>
  );
}

export default function SuccessPage() {
  // ✅ Obligatoire en Next.js 16 quand on utilise useSearchParams()
  return (
    <Suspense fallback={<p className="text-center py-20">Chargement...</p>}>
      <SuccessContent />
    </Suspense>
  );
}
