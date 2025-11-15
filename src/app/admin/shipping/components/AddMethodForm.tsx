"use client";

import { useState } from "react";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AddMethodForm({
  zone,
  onAdded,
}: {
  zone: string;
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [delay, setDelay] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!name || !delay || !price) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    // ID document = standard_fr | express_en etc.
    const id = `${name.toLowerCase().replace(/\s+/g, "_")}_${zone}`;

    await setDoc(doc(db, "shipping_methods", id), {
      name: {
        fr: zone === "fr" ? name : "",
        en: zone === "en" ? name : "",
      },
      delay: {
        fr: zone === "fr" ? delay : "",
        en: zone === "en" ? delay : "",
      },
      price: {
        fr: zone === "fr" ? Number(price) : null,
        en: zone === "en" ? Number(price) : null,
      },
      isActive: true,
      zone,
    });

    setName("");
    setDelay("");
    setPrice("");
    setLoading(false);
    onAdded();
  }

  return (
    <div className="bg-white border rounded-lg p-5 shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">
        ➕ Ajouter un transporteur ({zone.toUpperCase()})
      </h3>

      <input
        className="input"
        placeholder="Nom (ex: Livraison express)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="input mt-2"
        placeholder="Délai (ex: 24–48h)"
        value={delay}
        onChange={(e) => setDelay(e.target.value)}
      />

      <input
        type="number"
        className="input mt-2"
        placeholder="Prix (€)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <button
        onClick={handleAdd}
        disabled={loading}
        className="btn-primary mt-4"
      >
        {loading ? "Ajout..." : "➕ Ajouter le transporteur"}
      </button>
    </div>
  );
}
