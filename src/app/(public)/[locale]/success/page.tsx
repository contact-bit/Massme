"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("⏳ Vérification du paiement...");

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/verify-payment?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("✅ Paiement confirmé ! Merci pour votre commande 💚");
        } else {
          setStatus("⚠️ Paiement non confirmé. Veuillez contacter le support.");
        }
      })
      .catch(() => setStatus("❌ Erreur lors de la vérification du paiement."));
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
