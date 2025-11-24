"use client";

import { use, useState, ChangeEvent } from "react";
import { useCart } from "@/context/CartContext";
import SendcloudWidget from "@/components/shipping/sendcloud/SendcloudWidget";

/* ============================================================
   Types
============================================================ */
type Locale = "fr" | "en";

/* ============================================================
   CHECKOUT PAGE
============================================================ */

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const { items, getTotal } = useCart();

  /* === Hard-coded Sendcloud method === */
  const sendcloudShippingMethod = {
    id: "sendcloud",
    name: locale === "fr" ? "Livraison" : "Shipping",
    delay: locale === "fr" ? "2-4 jours" : "2-4 days",
    price: 4.9,
    type: "relay",
  };

  /* === STATES === */
  const [relayPoint, setRelayPoint] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  /* ============================================================
     FORM HANDLER
  ============================================================ */

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const relayMissing = !relayPoint;

  /* ============================================================
     STRIPE CHECKOUT
  ============================================================ */

  const handleCheckout = async () => {
    if (relayMissing) {
      alert(
        locale === "fr"
          ? "Veuillez sélectionner un mode de livraison."
          : "Please select a delivery method."
      );
      return;
    }

    setIsPaying(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingMethod: sendcloudShippingMethod,
          customerEmail: form.email,
          shippingAddress: form,
          relayPoint,
          currency: "eur",
        }),
      });

      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Erreur pendant la redirection vers Stripe.");
    } catch (err) {
      console.error("Erreur checkout:", err);
      alert("Erreur inattendue.");
    } finally {
      setIsPaying(false);
    }
  };

  const total = getTotal() + sendcloudShippingMethod.price;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main className="checkout-page">
      <h1 className="checkout-title">
        {locale === "fr" ? "Informations de livraison" : "Shipping details"}
      </h1>

      <div className="checkout-card">
        {/* ========================= FORMULAIRE ========================= */}
        <section className="checkout-section">
          <h2 className="checkout-section-title">
            {locale === "fr" ? "Adresse" : "Address"}
          </h2>

          <div className="checkout-fields">
            {["name", "email", "address", "city", "postalCode", "phone"].map(
              (field) => (
                <input
                  key={field}
                  name={field}
                  className="checkout-input"
                  placeholder={
                    locale === "fr"
                      ? {
                          name: "Nom complet",
                          email: "Email",
                          address: "Adresse",
                          city: "Ville",
                          postalCode: "Code postal",
                          phone: "Téléphone",
                        }[field]
                      : {
                          name: "Full name",
                          email: "Email",
                          address: "Address",
                          city: "City",
                          postalCode: "ZIP",
                          phone: "Phone",
                        }[field]
                  }
                  value={(form as any)[field]}
                  onChange={handleChange}
                />
              )
            )}
          </div>
        </section>

        {/* ========================= SHIPPING METHOD (HARD-CODED) ========================= */}
        <section className="checkout-section">
          <h2 className="checkout-section-title">
            {locale === "fr" ? "Méthode de livraison" : "Shipping method"}
          </h2>

          <p className="text-lg font-medium">
            {sendcloudShippingMethod.name} —{" "}
            {sendcloudShippingMethod.price.toFixed(2)} €
          </p>

          {/* ========================= SENDCLOUD WIDGET ========================= */}

          <div className="mt-4">
            <SendcloudWidget
              locale={locale}
              onSelect={(data: any) => {
                console.log("📦 Selected in Sendcloud:", data);
                setRelayPoint(data);
              }}
            />
          </div>

          {relayMissing && (
            <p className="mt-2 text-red-600 text-sm">
              {locale === "fr"
                ? "Veuillez sélectionner une méthode de livraison."
                : "Please select a delivery method."}
            </p>
          )}

          {relayPoint && (
            <div className="p-3 mt-3 bg-blue-50 border rounded">
              <p className="font-semibold">
                {locale === "fr"
                  ? "Méthode de livraison sélectionnée"
                  : "Selected shipping method"}
              </p>
              <p>{relayPoint.name}</p>
              <p>{relayPoint.street}</p>
              <p>
                {relayPoint.postalCode} {relayPoint.city}
              </p>
            </div>
          )}
        </section>

        {/* ========================= TOTAL ========================= */}
        <section className="checkout-total">
          <span>{locale === "fr" ? "Total à payer :" : "Total:"}</span>
          <span className="checkout-total-amount">{total.toFixed(2)} €</span>
        </section>

        {/* ========================= PAY BUTTON ========================= */}
        <button
          className={`checkout-button ${
            relayMissing || isPaying ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={relayMissing || isPaying}
          onClick={handleCheckout}
        >
          {isPaying
            ? locale === "fr"
              ? "Redirection…"
              : "Redirecting…"
            : locale === "fr"
            ? "Payer maintenant 💳"
            : "Pay now 💳"}
        </button>
      </div>
    </main>
  );
}
