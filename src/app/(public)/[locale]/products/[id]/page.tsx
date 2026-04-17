"use client";

import "./product-detail.css";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { MARKET_BY_LOCALE, Locale, Market } from "@/lib/market";

/* =====================================================
   TYPES
===================================================== */

type RawVAT = {
  enabled?: boolean;
  rate?: number;
};

type Product = {
  id: string;
  name: Partial<Record<Locale, string>>;
  description?: Partial<Record<Locale, string>>;
  imageUrl?: string;
  isActive?: boolean;

  markets?: string[];
  pricesByMarket?: Record<string, number>;
  vatByMarket?: Record<string, RawVAT>;
};

/* =====================================================
   TRANSLATIONS
===================================================== */

const TRANSLATIONS: Record<
  Locale,
  {
    loading: string;
    notFound: string;
    priceExclTax: string;
    vat: string;
    priceInclTax: string;
    addToCart: string;
  }
> = {
  fr: {
    loading: "Chargement…",
    notFound: "Produit introuvable.",
    priceExclTax: "Prix HT",
    vat: "TVA",
    priceInclTax: "Prix TTC",
    addToCart: "Ajouter au panier 🛒",
  },
  en: {
    loading: "Loading…",
    notFound: "Product not found.",
    priceExclTax: "Price excl. tax",
    vat: "VAT",
    priceInclTax: "Price incl. tax",
    addToCart: "Add to cart 🛒",
  },
  es: {
    loading: "Cargando…",
    notFound: "Producto no encontrado.",
    priceExclTax: "Precio sin IVA",
    vat: "IVA",
    priceInclTax: "Precio con IVA",
    addToCart: "Añadir al carrito 🛒",
  },
  de: {
    loading: "Wird geladen…",
    notFound: "Produkt nicht gefunden.",
    priceExclTax: "Preis ohne MwSt",
    vat: "MwSt",
    priceInclTax: "Preis inkl. MwSt",
    addToCart: "In den Warenkorb 🛒",
  },
  it: {
    loading: "Caricamento…",
    notFound: "Prodotto non trovato.",
    priceExclTax: "Prezzo IVA esclusa",
    vat: "IVA",
    priceInclTax: "Prezzo IVA inclusa",
    addToCart: "Aggiungi al carrello 🛒",
  },
  nl: {
    loading: "Laden…",
    notFound: "Product niet gevonden.",
    priceExclTax: "Prijs excl. BTW",
    vat: "BTW",
    priceInclTax: "Prijs incl. BTW",
    addToCart: "Toevoegen aan winkelwagen 🛒",
  },
  pt: {
    loading: "A carregar…",
    notFound: "Produto não encontrado.",
    priceExclTax: "Preço sem IVA",
    vat: "IVA",
    priceInclTax: "Preço com IVA",
    addToCart: "Adicionar ao carrinho 🛒",
  },
};

/* =====================================================
   HELPERS
===================================================== */

function pickLocaleValue(
  obj: Partial<Record<Locale, string>> | undefined,
  locale: Locale
) {
  return obj?.[locale] || obj?.fr || "";
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function normalizeMarketKey(key: string): Market | null {
  const k = key.trim().toUpperCase();
  const allowed: Market[] = ["FR", "IT", "DE", "ES", "NL", "PT", "BE", "CH"];
  return allowed.includes(k as Market) ? (k as Market) : null;
}

function getVATForMarket(
  vatByMarket: Record<string, RawVAT> | undefined,
  market: Market
): { enabled: boolean; rate: number } {
  if (!vatByMarket) return { enabled: false, rate: 0 };

  for (const [key, value] of Object.entries(vatByMarket)) {
    const normalized = normalizeMarketKey(key);
    if (normalized === market) {
      const enabled = value?.enabled === true;
      const rate =
        typeof value?.rate === "number" && value.rate > 0 ? value.rate : 0;

      return {
        enabled: enabled && rate > 0,
        rate,
      };
    }
  }

  return { enabled: false, rate: 0 };
}

function getPriceForMarket(
  pricesByMarket: Record<string, number> | undefined,
  market: Market
): number {
  if (!pricesByMarket) return 0;

  for (const [key, value] of Object.entries(pricesByMarket)) {
    const normalized = normalizeMarketKey(key);
    if (normalized === market && typeof value === "number") {
      return value;
    }
  }

  return 0;
}

/* =====================================================
   PAGE
===================================================== */

export default function ProductPage() {
  const params = useParams() as {
    locale?: Locale;
    id?: string;
  };

  const locale: Locale = params.locale ?? "fr";
  const productId = params.id;

  const market: Market = MARKET_BY_LOCALE[locale];
  const t = TRANSLATIONS[locale];

  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    if (!productId) return;

    getDoc(doc(db, "products", productId)).then((snap) => {
      if (snap.exists()) {
        setProduct({
          id: snap.id,
          ...(snap.data() as any),
        });
      }
      setLoading(false);
    });
  }, [productId]);

  if (loading) {
    return (
      <main className="product-detail-page">
        <p className="product-detail-loading">{t.loading}</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-detail-page">
        <p className="product-detail-loading">{t.notFound}</p>
      </main>
    );
  }

  /* ---------------- DATA ---------------- */
  const name = pickLocaleValue(product.name, locale);
  const desc = pickLocaleValue(product.description, locale);

  const priceHT = getPriceForMarket(product.pricesByMarket, market);
  const vat = getVATForMarket(product.vatByMarket, market);

  const vatAmount = vat.enabled ? round2((priceHT * vat.rate) / 100) : 0;
  const priceTTC = round2(priceHT + vatAmount);

  /* ---------------- ADD TO CART ---------------- */
  const addToCart = () => {
    addItem({
      id: product.id,
      name,
      priceHT,
      quantity: 1,
      imageUrl: product.imageUrl,
      description: desc,
      vat: {
        enabled: vat.enabled,
        rate: vat.rate,
      },
    });
  };

  /* ---------------- RENDER ---------------- */
  return (
    <main className="product-detail-page">
      <div className="product-detail-container">
        <section className="product-detail-grid">
          {/* IMAGE */}
          <div className="product-detail-image-wrapper">
            <Image
              src={product.imageUrl || "/placeholder.jpg"}
              alt={name}
              fill
              className="product-detail-image"
            />
          </div>

          {/* CONTENU */}
          <div className="product-detail-content">
            <p className="product-detail-eyebrow">
              VitrectoMed · Vitrectomy support
            </p>
            <h1 className="product-detail-title">{name}</h1>

            {desc && (
              <p className="product-detail-description">{desc}</p>
            )}

            <div className="product-detail-price-row">
              <p>
                {t.priceExclTax} : <strong>{priceHT.toFixed(2)} €</strong>
              </p>

              {vat.enabled && (
                <>
                  <p>
                    {t.vat} ({vat.rate}%) :{" "}
                    <strong>{vatAmount.toFixed(2)} €</strong>
                  </p>

                  <p className="product-detail-price-ttc">
                    {t.priceInclTax} : {priceTTC.toFixed(2)} €
                  </p>
                </>
              )}
            </div>

            <div className="product-detail-actions">
              <button className="btn-primary" onClick={addToCart}>
                {t.addToCart}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
