"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("Vérification du paiement...");

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/verify-payment?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStatus("✅ Paiement confirmé !");
        else setStatus("❌ Paiement non confirmé.");
      })
      .catch(() => setStatus("Erreur de vérification."));
  }, [sessionId]);

  return (
    <main className="text-center py-20">
      <h1 className="text-3xl font-bold">{status}</h1>
    </main>
  );
}
