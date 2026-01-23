"use client";
import "@/styles/shipping-form.css";

import { useState } from "react";
import {
  CountryCode,
  COUNTRY_LANGUAGE_MAP,
} from "@/lib/shipping-i18n";

type Props = {
  country: CountryCode;
  onCreated: () => void;
};

export default function AddMethodForm({
  country,
  onCreated,
}: Props) {
  const locale = COUNTRY_LANGUAGE_MAP[country];

  const [name, setName] = useState("");
  const [delay, setDelay] = useState("");
  const [type, setType] = useState<
    "home" | "relay" | "local_pickup"
  >("home");
  const [priceHT, setPriceHT] = useState("");
  const [vatRate, setVatRate] = useState(
    country === "CH" ? "0" : "20"
  );
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nom requis");
      return;
    }

    setLoading(true);

    const payload = {
      country,
      name: { [locale]: name.trim() },
      delay: delay ? { [locale]: delay.trim() } : {},
      type,
      priceHT: Number(priceHT),
      vatRate: Number(vatRate),
      isActive: true,
    };

    console.log("🚚 SHIPPING PAYLOAD", payload);

    const res = await fetch("/api/admin/shipping-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error("❌ API ERROR", json);
      alert(json.error || "Erreur création livraison");
      setLoading(false);
      return;
    }

    setName("");
    setDelay("");
    setPriceHT("");
    setVatRate(country === "CH" ? "0" : "20");

    onCreated();
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="shipping-form">
  <p className="shipping-form-header">
    ➕ Méthode pour <strong>{country}</strong> — langue{" "}
    <strong>{locale.toUpperCase()}</strong>
  </p>

  <div className="shipping-col">
    <input
      className="shipping-input"
      placeholder={`Nom (${locale.toUpperCase()})`}
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
    />

    <input
      className="shipping-input"
      placeholder={`Délai (${locale.toUpperCase()})`}
      value={delay}
      onChange={(e) => setDelay(e.target.value)}
    />

    <select
      className="shipping-select"
      value={type}
      onChange={(e) => setType(e.target.value as any)}
    >
      <option value="home">Livraison à domicile</option>
      <option value="relay">Point relais</option>
      <option value="local_pickup">Retrait sur place</option>
    </select>

    <div className="shipping-row">
      <input
        type="number"
        step="0.01"
        min="0"
        className="shipping-input"
        placeholder="Prix HT (€)"
        value={priceHT}
        onChange={(e) => setPriceHT(e.target.value)}
        required
      />

      <input
        type="number"
        step="0.01"
        min="0"
        className="shipping-input"
        placeholder="TVA (%)"
        value={vatRate}
        disabled={country === "CH"}
        onChange={(e) => setVatRate(e.target.value)}
      />
    </div>

    <button
      disabled={loading}
      className="shipping-submit"
    >
      ➕ Ajouter la livraison
    </button>
  </div>
</form>

  );
}
