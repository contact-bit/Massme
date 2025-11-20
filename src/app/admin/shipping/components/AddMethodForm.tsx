"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AddMethodForm({
  zone,
  onAdded,
}: {
  zone: string;
  onAdded: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    delay: "",
    price: "",
    type: "home",
    relayProvider: "",
  });

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      alert("Veuillez remplir au minimum le nom et le prix.");
      return;
    }

    const priceValue = parseFloat(form.price);

    if (isNaN(priceValue)) {
      alert("Le prix doit être un nombre.");
      return;
    }

    // ---- MULTILINGUE : remplit automatiquement fr + en ----
    const name = {
      fr: form.name,
      en: form.name, // fallback auto
    };

    const delay = {
      fr: form.delay,
      en: form.delay, // fallback auto
    };

    const price = {
      fr: priceValue,
      en: priceValue, // fallback auto
    };

    // ---- Relay provider : seulement si type = relay ----
    const relayProvider =
      form.type === "relay" ? form.relayProvider : null;

    // ---- ENREGISTREMENT FIRESTORE ----
    await addDoc(collection(db, "shipping_methods"), {
      zone,
      isActive: true,

      // champs nécessaires pour checkout
      type: form.type,
      relayProvider,

      // champs multilingues propres
      name,
      delay,
      price,
    });

    // Reset formulaire
    setForm({
      name: "",
      delay: "",
      price: "",
      type: "home",
      relayProvider: "",
    });

    onAdded();
  };

  return (
    <div className="space-y-3">
      <input
        name="name"
        className="admin-input"
        placeholder="Nom (ex : Mondial Relay - Point Relais)"
        value={form.name}
        onChange={handleChange}
      />

      <input
        name="delay"
        className="admin-input"
        placeholder="Délai (ex : 48-72h)"
        value={form.delay}
        onChange={handleChange}
      />

      <input
        name="price"
        className="admin-input"
        type="number"
        placeholder="Prix (€)"
        value={form.price}
        onChange={handleChange}
      />

      <select
        name="type"
        className="admin-input"
        value={form.type}
        onChange={handleChange}
      >
        <option value="home">Livraison à domicile</option>
        <option value="relay">Point relais</option>
      </select>

      {form.type === "relay" && (
        <select
          name="relayProvider"
          className="admin-input"
          value={form.relayProvider}
          onChange={handleChange}
        >
          <option value="">Choisir le réseau</option>
          <option value="mondialrelay">Mondial Relay</option>
          <option value="pickup">Pickup Shop2Shop</option>
          <option value="colissimo">Colissimo</option>
          <option value="relais-colis">Relais Colis</option>
        </select>
      )}

      <button className="btn-primary" onClick={handleSubmit}>
        ➕ Ajouter le transporteur
      </button>
    </div>
  );
}
