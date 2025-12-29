"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { usePathname } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useCart } from "@/context/CartContext";
import ChooseShipping from "@/components/shipping/ChooseShipping";
import { ShippingMethod, RelayPoint } from "@/components/shipping/types";

/* ----------------------------------
   🌍 LOCALES (6 langues)
---------------------------------- */
const LOCALES = ["fr", "en", "es", "de", "it", "nl"] as const;
type Locale = (typeof LOCALES)[number];

function isLocale(v: any): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

function getLocaleFromPathname(pathname: string | null): Locale {
  const raw = pathname?.split("/")?.[1] || "fr";
  return isLocale(raw) ? raw : "fr";
}

/* ----------------------------------
   🧠 UI TEXT
---------------------------------- */
const UI: Record<
  Locale,
  {
    title: string;
    addressTitle: string;
    fullName: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
    phone: string;

    loadingShipping: string;
    noShipping: string;

    needMethod: string;
    needRelay: string;
    needEmail: string;

    subtotal: string;
    shipping: string;
    total: string;

    payNow: string;
    redirecting: string;

    countries: Record<string, string>; // ISO -> label
  }
> = {
  fr: {
    title: "Informations de livraison",
    addressTitle: "Adresse",
    fullName: "Nom complet",
    address: "Adresse",
    postalCode: "Code postal",
    city: "Ville",
    country: "Pays",
    phone: "Téléphone",

    loadingShipping: "Chargement des méthodes de livraison...",
    noShipping: "Aucune méthode de livraison pour ce pays.",

    needMethod: "Veuillez sélectionner une méthode de livraison.",
    needRelay: "Veuillez choisir un point relais.",
    needEmail: "Veuillez renseigner votre email.",

    subtotal: "Sous-total :",
    shipping: "Livraison :",
    total: "Total à payer :",

    payNow: "Payer maintenant 💳",
    redirecting: "Redirection…",

    countries: {
      FR: "France",
      BE: "Belgique",
      ES: "Espagne",
      DE: "Allemagne",
      IT: "Italie",
      NL: "Pays-Bas",
      PT: "Portugal",
      CH: "Suisse",
      AT: "Autriche",
    },
  },
  en: {
    title: "Shipping details",
    addressTitle: "Address",
    fullName: "Full name",
    address: "Address",
    postalCode: "ZIP",
    city: "City",
    country: "Country",
    phone: "Phone",

    loadingShipping: "Loading shipping methods...",
    noShipping: "No shipping methods available for this country.",

    needMethod: "Please select a shipping method.",
    needRelay: "Please choose a relay point.",
    needEmail: "Please enter your email.",

    subtotal: "Subtotal:",
    shipping: "Shipping:",
    total: "Total to pay:",

    payNow: "Pay now 💳",
    redirecting: "Redirecting…",

    countries: {
      FR: "France",
      BE: "Belgium",
      ES: "Spain",
      DE: "Germany",
      IT: "Italy",
      NL: "Netherlands",
      PT: "Portugal",
      CH: "Switzerland",
      AT: "Austria",
    },
  },
  es: {
    title: "Datos de envío",
    addressTitle: "Dirección",
    fullName: "Nombre completo",
    address: "Dirección",
    postalCode: "Código postal",
    city: "Ciudad",
    country: "País",
    phone: "Teléfono",

    loadingShipping: "Cargando métodos de envío...",
    noShipping: "No hay métodos de envío disponibles para este país.",

    needMethod: "Por favor, selecciona un método de envío.",
    needRelay: "Por favor, elige un punto de recogida.",
    needEmail: "Por favor, introduce tu email.",

    subtotal: "Subtotal:",
    shipping: "Envío:",
    total: "Total a pagar:",

    payNow: "Pagar ahora 💳",
    redirecting: "Redirigiendo…",

    countries: {
      FR: "Francia",
      BE: "Bélgica",
      ES: "España",
      DE: "Alemania",
      IT: "Italia",
      NL: "Países Bajos",
      PT: "Portugal",
      CH: "Suiza",
      AT: "Austria",
    },
  },
  de: {
    title: "Versanddetails",
    addressTitle: "Adresse",
    fullName: "Vollständiger Name",
    address: "Adresse",
    postalCode: "PLZ",
    city: "Stadt",
    country: "Land",
    phone: "Telefon",

    loadingShipping: "Versandarten werden geladen...",
    noShipping: "Keine Versandarten für dieses Land verfügbar.",

    needMethod: "Bitte wähle eine Versandart aus.",
    needRelay: "Bitte wähle eine Abholstelle aus.",
    needEmail: "Bitte gib deine E-Mail-Adresse ein.",

    subtotal: "Zwischensumme:",
    shipping: "Versand:",
    total: "Zu zahlen:",

    payNow: "Jetzt bezahlen 💳",
    redirecting: "Weiterleitung…",

    countries: {
      FR: "Frankreich",
      BE: "Belgien",
      ES: "Spanien",
      DE: "Deutschland",
      IT: "Italien",
      NL: "Niederlande",
      PT: "Portugal",
      CH: "Schweiz",
      AT: "Österreich",
    },
  },
  it: {
    title: "Dettagli di spedizione",
    addressTitle: "Indirizzo",
    fullName: "Nome completo",
    address: "Indirizzo",
    postalCode: "CAP",
    city: "Città",
    country: "Paese",
    phone: "Telefono",

    loadingShipping: "Caricamento metodi di spedizione...",
    noShipping: "Nessun metodo di spedizione disponibile per questo paese.",

    needMethod: "Seleziona un metodo di spedizione.",
    needRelay: "Seleziona un punto di ritiro.",
    needEmail: "Inserisci la tua email.",

    subtotal: "Subtotale:",
    shipping: "Spedizione:",
    total: "Totale da pagare:",

    payNow: "Paga ora 💳",
    redirecting: "Reindirizzamento…",

    countries: {
      FR: "Francia",
      BE: "Belgio",
      ES: "Spagna",
      DE: "Germania",
      IT: "Italia",
      NL: "Paesi Bassi",
      PT: "Portogallo",
      CH: "Svizzera",
      AT: "Austria",
    },
  },
  nl: {
    title: "Verzendgegevens",
    addressTitle: "Adres",
    fullName: "Volledige naam",
    address: "Adres",
    postalCode: "Postcode",
    city: "Stad",
    country: "Land",
    phone: "Telefoon",

    loadingShipping: "Bezorgopties laden...",
    noShipping: "Geen bezorgopties beschikbaar voor dit land.",

    needMethod: "Kies een verzendmethode.",
    needRelay: "Kies een afhaalpunt.",
    needEmail: "Vul je e-mailadres in.",

    subtotal: "Subtotaal:",
    shipping: "Verzending:",
    total: "Totaal te betalen:",

    payNow: "Nu betalen 💳",
    redirecting: "Doorsturen…",

    countries: {
      FR: "Frankrijk",
      BE: "België",
      ES: "Spanje",
      DE: "Duitsland",
      IT: "Italië",
      NL: "Nederland",
      PT: "Portugal",
      CH: "Zwitserland",
      AT: "Oostenrijk",
    },
  },
};

