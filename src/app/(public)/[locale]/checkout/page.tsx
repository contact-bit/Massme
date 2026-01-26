"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useCart } from "@/context/CartContext";
import ChooseShipping from "@/components/shipping/ChooseShipping";
import type { ShippingMethod, RelayPoint } from "@/components/shipping/types";
import { Locale } from "@/lib/i18n";
import "./checkout.css";

/* =====================================================
   TRANSLATIONS
===================================================== */
const TRANSLATIONS: Record<Locale, any> = {
  fr: {
    title: "Commande",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    address: "Adresse",
    postalCode: "Code postal",
    city: "Ville",
    country: "Pays",
    loadingShipping: "Chargement livraison…",
    subtotalExclTax: "Sous-total HT",
    productVAT: "TVA produits",
    shippingInclTax: "Livraison TTC",
    totalInclTax: "Total TTC",
    payWithStripe: "Payer avec Stripe 💳",
    emptyCart: "Panier vide",
    chooseShipping: "Choisissez une livraison",
    emailRequired: "Email requis",
    nameRequired: "Prénom et nom requis",
    paymentError: "Erreur paiement",
    heardFromQuestion: "Comment avez-vous connu notre produit ?",
    heardFromInternet: "Internet (recherche Google, site, etc.)",
    heardFromSocial: "Réseaux sociaux",
    heardFromMedical: "Recommandation médicale",
    heardFromOther: "Autre",
    heardFromOtherPlaceholder: "Précisez (ex : nom du médecin, nom du média, etc.)",
    heardFromRequired: "Merci d’indiquer comment vous nous avez connus",
    heardFromOtherRequired: "Merci de préciser si vous choisissez « Autre »",
  },
  en: {
    title: "Order",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    address: "Address",
    postalCode: "Postal code",
    city: "City",
    country: "Country",
    loadingShipping: "Loading shipping…",
    subtotalExclTax: "Subtotal excl. tax",
    productVAT: "Product VAT",
    shippingInclTax: "Shipping incl. tax",
    totalInclTax: "Total incl. tax",
    payWithStripe: "Pay with Stripe 💳",
    emptyCart: "Cart is empty",
    chooseShipping: "Choose a shipping method",
    emailRequired: "Email required",
    nameRequired: "First and last name required",
    paymentError: "Payment error",
    heardFromQuestion: "How did you hear about our product?",
    heardFromInternet: "Internet (Google search, website, etc.)",
    heardFromSocial: "Social media",
    heardFromMedical: "Medical recommendation",
    heardFromOther: "Other",
    heardFromOtherPlaceholder: "Please specify (e.g. doctor name, media, etc.)",
    heardFromRequired: "Please tell us how you heard about us",
    heardFromOtherRequired: "Please specify if you select \"Other\"",
  },
  es: {
    title: "Pedido",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Email",
    address: "Dirección",
    postalCode: "Código postal",
    city: "Ciudad",
    country: "País",
    loadingShipping: "Cargando envío…",
    subtotalExclTax: "Subtotal sin IVA",
    productVAT: "IVA productos",
    shippingInclTax: "Envío con IVA",
    totalInclTax: "Total con IVA",
    payWithStripe: "Pagar con Stripe 💳",
    emptyCart: "Carrito vacío",
    chooseShipping: "Elija un método de envío",
    emailRequired: "Email requerido",
    nameRequired: "Nombre y apellido requeridos",
    paymentError: "Error de pago",
    heardFromQuestion: "¿Cómo conociste nuestro producto?",
    heardFromInternet: "Internet (búsqueda en Google, web, etc.)",
    heardFromSocial: "Redes sociales",
    heardFromMedical: "Recomendación médica",
    heardFromOther: "Otro",
    heardFromOtherPlaceholder: "Especifica (por ejemplo, nombre del médico, medio, etc.)",
    heardFromRequired: "Indícanos cómo nos conociste",
    heardFromOtherRequired: "Especifica si eliges « Otro »",
  },
  de: {
    title: "Bestellung",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail",
    address: "Adresse",
    postalCode: "Postleitzahl",
    city: "Stadt",
    country: "Land",
    loadingShipping: "Versand wird geladen…",
    subtotalExclTax: "Zwischensumme ohne MwSt",
    productVAT: "Produkt MwSt",
    shippingInclTax: "Versand inkl. MwSt",
    totalInclTax: "Gesamt inkl. MwSt",
    payWithStripe: "Mit Stripe bezahlen 💳",
    emptyCart: "Warenkorb ist leer",
    chooseShipping: "Wählen Sie eine Versandart",
    emailRequired: "E-Mail erforderlich",
    nameRequired: "Vor- und Nachname erforderlich",
    paymentError: "Zahlungsfehler",
    heardFromQuestion: "Wie haben Sie von unserem Produkt erfahren?",
    heardFromInternet: "Internet (Google-Suche, Website, etc.)",
    heardFromSocial: "Soziale Netzwerke",
    heardFromMedical: "Medizinische Empfehlung",
    heardFromOther: "Andere",
    heardFromOtherPlaceholder: "Bitte genauer angeben (z. B. Name des Arztes, Medium, etc.)",
    heardFromRequired: "Bitte teilen Sie uns mit, wie Sie von uns gehört haben",
    heardFromOtherRequired: "Bitte präzisieren, wenn Sie „Andere“ wählen",
  },
  it: {
    title: "Ordine",
    firstName: "Nome",
    lastName: "Cognome",
    email: "Email",
    address: "Indirizzo",
    postalCode: "Codice postale",
    city: "Città",
    country: "Paese",
    loadingShipping: "Caricamento spedizione…",
    subtotalExclTax: "Subtotale IVA esclusa",
    productVAT: "IVA prodotti",
    shippingInclTax: "Spedizione IVA inclusa",
    totalInclTax: "Totale IVA inclusa",
    payWithStripe: "Paga con Stripe 💳",
    emptyCart: "Carrello vuoto",
    chooseShipping: "Scegli un metodo di spedizione",
    emailRequired: "Email richiesta",
    nameRequired: "Nome e cognome richiesti",
    paymentError: "Errore di pagamento",
    heardFromQuestion: "Come hai conosciuto il nostro prodotto?",
    heardFromInternet: "Internet (ricerca Google, sito, ecc.)",
    heardFromSocial: "Social network",
    heardFromMedical: "Raccomandazione medica",
    heardFromOther: "Altro",
    heardFromOtherPlaceholder: "Specifica (es. nome del medico, media, ecc.)",
    heardFromRequired: "Indica come ci hai conosciuti",
    heardFromOtherRequired: "Specifica se scegli « Altro »",
  },
  nl: {
    title: "Bestelling",
    firstName: "Voornaam",
    lastName: "Achternaam",
    email: "E-mail",
    address: "Adres",
    postalCode: "Postcode",
    city: "Stad",
    country: "Land",
    loadingShipping: "Verzending laden…",
    subtotalExclTax: "Subtotaal excl. BTW",
    productVAT: "Product BTW",
    shippingInclTax: "Verzending incl. BTW",
    totalInclTax: "Totaal incl. BTW",
    payWithStripe: "Betalen met Stripe 💳",
    emptyCart: "Winkelwagen is leeg",
    chooseShipping: "Kies een verzendmethode",
    emailRequired: "E-mail vereist",
    nameRequired: "Voor- en achternaam vereist",
    paymentError: "Betalingsfout",
    heardFromQuestion: "Hoe heb je over ons product gehoord?",
    heardFromInternet: "Internet (Google-zoekopdracht, website, enz.)",
    heardFromSocial: "Sociale media",
    heardFromMedical: "Medische aanbeveling",
    heardFromOther: "Andere",
    heardFromOtherPlaceholder: "Specificeer (bijv. naam arts, medium, enz.)",
    heardFromRequired: "Laat ons weten hoe je ons gevonden hebt",
    heardFromOtherRequired: "Specificeer als je \"Andere\" kiest",
  },
};

