"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ToggleActivation({
  id,
  initial,
  onChanged,
}: {
  id: string;
  initial: boolean;
  onChanged?: () => void;
}) {
  const [enabled, setEnabled] = useState(initial);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;

    const newState = !enabled;
    setEnabled(newState);
    setLoading(true);

    try {
      await updateDoc(doc(db, "shipping_methods", id), {
        isActive: newState,
      });

      if (onChanged) onChanged();
    } catch (err) {
      console.error("❌ Erreur Firestore :", err);
      alert("Impossible de mettre à jour.");
      setEnabled(enabled); // revert
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${
        enabled ? "bg-green-500" : "bg-gray-400"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      ></span>
    </button>
  );
}