export default function CheckoutPage() {
  /* -------------------------------------------------------
     LOCALE & CART
  ------------------------------------------------------- */
  const pathname = usePathname();
  const locale: Locale = getLocaleFromPathname(pathname);
  const T = UI[locale];

  const { items, getTotal } = useCart();

  /* -------------------------------------------------------
     FORM STATE
  ------------------------------------------------------- */
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "FR", // ISO market
    phone: "",
  });

  /* -------------------------------------------------------
     SHIPPING STATE
  ------------------------------------------------------- */
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(
    null
  );
  const [relayPoint, setRelayPoint] = useState<RelayPoint | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);

  /* -------------------------------------------------------
     FIRESTORE SHIPPING METHODS
  ------------------------------------------------------- */
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);

  useEffect(() => {
    const fetchMethods = async () => {
      setLoadingMethods(true);
      setShippingMethod(null);
      setRelayPoint(null);
      setShippingError(null);

      try {
        const ref = collection(db, "shipping_methods");
        const qRef = query(
          ref,
          where("country", "==", form.country),
          where("isActive", "==", true)
        );

        const snap = await getDocs(qRef);

        const list: ShippingMethod[] = snap.docs.map((doc) => {
          const raw = doc.data() as any;

          const name =
            raw.name?.[locale] ||
            raw.name?.en ||
            raw.name?.fr ||
            "Shipping";

          const delay =
            raw.delay?.[locale] ||
            raw.delay?.en ||
            raw.delay?.fr ||
            "";

          const priceRaw =
            raw.price?.[locale] ??
            raw.price?.en ??
            raw.price?.fr ??
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
        setMethods([]);
      } finally {
        setLoadingMethods(false);
      }
    };

    fetchMethods();
  }, [form.country, locale]);

  /* -------------------------------------------------------
     FORM HANDLER
  ------------------------------------------------------- */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* -------------------------------------------------------
     STRIPE CHECKOUT
  ------------------------------------------------------- */
  const [isPaying, setIsPaying] = useState(false);

  const handleCheckout = async () => {
    if (!shippingMethod) {
      setShippingError(T.needMethod);
      return;
    }

    if (shippingMethod.type === "relay" && !relayPoint) {
      setShippingError(T.needRelay);
      return;
    }

    if (!form.email) {
      alert(T.needEmail);
      return;
    }

    setShippingError(null);

    try {
      setIsPaying(true);

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
      if (data.url) window.location.href = data.url;
      else alert("Erreur de redirection Stripe.");
    } catch (err) {
      console.error("Erreur checkout:", err);
      alert("Erreur inattendue.");
    } finally {
      setIsPaying(false);
    }
  };

  /* -------------------------------------------------------
     TOTAL
  ------------------------------------------------------- */
  const shippingPrice = shippingMethod?.price ?? 0;
  const cartTotal = getTotal();
  const total = cartTotal + shippingPrice;

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
  return (
    <main className="checkout-page">
      <h1 className="checkout-title">{T.title}</h1>

      <div className="checkout-card">
        {/* FORMULAIRE */}
        <section className="checkout-section">
          <h2 className="checkout-section-title">{T.addressTitle}</h2>

          <div className="checkout-fields">
            <input
              name="name"
              className="checkout-input"
              placeholder={T.fullName}
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
              placeholder={T.address}
              value={form.address}
              onChange={handleChange}
            />

            <input
              name="postalCode"
              className="checkout-input"
              placeholder={T.postalCode}
              value={form.postalCode}
              onChange={handleChange}
            />

            <input
              name="city"
              className="checkout-input"
              placeholder={T.city}
              value={form.city}
              onChange={handleChange}
            />

            {/* 🌍 COUNTRY SELECT */}
            <select
              name="country"
              className="checkout-input"
              value={form.country}
              onChange={handleChange}
            >
              {Object.entries(T.countries).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>

            <input
              name="phone"
              className="checkout-input"
              placeholder={T.phone}
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* SHIPPING METHODS */}
        <section className="checkout-section">
          {loadingMethods ? (
            <p className="text-sm text-gray-600">{T.loadingShipping}</p>
          ) : methods.length === 0 ? (
            <p className="text-sm text-red-600">{T.noShipping}</p>
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

        {/* TOTAL */}
        <section className="checkout-total">
          <div className="flex justify-between text-sm mb-1">
            <span>{T.subtotal}</span>
            <span>{cartTotal.toFixed(2)} €</span>
          </div>

          <div className="flex justify-between text-sm mb-1">
            <span>
              {T.shipping}
              {shippingMethod ? ` (${shippingMethod.name})` : ""}
            </span>
            <span>{shippingPrice.toFixed(2)} €</span>
          </div>

          <div className="flex justify-between font-semibold mt-2">
            <span>{T.total}</span>
            <span className="checkout-total-amount">{total.toFixed(2)} €</span>
          </div>
        </section>

        {/* SUBMIT BUTTON */}
        <button
          className={`checkout-button ${
            isPaying ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isPaying}
          onClick={handleCheckout}
        >
          {isPaying ? T.redirecting : T.payNow}
        </button>
      </div>
    </main>
  );
}