/* =====================================================
   HELPERS
===================================================== */
const LOCALES = ["fr", "en", "es", "de", "it", "nl"] as const;

function getLocale(path: string | null): Locale {
  const l = path?.split("/")?.[1];
  return LOCALES.includes(l as Locale) ? (l as Locale) : "fr";
}

const LOCALE_TO_COUNTRY: Record<Locale, string> = {
  fr: "FR",
  en: "GB",
  es: "ES",
  de: "DE",
  it: "IT",
  nl: "NL",
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/* =====================================================
   CART SUMMARY (EN HAUT DE LA PAGE)
===================================================== */
function CartSummaryInline() {
  const {
    items,
    totalHT,
    totalVAT,
    totalTTC,
    updateQuantity,
    removeItem,
  } = useCart();

  if (!items.length) {
    return (
      <section className="checkout-section">
        <p>Votre panier est vide.</p>
      </section>
    );
  }

  return (
    <section className="checkout-section checkout-cart">
      <div className="checkout-cart-header">
        <h2 className="checkout-cart-title">Votre panier</h2>
        <span className="checkout-cart-count">
          {items.length} article{items.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="checkout-cart-list">
        {items.map((item, index) => (
          <div key={`${item.id}-${index}`} className="checkout-cart-item">
            <div className="checkout-cart-thumb-wrap">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="checkout-cart-thumb"
                />
              ) : (
                <div className="checkout-cart-thumb placeholder" />
              )}
            </div>

            <div className="checkout-cart-main">
              <p className="checkout-cart-name">{item.name}</p>
              <p className="checkout-cart-unit">
                {item.priceHT.toFixed(2)} € HT / unité
              </p>

              <div className="checkout-cart-bottom">
                <div className="checkout-cart-qty">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="checkout-cart-remove"
                  onClick={() => removeItem(item.id)}
                >
                  Retirer
                </button>
              </div>
            </div>

            <div className="checkout-cart-line-total">
              {(item.priceHT * item.quantity).toFixed(2)} €
            </div>
          </div>
        ))}
      </div>

      <div className="checkout-cart-summary">
        <div className="checkout-cart-summary-row">
          <span>Total HT</span>
          <span>{totalHT.toFixed(2)} €</span>
        </div>
        {totalVAT > 0 && (
          <div className="checkout-cart-summary-row">
            <span>TVA</span>
            <span>{totalVAT.toFixed(2)} €</span>
          </div>
        )}
        <div className="checkout-cart-summary-row total">
          <span>Total TTC produits</span>
          <span>{totalTTC.toFixed(2)} €</span>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   PAGE
===================================================== */
export default function CheckoutPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = TRANSLATIONS[locale];

  const { items, totalHT, totalVAT, totalTTC, clearCart } = useCart();

  /* ---------- CUSTOMER ---------- */
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    postalCode: "",
    city: "",
    country: "FR",
  });

  /* ---------- HOW DID YOU HEAR ABOUT US ---------- */
  const [heardFrom, setHeardFrom] = useState<
    "internet" | "social" | "medical" | "other" | ""
  >("");
  const [heardFromOther, setHeardFromOther] = useState("");

  /* ---------- FORCE COUNTRY FROM LOCALE ---------- */
  useEffect(() => {
    const country = LOCALE_TO_COUNTRY[locale] ?? "FR";
    setCustomer((prev) => ({ ...prev, country }));
  }, [locale]);

  /* ---------- SHIPPING ---------- */
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod | null>(null);
  const [relayPoint, setRelayPoint] = useState<RelayPoint | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------- LOAD SHIPPING ---------- */
  useEffect(() => {
    async function load() {
      setLoading(true);
      setShippingMethod(null);
      setRelayPoint(null);

      const qRef = query(
        collection(db, "shipping_methods"),
        where("country", "==", customer.country),
        where("isActive", "==", true)
      );

      const snap = await getDocs(qRef);

      const list: ShippingMethod[] = snap.docs.map((doc) => {
        const raw = doc.data() as any;

        const priceHT = Number(raw.priceHT ?? 0);
        const vatRate =
          typeof raw.vatRate === "number" && raw.vatRate > 0
            ? raw.vatRate
            : 0;

        const priceTTC =
          vatRate > 0 ? round2(priceHT * (1 + vatRate / 100)) : priceHT;

        return {
          id: doc.id,
          name: raw.name?.[locale] || raw.name?.fr || "",
          delay: raw.delay?.[locale] || raw.delay?.fr || "",
          priceHT,
          vatRate,
          priceTTC,
          type: raw.type || "home",
          relayProvider: raw.relayProvider || null,
          isActive: true,
        };
      });

      setMethods(list);
      setLoading(false);
    }

    load();
  }, [customer.country, locale]);

  /* ---------- TOTALS ---------- */
  const shippingTTC = shippingMethod?.priceTTC ?? 0;
  const finalTTC = totalTTC + shippingTTC;

  /* ---------- PAY ---------- */
  async function pay() {
    if (!items.length) return alert(t.emptyCart);
    if (!shippingMethod) return alert(t.chooseShipping);
    if (!customer.email) return alert(t.emailRequired);
    if (!customer.firstName || !customer.lastName)
      return alert(t.nameRequired);
    if (!heardFrom) return alert(t.heardFromRequired);
    if (heardFrom === "other" && !heardFromOther.trim())
      return alert(t.heardFromOtherRequired);

    const fullName = `${customer.firstName.trim()} ${customer.lastName.trim()}`;

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        locale,
        customerEmail: customer.email,
        heardFrom,
        heardFromOther: heardFrom === "other" ? heardFromOther.trim() : null,
        shippingAddress: {
          name: fullName,
          firstName: customer.firstName,
          lastName: customer.lastName,
          address: customer.address,
          postalCode: customer.postalCode,
          city: customer.city,
          country: customer.country,
        },
        shippingMethod,
        relayPoint,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.url) return alert(t.paymentError);

    clearCart();
    window.location.href = json.url;
  }

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <main className="checkout">
      <h1 className="checkout-title">{t.title}</h1>

      {/* VOTRE PANIER AU-DESSUS DES INFOS DE LIVRAISON */}
      <CartSummaryInline />

      {/* CLIENT */}
      <section className="checkout-section">
        <div className="checkout-grid-2">
          <input
            className="checkout-input"
            placeholder={t.firstName}
            value={customer.firstName}
            onChange={(e) =>
              setCustomer({ ...customer, firstName: e.target.value })
            }
          />
          <input
            className="checkout-input"
            placeholder={t.lastName}
            value={customer.lastName}
            onChange={(e) =>
              setCustomer({ ...customer, lastName: e.target.value })
            }
          />
        </div>

        <input
          className="checkout-input"
          type="email"
          placeholder={t.email}
          value={customer.email}
          onChange={(e) =>
            setCustomer({ ...customer, email: e.target.value })
          }
        />

        <input
          className="checkout-input"
          placeholder={t.address}
          value={customer.address}
          onChange={(e) =>
            setCustomer({ ...customer, address: e.target.value })
          }
        />

        <div className="checkout-grid-2">
          <input
            className="checkout-input"
            placeholder={t.postalCode}
            value={customer.postalCode}
            onChange={(e) =>
              setCustomer({ ...customer, postalCode: e.target.value })
            }
          />
          <input
            className="checkout-input"
            placeholder={t.city}
            value={customer.city}
            onChange={(e) =>
              setCustomer({ ...customer, city: e.target.value })
            }
          />
        </div>
      </section>

      {/* HOW DID YOU HEAR ABOUT US */}
      <section className="checkout-section">
        <h2 className="checkout-subtitle">{t.heardFromQuestion}</h2>

        <div className="checkout-radio-group">
          <label className="checkout-radio-item">
            <input
              type="radio"
              name="heardFrom"
              value="internet"
              checked={heardFrom === "internet"}
              onChange={() => setHeardFrom("internet")}
            />
            <span>{t.heardFromInternet}</span>
          </label>

          <label className="checkout-radio-item">
            <input
              type="radio"
              name="heardFrom"
              value="social"
              checked={heardFrom === "social"}
              onChange={() => setHeardFrom("social")}
            />
            <span>{t.heardFromSocial}</span>
          </label>

          <label className="checkout-radio-item">
            <input
              type="radio"
              name="heardFrom"
              value="medical"
              checked={heardFrom === "medical"}
              onChange={() => setHeardFrom("medical")}
            />
            <span>{t.heardFromMedical}</span>
          </label>

          <label className="checkout-radio-item">
            <input
              type="radio"
              name="heardFrom"
              value="other"
              checked={heardFrom === "other"}
              onChange={() => setHeardFrom("other")}
            />
            <span>{t.heardFromOther}</span>
          </label>
        </div>

        {heardFrom === "other" && (
          <div className="checkout-heardfrom-other">
            <input
              className="checkout-input"
              placeholder={t.heardFromOtherPlaceholder}
              value={heardFromOther}
              onChange={(e) => setHeardFromOther(e.target.value)}
            />
          </div>
        )}
      </section>

      {/* SHIPPING */}
      {loading ? (
        <p className="checkout-loading">{t.loadingShipping}</p>
      ) : (
        <ChooseShipping
          methods={methods}
          locale={locale}
          onMethodSelect={setShippingMethod}
          onRelaySelect={setRelayPoint}
        />
      )}

      {/* TOTALS */}
      <section className="checkout-totals">
        <div className="checkout-row">
          <span>{t.subtotalExclTax}</span>
          <span>{totalHT.toFixed(2)} €</span>
        </div>

        {totalVAT > 0 && (
          <div className="checkout-row">
            <span>{t.productVAT}</span>
            <span>{totalVAT.toFixed(2)} €</span>
          </div>
        )}

        <div className="checkout-row">
          <span>{t.shippingInclTax}</span>
          <span>{shippingTTC.toFixed(2)} €</span>
        </div>

        <div className="checkout-row checkout-total">
          <span>{t.totalInclTax}</span>
          <span>{finalTTC.toFixed(2)} €</span>
        </div>
      </section>

      <button onClick={pay} className="checkout-pay">
        {t.payWithStripe}
      </button>
    </main>
  );
}
