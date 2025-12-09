"use client";

import type { ShippingMethod } from "../page";
import { useState } from "react";

export default function ToggleActivation({
  method,
  onUpdated,
}: {
  method: ShippingMethod;
  onUpdated: (m: ShippingMethod) => void;
}) {
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/shipping-methods/${method.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { isActive: !method.isActive },
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        alert("Erreur lors de la mise à jour de l'état");
        return;
      }

      onUpdated({ ...method, isActive: !method.isActive });
    } catch (e) {
      console.error("Erreur toggle activation:", e);
      alert("Erreur lors de la mise à jour de l'état");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-3 py-1 text-sm rounded-md ${
        method.isActive ? "bg-green-100 text-green-700" : "bg-gray-200"
      }`}
    >
      {loading
        ? "..."
        : method.isActive
        ? "Désactiver"
        : "Activer"}
    </button>
  );
}
