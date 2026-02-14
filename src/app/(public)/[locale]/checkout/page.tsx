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
   CONSTANTES
===================================================== */

// id Firestore de ton produit OculaRest / Vitrectromed
const OCULAREST_ID = "3tuSUenbUVVF6cuSHwS9";

const LOCALES = ["fr", "en", "es", "de", "it", "nl"] as const;

const LOCALE_TO_COUNTRY: Record<Locale, string> = {
  fr: "FR",
  en: "GB",
  es: "ES",
  de: "DE",
  it: "IT",
  nl: "NL",
};

function getLocale(path: string | null): Locale {
  const l = path?.split("/")?.[1];
  return LOCALES.includes(l as Locale) ? (l as Locale) : "fr";
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/* =====================================================
   TRADUCTIONS
===================================================== */

const TRANSLATIONS: Record<Locale, any> = {
  fr: {
    title: "Commande",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    phone: "Téléphone",
    phoneHelp:
      "Utilisé uniquement pour le suivi de livraison ou un problème avec votre commande.",
    billingAddress: "Adresse de facturation",
    shippingAddress: "Adresse de livraison",
    address: "Adresse",
    postalCode: "Code postal",
    city: "Ville",
    country: "Pays",
    sameAsBilling: "Livrer à la même adresse que la facturation",
    loadingShipping: "Chargement livraison…",
    subtotalExclTax: "Sous-total HT",
    productVAT: "TVA produits",
    shippingInclTax: "Livraison TTC",
    shippingVAT: "TVA livraison",
    totalInclTax: "Total TTC",
    payWithStripe: "Payer avec Stripe 💳",
    emptyCart: "Panier vide",
    chooseShipping: "Choisissez une livraison",
    emailRequired: "Email requis",
    nameRequired: "Prénom et nom requis",
    phoneRequired: "Numéro de téléphone requis",
    paymentError: "Erreur paiement",
    heardFromQuestion: "Comment avez-vous connu notre produit ?",
    heardFromInternet: "Internet (recherche Google, site, etc.)",
    heardFromSocial: "Réseaux sociaux",
    heardFromMedical: "Recommandation médicale",
    heardFromOther: "Autre",
    heardFromOtherPlaceholder:
      "Précisez (ex : nom du médecin, nom du média, etc.)",
    heardFromRequired: "Merci d’indiquer comment vous nous avez connus",
    heardFromOtherRequired:
      'Merci de préciser si vous choisissez « Autre »',
  },
  en: {
    title: "Order",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone number",
    phoneHelp: "Used only for delivery updates or issues with your order.",
    billingAddress: "Billing address",
    shippingAddress: "Shipping address",
    address: "Address",
    postalCode: "Postal code",
    city: "City",
    country: "Country",
    sameAsBilling: "Ship to the same address as billing",
    loadingShipping: "Loading shipping…",
    subtotalExclTax: "Subtotal excl. tax",
    productVAT: "Product VAT",
    shippingInclTax: "Shipping incl. tax",
    shippingVAT: "Shipping VAT",
    totalInclTax: "Total incl. tax",
    payWithStripe: "Pay with Stripe 💳",
    emptyCart: "Cart is empty",
    chooseShipping: "Choose a shipping method",
    emailRequired: "Email required",
    nameRequired: "First and last name required",
    phoneRequired: "Phone number required",
    paymentError: "Payment error",
    heardFromQuestion: "How did you hear about our product?",
    heardFromInternet: "Internet (Google search, website, etc.)",
    heardFromSocial: "Social media",
    heardFromMedical: "Medical recommendation",
    heardFromOther: "Other",
    heardFromOtherPlaceholder:
      "Please specify (e.g. doctor name, media, etc.)",
    heardFromRequired: "Please tell us how you heard about us",
    heardFromOtherRequired:
      'Please specify if you select "Other"',
  },
  es: {
    title: "Pedido",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Email",
    phone: "Teléfono",
    phoneHelp:
      "Solo se utilizará para el seguimiento del envío o incidencias del pedido.",
    billingAddress: "Dirección de facturación",
    shippingAddress: "Dirección de envío",
    address: "Dirección",
    postalCode: "Código postal",
    city: "Ciudad",
    country: "País",
    sameAsBilling: "Enviar a la misma dirección de facturación",
    loadingShipping: "Cargando envío…",
    subtotalExclTax: "Subtotal sin IVA",
    productVAT: "IVA productos",
    shippingInclTax: "Envío con IVA",
    shippingVAT: "IVA envío",
    totalInclTax: "Total con IVA",
    payWithStripe: "Pagar con Stripe 💳",
    emptyCart: "Carrito vacío",
    chooseShipping: "Elija un método de envío",
    emailRequired: "Email requerido",
    nameRequired: "Nombre y apellido requeridos",
    phoneRequired: "Número de teléfono requerido",
    paymentError: "Error de pago",
    heardFromQuestion: "¿Cómo conociste nuestro producto?",
    heardFromInternet: "Internet (búsqueda en Google, web, etc.)",
    heardFromSocial: "Redes sociales",
    heardFromMedical: "Recomendación médica",
    heardFromOther: "Otro",
    heardFromOtherPlaceholder:
      "Especifica (por ejemplo, nombre del médico, medio, etc.)",
    heardFromRequired: "Indícanos cómo nos conociste",
    heardFromOtherRequired:
      "Especifica si eliges « Otro »",
  },
  de: {
    title: "Bestellung",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail",
    phone: "Telefonnummer",
    phoneHelp:
      "Wird nur für Lieferbenachrichtigungen oder Rückfragen zu Ihrer Bestellung verwendet.",
    billingAddress: "Rechnungsadresse",
    shippingAddress: "Lieferadresse",
    address: "Adresse",
    postalCode: "Postleitzahl",
    city: "Stadt",
    country: "Land",
    sameAsBilling:
      "An dieselbe Adresse wie die Rechnungsadresse liefern",
    loadingShipping: "Versand wird geladen…",
    subtotalExclTax: "Zwischensumme ohne MwSt",
    productVAT: "Produkt MwSt",
    shippingInclTax: "Versand inkl. MwSt",
    shippingVAT: "Versand MwSt",
    totalInclTax: "Gesamt inkl. MwSt",
    payWithStripe: "Mit Stripe bezahlen 💳",
    emptyCart: "Warenkorb ist leer",
    chooseShipping: "Wählen Sie eine Versandart",
    emailRequired: "E-Mail erforderlich",
    nameRequired: "Vor- und Nachname erforderlich",
    phoneRequired: "Telefonnummer erforderlich",
    paymentError: "Zahlungsfehler",
    heardFromQuestion:
      "Wie haben Sie von unserem Produkt erfahren?",
    heardFromInternet:
      "Internet (Google-Suche, Website, etc.)",
    heardFromSocial: "Soziale Netzwerke",
    heardFromMedical: "Medizinische Empfehlung",
    heardFromOther: "Andere",
    heardFromOtherPlaceholder:
      "Bitte genauer angeben (z.B. Name des Arztes, Medium, etc.)",
    heardFromRequired:
      "Bitte teilen Sie uns mit, wie Sie von uns gehört haben",
    heardFromOtherRequired:
      'Bitte präzisieren, wenn Sie "Andere" wählen',
  },
  it: {
    title: "Ordine",
    firstName: "Nome",
    lastName: "Cognome",
    email: "Email",
    phone: "Telefono",
    phoneHelp:
      "Utilizzato solo per aggiornamenti sulla consegna o problemi con l’ordine.",
    billingAddress: "Indirizzo di fatturazione",
    shippingAddress: "Indirizzo di spedizione",
    address: "Indirizzo",
    postalCode: "Codice postale",
    city: "Città",
    country: "Paese",
    sameAsBilling:
      "Spedire allo stesso indirizzo di fatturazione",
    loadingShipping: "Caricamento spedizione…",
    subtotalExclTax: "Subtotale IVA esclusa",
    productVAT: "IVA prodotti",
    shippingInclTax: "Spedizione IVA inclusa",
    shippingVAT: "IVA spedizione",
    totalInclTax: "Totale IVA inclusa",
    payWithStripe: "Paga con Stripe 💳",
    emptyCart: "Carrello vuoto",
    chooseShipping: "Scegli un metodo di spedizione",
    emailRequired: "Email richiesta",
    nameRequired: "Nome e cognome richiesti",
    phoneRequired: "Numero di telefono richiesto",
    paymentError: "Errore di pagamento",
    heardFromQuestion:
      "Come hai conosciuto il nostro prodotto?",
    heardFromInternet:
      "Internet (ricerca Google, sito, ecc.)",
    heardFromSocial: "Social network",
    heardFromMedical: "Raccomandazione medica",
    heardFromOther: "Altro",
    heardFromOtherPlaceholder:
      "Specifica (es. nome del medico, media, ecc.)",
    heardFromRequired: "Indica come ci hai conosciuti",
    heardFromOtherRequired:
      "Specifica se scegli « Altro »",
  },
  nl: {
    title: "Bestelling",
    firstName: "Voornaam",
    lastName: "Achternaam",
    email: "E-mail",
    phone: "Telefoonnummer",
    phoneHelp:
      "Wordt alleen gebruikt voor bezorgupdates of vragen over je bestelling.",
    billingAddress: "Factuuradres",
    shippingAddress: "Leveringsadres",
    address: "Adres",
    postalCode: "Postcode",
    city: "Stad",
    country: "Land",
    sameAsBilling:
      "Lever op hetzelfde adres als de factuur",
    loadingShipping: "Verzending laden…",
    subtotalExclTax: "Subtotaal excl. BTW",
    productVAT: "Product BTW",
    shippingInclTax: "Verzending incl. BTW",
    shippingVAT: "Verzending BTW",
    totalInclTax: "Totaal incl. BTW",
    payWithStripe: "Betalen met Stripe 💳",
    emptyCart: "Winkelwagen is leeg",
    chooseShipping: "Kies een verzendmethode",
    emailRequired: "E-mail vereist",
    nameRequired: "Voor- en achternaam vereist",
    phoneRequired: "Telefoonnummer vereist",
    paymentError: "Betalingsfout",
    heardFromQuestion:
      "Hoe heb je over ons product gehoord?",
    heardFromInternet:
      "Internet (Google-zoekopdracht, website, enz.)",
    heardFromSocial: "Sociale media",
    heardFromMedical: "Medische aanbeveling",
    heardFromOther: "Andere",
    heardFromOtherPlaceholder:
      "Specificeer (bijv. naam arts, medium, enz.)",
    heardFromRequired:
      "Laat ons weten hoe je ons gevonden hebt",
    heardFromOtherRequired:
      'Specificeer als je "Andere" kiest',
  },
};

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
        {items.map((item, index) => {
          const isOcularest = item.id === OCULAREST_ID;
          const isMaxForOcularest = isOcularest && item.quantity >= 2;

          return (
            <div
              key={`${item.id}-${index}`}
              className="checkout-cart-item"
            >
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
                      disabled={isMaxForOcularest}
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
          );
        })}
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
   PAGE CHECKOUT
===================================================== */

export default function CheckoutPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = TRANSLATIONS[locale];

  const { items, totalHT, totalVAT, totalTTC, clearCart } = useCart();

  /* ---------- BILLING CUSTOMER ---------- */
  const [billingCustomer, setBillingCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    country: "FR",
  });

  /* ---------- SHIPPING CUSTOMER ---------- */
  const [shippingCustomer, setShippingCustomer] = useState({
    address: "",
    postalCode: "",
    city: "",
    country: "FR",
  });

  /* ---------- SAME ADDRESS ---------- */
  const [sameAsBilling, setSameAsBilling] = useState(true);

  /* ---------- HOW DID YOU HEAR ABOUT US ---------- */
  const [heardFrom, setHeardFrom] = useState<
    "internet" | "social" | "medical" | "other" | ""
  >("");
  const [heardFromOther, setHeardFromOther] = useState("");

  /* ---------- FORCE COUNTRY FROM LOCALE ---------- */
  useEffect(() => {
    const country = LOCALE_TO_COUNTRY[locale] ?? "FR";
    setBillingCustomer((prev) => ({ ...prev, country }));
    setShippingCustomer((prev) => ({ ...prev, country }));
  }, [locale]);

  /* ---------- SYNC SHIPPING WITH BILLING ---------- */
  useEffect(() => {
    if (sameAsBilling) {
      setShippingCustomer({
        address: billingCustomer.address,
        postalCode: billingCustomer.postalCode,
        city: billingCustomer.city,
        country: billingCustomer.country,
      });
    }
  }, [sameAsBilling, billingCustomer]);

  /* ---------- SHIPPING ---------- */
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod | null>(null);
  const [relayPoint, setRelayPoint] = useState<RelayPoint | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  /* ---------- LOAD SHIPPING ---------- */
  useEffect(() => {
    async function load() {
      setLoading(true);
      setShippingMethod(null);
      setRelayPoint(null);

      const qRef = query(
        collection(db, "shipping_methods"),
        where("country", "==", shippingCustomer.country),
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
          sortOrder:
            raw.sortOrder === null || raw.sortOrder === undefined
              ? null
              : Number(raw.sortOrder),
        };
      });

      setMethods(list);
      setLoading(false);
    }

    load();
  }, [shippingCustomer.country, locale]);

  /* ---------- TOTALS ---------- */
  const shippingTTC = shippingMethod?.priceTTC ?? 0;

  const shippingVAT =
    shippingMethod?.priceHT != null &&
    shippingMethod?.vatRate != null &&
    shippingMethod.vatRate > 0
      ? round2(
          shippingMethod.priceHT * (shippingMethod.vatRate / 100)
        )
      : 0;

  const finalTTC = totalTTC + shippingTTC;

  /* ---------- PAY ---------- */
  async function pay() {
    if (!items.length) return alert(t.emptyCart);
    if (!shippingMethod) return alert(t.chooseShipping);
    if (!billingCustomer.email) return alert(t.emailRequired);
    if (!billingCustomer.firstName || !billingCustomer.lastName)
      return alert(t.nameRequired);
    if (!billingCustomer.phone.trim())
      return alert(t.phoneRequired);
    if (!heardFrom) return alert(t.heardFromRequired);
    if (heardFrom === "other" && !heardFromOther.trim())
      return alert(t.heardFromOtherRequired);

    const fullName = `${billingCustomer.firstName.trim()} ${billingCustomer.lastName.trim()}`;

    // clamp final : max 2 pour le produit Firestore 3tuSUenbUVVF6cuSHwS9
    const safeItems = items.map((item) => {
      if (item.id === OCULAREST_ID) {
        const safeQty = Math.min(item.quantity, 2);
        return { ...item, quantity: safeQty };
      }
      return item;
    });

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: safeItems,
        locale,
        customerEmail: billingCustomer.email,
        customerPhone: billingCustomer.phone.trim(),
        heardFrom,
        heardFromOther:
          heardFrom === "other" ? heardFromOther.trim() : null,
        billingAddress: {
          name: fullName,
          firstName: billingCustomer.firstName,
          lastName: billingCustomer.lastName,
          phone: billingCustomer.phone.trim(),
          address: billingCustomer.address,
          postalCode: billingCustomer.postalCode,
          city: billingCustomer.city,
          country: billingCustomer.country,
        },
        shippingAddress: {
          name: fullName,
          firstName: billingCustomer.firstName,
          lastName: billingCustomer.lastName,
          phone: billingCustomer.phone.trim(),
          address: shippingCustomer.address,
          postalCode: shippingCustomer.postalCode,
          city: shippingCustomer.city,
          country: shippingCustomer.country,
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

      {/* 1 : PANIER */}
      <CartSummaryInline />

      {/* 2 : CHOIX LIVRAISON SOUS LE PANIER */}
      {loading ? (
        <section className="checkout-section">
          <p className="checkout-loading">{t.loadingShipping}</p>
        </section>
      ) : (
        <section className="checkout-section checkout-section-shipping">
          <ChooseShipping
            methods={methods}
            locale={locale}
            onMethodSelect={setShippingMethod}
            onRelaySelect={setRelayPoint}
          />
        </section>
      )}

      {/* 3 : CLIENT - FACTURATION */}
      <section className="checkout-section">
        <h2 className="checkout-subtitle">{t.billingAddress}</h2>
        <div className="checkout-grid-2">
          <input
            className="checkout-input"
            placeholder={t.firstName}
            value={billingCustomer.firstName}
            onChange={(e) =>
              setBillingCustomer({
                ...billingCustomer,
                firstName: e.target.value,
              })
            }
          />
          <input
            className="checkout-input"
            placeholder={t.lastName}
            value={billingCustomer.lastName}
            onChange={(e) =>
              setBillingCustomer({
                ...billingCustomer,
                lastName: e.target.value,
              })
            }
          />
        </div>

        <input
          className="checkout-input"
          type="email"
          placeholder={t.email}
          value={billingCustomer.email}
          onChange={(e) =>
            setBillingCustomer({
              ...billingCustomer,
              email: e.target.value,
            })
          }
        />

        <div className="checkout-phone-wrapper">
          <input
            className="checkout-input"
            type="tel"
            placeholder={t.phone}
            value={billingCustomer.phone}
            onChange={(e) =>
              setBillingCustomer({
                ...billingCustomer,
                phone: e.target.value,
              })
            }
          />
          <p className="checkout-help-text">{t.phoneHelp}</p>
        </div>

        <input
          className="checkout-input"
          placeholder={t.address}
          value={billingCustomer.address}
          onChange={(e) =>
            setBillingCustomer({
              ...billingCustomer,
              address: e.target.value,
            })
          }
        />

        <div className="checkout-grid-2">
          <input
            className="checkout-input"
            placeholder={t.postalCode}
            value={billingCustomer.postalCode}
            onChange={(e) =>
              setBillingCustomer({
                ...billingCustomer,
                postalCode: e.target.value,
              })
            }
          />
          <input
            className="checkout-input"
            placeholder={t.city}
            value={billingCustomer.city}
            onChange={(e) =>
              setBillingCustomer({
                ...billingCustomer,
                city: e.target.value,
              })
            }
          />
        </div>
      </section>

      {/* ADRESSE LIVRAISON */}
      <section className="checkout-section">
        <label className="checkout-checkbox">
          <input
            type="checkbox"
            checked={sameAsBilling}
            onChange={(e) => setSameAsBilling(e.target.checked)}
          />
          <span>{t.sameAsBilling}</span>
        </label>

        {!sameAsBilling && (
          <>
            <h2 className="checkout-subtitle">
              {t.shippingAddress}
            </h2>
            <input
              className="checkout-input"
              placeholder={t.address}
              value={shippingCustomer.address}
              onChange={(e) =>
                setShippingCustomer({
                  ...shippingCustomer,
                  address: e.target.value,
                })
              }
            />

            <div className="checkout-grid-2">
              <input
                className="checkout-input"
                placeholder={t.postalCode}
                value={shippingCustomer.postalCode}
                onChange={(e) =>
                  setShippingCustomer({
                    ...shippingCustomer,
                    postalCode: e.target.value,
                  })
                }
              />
              <input
                className="checkout-input"
                placeholder={t.city}
                value={shippingCustomer.city}
                onChange={(e) =>
                  setShippingCustomer({
                    ...shippingCustomer,
                    city: e.target.value,
                  })
                }
              />
            </div>
          </>
        )}
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

          <div className="checkout-shipping-amount">
            <span>{shippingTTC.toFixed(2)} €</span>
            <span className="checkout-shipping-vat">
              TVA : {shippingMethod?.vatRate ?? 0} %
            </span>
          </div>
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
