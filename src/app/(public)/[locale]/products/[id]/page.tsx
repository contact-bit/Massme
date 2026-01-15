"use client";

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

/**
 * 🔒 NORMALISE LES CLÉS MARCHÉ
 * - "it", "IT ", "Italie" → "IT"
 */
function normalizeMarketKey(key: string): Market | null {
  const k = key.trim().toUpperCase();
  const allowed: Market[] = [
    "FR",
    "IT",
    "DE",
    "ES",
    "NL",
    "PT",
    "BE",
    "CH",
  ];
  return allowed.includes(k as Market) ? (k as Market) : null;
}

/**
 * 🔒 LECTURE TVA SAFE
 */
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
        typeof value?.rate === "number" && value.rate > 0
          ? value.rate
          : 0;

      return {
        enabled: enabled && rate > 0,
        rate,
      };
    }
  }

  return { enabled: false, rate: 0 };
}

/**
 * 🔒 LECTURE PRIX SAFE
 */
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
    return <p className="py-10 text-center">Chargement…</p>;
  }

  if (!product) {
    return <p className="py-10 text-center">Produit introuvable.</p>;
  }

  /* ---------------- DATA ---------------- */
  const name = pickLocaleValue(product.name, locale);
  const desc = pickLocaleValue(product.description, locale);

  const priceHT = getPriceForMarket(product.pricesByMarket, market);

  const vat = getVATForMarket(product.vatByMarket, market);

  const vatAmount = vat.enabled
    ? round2((priceHT * vat.rate) / 100)
    : 0;

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
    <main className="max-w-3xl mx-auto py-10 px-4">
      <div className="space-y-6">
        <div className="relative w-full aspect-square bg-gray-100 rounded">
          <Image
            src={product.imageUrl || "/placeholder.jpg"}
            alt={name}
            fill
            className="object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold">{name}</h1>

        {desc && <p className="text-gray-600">{desc}</p>}

        {/* PRICES */}
        <div className="space-y-1">
          <p>
            Prix HT : <strong>{priceHT.toFixed(2)} €</strong>
          </p>

          {vat.enabled && (
            <>
              <p>
                TVA ({vat.rate}%) :{" "}
                <strong>{vatAmount.toFixed(2)} €</strong>
              </p>

              <p className="text-lg font-semibold">
                Prix TTC : {priceTTC.toFixed(2)} €
              </p>
            </>
          )}
        </div>

        <button
          onClick={addToCart}
          className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
        >
          Ajouter au panier 🛒
        </button>
      </div>
    </main>
  );
}
