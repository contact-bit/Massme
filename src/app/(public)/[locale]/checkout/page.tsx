"use client";

import { useState } from "react";
import { use } from "react"; // 👈 on importe use() pour unwrap la Promise

const SHIPPING_METHODS = [
  {
    id: "standard_fr",
    name: { fr: "Livraison standard (France)", en: "Standard shipping (France)" },
    price: { fr: 4.99, eu: 9.99, us: 14.99 },
  },
  {
    id: "express",
    name: { fr: "Express", en: "Express" },
    price: { fr: 9.99, eu: 14.99, us: 19.99 },
  },
];

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params); // ✅ On "unwrap" la Promise ici

  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_METHODS[0]);
  const [customerEmail, setCustomerEmail] = useState("");

  async function handlePay() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        items: [{ name: "Prestation Massme", price: 49.99, quantity: 1 }],
        currency: "eur",
        shippingMethod: selectedShipping,
        customerEmail,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  return (
    <main className="max-w-3xl mx-auto py-8 space-y-4">
      <h1 className="text-xl font-semibold">
        {locale === "fr" ? "Finaliser la commande" : "Complete your order"}
      </h1>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">
          {locale === "fr" ? "Votre email" : "Your email"}
        </span>
        <input
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          className="border rounded px-3 py-2"
          placeholder="vous@exemple.com"
        />
      </label>

      <div className="space-y-2">
        <p className="text-sm font-medium">
          {locale === "fr" ? "Mode de livraison" : "Shipping method"}
        </p>
        {SHIPPING_METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedShipping(m)}
            className={`block w-full text-left border rounded px-3 py-2 ${
              selectedShipping.id === m.id ? "border-black" : "border-gray-200"
            }`}
          >
{m.name[locale as "fr" | "en"]} — {m.price.fr} €
          </button>
        ))}
      </div>

      <button
        onClick={handlePay}
        className="inline-flex items-center px-4 py-2 bg-black text-white rounded"
      >
        {locale === "fr" ? "Payer" : "Pay"}
      </button>
    </main>
  );
}
