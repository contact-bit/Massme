"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { usePathname } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useCart } from "@/context/CartContext";
import ChooseShipping from "@/components/shipping/ChooseShipping";
import {
  ShippingMethod,
  RelayPoint,
} from "@/components/shipping/types";

type Locale = "fr" | "en";

export default function CheckoutPage() {
  const pathname = usePathname();
  const locale: Locale = pathname?.startsWith("/en") ? "en" : "fr";

  const { items, getTotal } = useCart();

  /* === FORM STATE === */
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "FR",
    phone: "",
  });

  /* === SHIPPING STATE === */
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(
    null
  );
  const [relayPoint, setRelayPoint] = useState<RelayPoint | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);

  /* === METHODS FROM FIRESTORE === */
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);

  /* === UI STATE === */
  const [isPaying, setIsPaying] = useState(false);

  /* ============================================================
     LOAD SHIPPING METHODS FROM FIRESTORE (country + active)
  ============================================================ */
  useEffect(() => {
    const fetchMethods = async () => {
      setLoadingMethods(true);
      setShippingMethod(null);
      setRelayPoint(null);
      setShippingError(null);

      try {
        const ref = collection(db, "shipping_methods");
        const q = query(
          ref,
          where("country", "==", form.country),
          where("isActive", "==", true)
        );
        const snap = await getDocs(q);

        const list: ShippingMethod[] = snap.docs.map((doc) => {
          const raw = doc.data() as any;

          const name =
            raw.name?.[locale] ||
            raw.name?.fr ||
            raw.name?.en ||
            "Shipping";

          const delay =
            raw.delay?.[locale] ||
            raw.delay?.fr ||
            raw.delay?.en ||
            "";

          const priceRaw =
            raw.price?.[locale] ??
            raw.price?.fr ??
            raw.price?.en ??
            0;

          return {
            id: doc.id,
            name,
            delay,
            price: Number(priceRaw) || 0,
            type: raw.type || "home",
            relayProvider: raw.relayProvider || null,
            isActive: raw.isActive !== false,
            moreInfoUrl: raw.moreInfoUrl || undefined,
          };
        });

        setMethods(list);
      } catch (err) {
        console.error("Erreur chargement méthodes :", err);
      } finally {
        setLoadingMethods(false);
      }
    };

    fetchMethods();
  }, [form.country, locale]);

  /* ============================================================
     FORM HANDLER
  ============================================================ */

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ============================================================
     STRIPE CHECKOUT
  ============================================================ */

  const handleCheckout = async () => {
    if (!shippingMethod) {
      setShippingError(
        locale === "fr"
          ? "Veuillez sélectionner une méthode de livraison."
          : "Please select a shipping method."
      );
      return;
    }

    if (shippingMethod.type === "relay" && !relayPoint) {
      setShippingError(
        locale === "fr"
          ? "Veuillez choisir un point relais Mondial Relay."
          : "Please choose a Mondial Relay pickup point."
      );
      return;
    }

    if (!form.email) {
      alert(
        locale === "fr"
          ? "Veuillez renseigner votre email."
          : "Please enter your email."
      );
      return;
    }

    setShippingError(null);
    setIsPaying(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          currency: "eur",
          locale,
          customerEmail: form.email,
          shippingAddress: form,
          shippingMethod,
          relayPoint,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout API error:", data);
        alert(
          locale === "fr"
            ? "Erreur pendant la redirection vers Stripe."
            : "Error while redirecting to Stripe."
        );
      }
    } catch (err) {
      console.error("Erreur checkout:", err);
      alert(
        locale === "fr"
          ? "Erreur inattendue pendant le paiement."
          : "Unexpected error during checkout."
      );
    } finally {
      setIsPaying(false);
    }
  };

  const shippingPrice = shippingMethod?.price ?? 0;
  const cartTotal = getTotal();
  const total = cartTotal + shippingPrice;

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
            <input
              name="name"
              className="checkout-input"
              placeholder={locale === "fr" ? "Nom complet" : "Full name"}
              value={form.name}
              onChange={handleChange}
            />
            <input
              name="email"
              className="checkout-input"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            <input
              name="address"
              className="checkout-input"
              placeholder={locale === "fr" ? "Adresse" : "Address"}
              value={form.address}
              onChange={handleChange}
            />
            <input
              name="postalCode"
              className="checkout-input"
              placeholder={locale === "fr" ? "Code postal" : "ZIP"}
              value={form.postalCode}
              onChange={handleChange}
            />
            <input
              name="city"
              className="checkout-input"
              placeholder={locale === "fr" ? "Ville" : "City"}
              value={form.city}
              onChange={handleChange}
            />

            {/* PAYS */}
            <select
              name="country"
              className="checkout-input"
              value={form.country}
              onChange={handleChange}
            >
              {locale === "fr" ? (
                <>
                  <option value="FR">France</option>
                  <option value="BE">Belgique</option>
                  <option value="ES">Espagne</option>
                  <option value="DE">Allemagne</option>
                  <option value="IT">Italie</option>
                  <option value="NL">Pays-Bas</option>
                  <option value="PT">Portugal</option>
                </>
              ) : (
                <>
                  <option value="FR">France</option>
                  <option value="BE">Belgium</option>
                  <option value="ES">Spain</option>
                  <option value="DE">Germany</option>
                  <option value="IT">Italy</option>
                  <option value="NL">Netherlands</option>
                  <option value="PT">Portugal</option>
                </>
              )}
            </select>

            <input
              name="phone"
              className="checkout-input"
              placeholder={locale === "fr" ? "Téléphone" : "Phone"}
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* ========================= SHIPPING METHODS ========================= */}
        <section className="checkout-section">
          {loadingMethods ? (
            <p className="text-sm text-gray-600">
              {locale === "fr"
                ? "Chargement des méthodes de livraison..."
                : "Loading shipping methods..."}
            </p>
          ) : methods.length === 0 ? (
            <p className="text-sm text-red-600">
              {locale === "fr"
                ? "Aucune méthode de livraison disponible pour ce pays."
                : "No shipping methods available for this country."}
            </p>
          ) : (
            <ChooseShipping
              methods={methods}
              locale={locale}
              onMethodSelect={(m) => {
                setShippingMethod(m);
                setShippingError(null);
              }}
              onRelaySelect={(rp) => {
                setRelayPoint(rp);
                setShippingError(null);
              }}
              error={shippingError}
            />
          )}
        </section>

        {/* ========================= TOTAL ========================= */}
        <section className="checkout-total">
          <div className="flex justify-between text-sm mb-1">
            <span>{locale === "fr" ? "Sous-total :" : "Subtotal:"}</span>
            <span>{cartTotal.toFixed(2)} €</span>
          </div>

          <div className="flex justify-between text-sm mb-1">
            <span>
              {locale === "fr" ? "Livraison :" : "Shipping:"}
              {shippingMethod ? ` (${shippingMethod.name})` : ""}
            </span>
            <span>{shippingPrice.toFixed(2)} €</span>
          </div>

          <div className="flex justify-between font-semibold mt-2">
            <span>
              {locale === "fr" ? "Total à payer :" : "Total to pay:"}
            </span>
            <span className="checkout-total-amount">{total.toFixed(2)} €</span>
          </div>
        </section>

        {/* ========================= PAY BUTTON ========================= */}
        <button
          className={`checkout-button ${
            isPaying ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isPaying}
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
