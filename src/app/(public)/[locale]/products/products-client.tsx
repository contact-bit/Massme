"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { MARKET_BY_LOCALE, Locale, Market } from "@/lib/market";

/* =====================================================
   UI TEXT
===================================================== */

const UI: Record<
  Locale,
  {
    noProduct: string;
    view: string;
    add: string;
    priceHT: string;
    vat: string;
    priceTTC: string;
  }
> = {
  fr: {
    noProduct: "Aucun produit disponible.",
    view: "Voir le produit →",
    add: "Ajouter au panier 🛒",
    priceHT: "Prix HT",
    vat: "TVA",
    priceTTC: "Prix TTC",
  },
  en: {
    noProduct: "No product available.",
    view: "View product →",
    add: "Add to cart 🛒",
    priceHT: "Price excl. VAT",
    vat: "VAT",
    priceTTC: "Price incl. VAT",
  },
  es: {
    noProduct: "No hay productos disponibles.",
    view: "Ver producto →",
    add: "Añadir al carrito 🛒",
    priceHT: "Precio sin IVA",
    vat: "IVA",
    priceTTC: "Precio con IVA",
  },
  de: {
    noProduct: "Kein Produkt verfügbar.",
    view: "Produkt ansehen →",
    add: "In den Warenkorb 🛒",
    priceHT: "Preis exkl. MwSt",
    vat: "MwSt",
    priceTTC: "Preis inkl. MwSt",
  },
  it: {
    noProduct: "Nessun prodotto disponibile.",
    view: "Vedi prodotto →",
    add: "Aggiungi al carrello 🛒",
    priceHT: "Prezzo IVA esclusa",
    vat: "IVA",
    priceTTC: "Prezzo IVA inclusa",
  },
  nl: {
    noProduct: "Geen product beschikbaar.",
    view: "Bekijk product →",
    add: "Toevoegen aan winkelwagen 🛒",
    priceHT: "Prijs excl. btw",
    vat: "BTW",
    priceTTC: "Prijs incl. btw",
  },
  pt: {
    noProduct: "Nenhum produto disponível.",
    view: "Ver produto →",
    add: "Adicionar ao carrinho 🛒",
    priceHT: "Preço sem IVA",
    vat: "IVA",
    priceTTC: "Preço com IVA",
  },
};

/* =====================================================
   TYPES
===================================================== */

type Product = {
  id: string;
  name: Partial<Record<Locale, string>>;
  description?: Partial<Record<Locale, string>>;
  imageUrl?: string;
  isActive?: boolean;

  markets: Market;

  pricesByMarket: Record<Market, number>;
  vatByMarket: Record<
    Market,
    {
      enabled: boolean;
      rate: number;
    }
  >;
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

/* =====================================================
   COMPONENT
===================================================== */

export default function ProductsClient({ locale }: { locale: Locale }) {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();
  const router = useRouter();

  const safeLocale: Locale = UI[locale] ? locale : "fr";
  const T = UI[safeLocale];

  const market: Market = MARKET_BY_LOCALE[safeLocale];

  /* ---------------- LOAD PRODUCTS ---------------- */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "products"));

      const all = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      })) as Product[];

      console.log("ALL PRODUCTS RAW", all, "MARKET", market);

      const filtered = all.filter(
        (p) =>
          p.isActive !== false &&
          Array.isArray(p.markets) &&
          p.markets.includes(market)
      );

      console.log("FILTERED PRODUCTS", filtered);

      setProducts(filtered);
    }

    load();
  }, [market]);

  /* ---------------- NO PRODUCT ---------------- */
  if (!products.length) {
    return (
      <main className="products-page">
        <p className="text-center">{T.noProduct}</p>
      </main>
    );
  }

  /* ---------------- ADD TO CART + REDIRECT ---------------- */
  const addToCartAndGoCheckout = (p: Product) => {
    const name = pickLocaleValue(p.name, safeLocale);
    const desc = pickLocaleValue(p.description, safeLocale);
    const priceHT = Number(p.pricesByMarket?.[market] ?? 0);
    const vat =
      p.vatByMarket?.[market] ?? {
        enabled: false,
        rate: 0,
      };

    addItem({
      id: p.id,
      name,
      priceHT,
      quantity: 1,
      imageUrl: p.imageUrl,
      description: desc,
      vat: {
        enabled: vat.enabled,
        rate: vat.rate,
      },
    });

    router.push(`/${safeLocale}/checkout`);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <main className="products-page products-grid">
      {products.map((p) => {
        const name = pickLocaleValue(p.name, safeLocale);
        const desc = pickLocaleValue(p.description, safeLocale);
        const priceHT = Number(p.pricesByMarket?.[market] ?? 0);
        const vat =
          p.vatByMarket?.[market] ?? {
            enabled: false,
            rate: 0,
          };
        const vatAmount = vat.enabled
          ? round2((priceHT * vat.rate) / 100)
          : 0;
        const priceTTC = round2(priceHT + vatAmount);

        return (
          <article key={p.id} className="product-card">
            <div className="product-img-wrapper">
              <Image
                src={p.imageUrl || "/placeholder.jpg"}
                alt={name}
                fill
                className="product-img"
              />
            </div>

            <h2 className="product-title">{name}</h2>

            {desc && <p className="product-desc">{desc}</p>}

            <div className="product-prices">
              <p>
                <strong>{T.priceHT} :</strong> {priceHT.toFixed(2)} €
              </p>

              {vatAmount > 0 && (
                <>
                  <p>
                    <strong>
                      {T.vat} ({vat.rate}%):
                    </strong>{" "}
                    {vatAmount.toFixed(2)} €
                  </p>

                  <p className="price-ttc">
                    <strong>{T.priceTTC} :</strong>{" "}
                    {priceTTC.toFixed(2)} €
                  </p>
                </>
              )}
            </div>

            <div className="product-actions">
              <Link
                href={`/${safeLocale}/products/${p.id}`}
                className="btn btn-secondary"
              >
                {T.view}
              </Link>

              <button
                onClick={() => addToCartAndGoCheckout(p)}
                className="btn btn-primary"
              >
                {T.add}
              </button>
            </div>
          </article>
        );
      })}
    </main>
  );
}
