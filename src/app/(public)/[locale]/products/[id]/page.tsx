"use client";

import "./product-detail.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Image from "next/image";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useCart } from "@/context/CartContext";

import {
  MARKET_BY_LOCALE,
  Locale,
  Market,
} from "@/lib/market";

/* =====================================================
   TYPES
===================================================== */

type RawVAT = {
  enabled?: boolean;
  rate?: number;
};

type Addon = {
  id: string;
  productCode?: string;

  label: string;

  imageUrl?: string;

  description?: string;

  markets?: string[];

  pricesByMarket?: Record<
    string,
    number
  >;

  vatByMarket?: Record<
    string,
    {
      enabled?: boolean;
      rate?: number;
    }
  >;
};

type Product = {
  id: string;
  productCode?: string;

  name:
    Partial<
      Record<
        Locale,
        string
      >
    >;

  description?:
    Partial<
      Record<
        Locale,
        string
      >
    >;

  imageUrl?: string;
  weightKg?: number;
  deliveryPackageCount?: number;

  isActive?: boolean;

  markets?: string[];
  marketSettings?: Record<
    string,
    {
      isActive?: boolean;
    }
  >;

  addons?: Addon[];

  pricesByMarket?:
    Record<string, number>;

  vatByMarket?:
    Record<
      string,
      RawVAT
    >;
};

/* =====================================================
   TRANSLATIONS
===================================================== */

const TRANSLATIONS:
  Record<
    Locale,
    {
      loading: string;
      notFound: string;
      addToCart: string;
      added: string;
      priceExclTax: string;
      vat: string;
      priceInclTax: string;
      recoveryTitle: string;
      recoveryText: string;
      badge1: string;
      badge2: string;
      badge3: string;
      trust1: string;
      trust2: string;
      trust3: string;
    }
  > = {
  fr: {
    loading:
      "Chargement…",

    notFound:
      "Produit introuvable.",

    addToCart:
      "Ajouter au panier",

    added:
      "Ajouté au panier",

    priceExclTax:
      "Prix HT",

    vat:
      "TVA",

    priceInclTax:
      "Prix TTC",

    recoveryTitle:
      "Pensé pour la récupération après vitrectomie",

    recoveryText:
      "Conçu pour améliorer le confort durant les longues périodes de position ventrale recommandées après certaines interventions rétiniennes.",

    badge1:
      "Confort médical premium",

    badge2:
      "Position ventrale",

    badge3:
      "Livraison rapide Europe",

    trust1:
      "Conçu pour la récupération rétinienne",

    trust2:
      "Confort cervical & dorsal optimisé",

    trust3:
      "Expédition rapide",
  },

  en: {
    loading:
      "Loading…",

    notFound:
      "Product not found.",

    addToCart:
      "Add to cart",

    added:
      "Added to cart",

    priceExclTax:
      "Price excl. tax",

    vat:
      "VAT",

    priceInclTax:
      "Price incl. tax",

    recoveryTitle:
      "Designed for post-vitrectomy recovery",

    recoveryText:
      "Designed to improve comfort during long face-down recovery periods after retinal surgery.",

    badge1:
      "Premium medical comfort",

    badge2:
      "Face-down support",

    badge3:
      "Fast Europe shipping",

    trust1:
      "Designed for retinal recovery",

    trust2:
      "Optimized neck & back comfort",

    trust3:
      "Fast shipping",
  },

  es: {
    loading:
      "Cargando…",

    notFound:
      "Producto no encontrado.",

    addToCart:
      "Añadir al carrito",

    added:
      "Añadido al carrito",

    priceExclTax:
      "Precio sin IVA",

    vat:
      "IVA",

    priceInclTax:
      "Precio con IVA",

    recoveryTitle:
      "Diseñado para la recuperación tras vitrectomía",

    recoveryText:
      "Diseñado para mejorar la comodidad durante largos periodos de recuperación boca abajo.",

    badge1:
      "Confort médico premium",

    badge2:
      "Soporte boca abajo",

    badge3:
      "Envío rápido Europa",

    trust1:
      "Diseñado para recuperación retinal",

    trust2:
      "Confort cervical optimizado",

    trust3:
      "Envío rápido",
  },

  de: {
    loading:
      "Wird geladen…",

    notFound:
      "Produkt nicht gefunden.",

    addToCart:
      "In den Warenkorb",

    added:
      "Zum Warenkorb hinzugefügt",

    priceExclTax:
      "Preis ohne MwSt",

    vat:
      "MwSt",

    priceInclTax:
      "Preis inkl. MwSt",

    recoveryTitle:
      "Für die Erholung nach der Vitrektomie entwickelt",

    recoveryText:
      "Entwickelt für mehr Komfort während langer Bauchlagephasen.",

    badge1:
      "Premium medizinischer Komfort",

    badge2:
      "Bauchlage Unterstützung",

    badge3:
      "Schneller Europa Versand",

    trust1:
      "Für Netzhaut-Genesung entwickelt",

    trust2:
      "Optimierter Nackenkomfort",

    trust3:
      "Schneller Versand",
  },

  it: {
    loading:
      "Caricamento…",

    notFound:
      "Prodotto non trovato.",

    addToCart:
      "Aggiungi al carrello",

    added:
      "Aggiunto al carrello",

    priceExclTax:
      "Prezzo IVA esclusa",

    vat:
      "IVA",

    priceInclTax:
      "Prezzo IVA inclusa",

    recoveryTitle:
      "Pensato per il recupero dopo vitrectomia",

    recoveryText:
      "Progettato per migliorare il comfort durante lunghi periodi in posizione prona.",

    badge1:
      "Comfort medico premium",

    badge2:
      "Supporto posizione prona",

    badge3:
      "Spedizione rapida Europa",

    trust1:
      "Pensato per recupero retinico",

    trust2:
      "Comfort cervicale migliorato",

    trust3:
      "Spedizione rapida",
  },

  nl: {
    loading:
      "Laden…",

    notFound:
      "Product niet gevonden.",

    addToCart:
      "Toevoegen aan winkelwagen",

    added:
      "Toegevoegd aan winkelwagen",

    priceExclTax:
      "Prijs excl. BTW",

    vat:
      "BTW",

    priceInclTax:
      "Prijs incl. BTW",

    recoveryTitle:
      "Ontworpen voor herstel na vitrectomie",

    recoveryText:
      "Ontworpen om meer comfort te bieden tijdens langdurige herstelperiodes.",

    badge1:
      "Premium medisch comfort",

    badge2:
      "Buiklig ondersteuning",

    badge3:
      "Snelle levering Europa",

    trust1:
      "Ontworpen voor retina herstel",

    trust2:
      "Geoptimaliseerd nekcomfort",

    trust3:
      "Snelle verzending",
  },

};

/* =====================================================
   HELPERS
===================================================== */

function pickLocaleValue(
  obj:
    | Partial<
        Record<
          Locale,
          string
        >
      >
    | undefined,

  locale: Locale
) {
  return (
    obj?.[locale] ||
    obj?.fr ||
    ""
  );
}

function round2(
  n: number
) {
  return (
    Math.round(
      (
        n +
        Number.EPSILON
      ) * 100
    ) / 100
  );
}

function normalizeMarketKey(
  key: string
): Market | null {

  const k =
    key
      .trim()
      .toUpperCase();

  const allowed:
    Market[] = [
    "FR",
    "IT",
    "DE",
    "ES",
    "NL",
    "BE",
    "CH",
  ];

  return allowed.includes(
    k as Market
  )
    ? (k as Market)
    : null;
}

function getVATForMarket(
  vatByMarket:
    | Record<
        string,
        RawVAT
      >
    | undefined,

  market: Market
) {

  if (!vatByMarket) {
    return {
      enabled: false,
      rate: 0,
    };
  }

  for (const [
    key,
    value,
  ] of Object.entries(
    vatByMarket
  )) {

    const normalized =
      normalizeMarketKey(
        key
      );

    if (
      normalized ===
      market
    ) {
      return {
        enabled:
          value?.enabled ===
            true &&
          typeof value?.rate ===
            "number",

        rate:
          value?.rate || 0,
      };
    }
  }

  return {
    enabled: false,
    rate: 0,
  };
}

function getPriceForMarket(
  pricesByMarket:
    | Record<
        string,
        number
      >
    | undefined,

  market: Market
) {

  if (
    !pricesByMarket
  ) {
    return 0;
  }

  for (const [
    key,
    value,
  ] of Object.entries(
    pricesByMarket
  )) {

    const normalized =
      normalizeMarketKey(
        key
      );

    if (
      normalized ===
        market &&
      typeof value ===
        "number"
    ) {
      return value;
    }
  }

  return 0;
}

function isProductActiveInMarket(
  product: Product,
  market: Market
) {
  return (
    product.isActive !== false &&
    Array.isArray(product.markets) &&
    product.markets.includes(market) &&
    product.marketSettings?.[market]?.isActive !== false
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function ProductPage() {

  const params =
    useParams() as {
      locale?: Locale;
      id?: string;
    };

  const router =
    useRouter();

  const locale:
    Locale =
    params.locale ?? "fr";

  const productId =
    params.id;

  const market:
    Market =
    MARKET_BY_LOCALE[
      locale
    ];

  const t =
    TRANSLATIONS[
      locale
    ];

  const { addItem } =
    useCart();

  const [
    product,
    setProduct,
  ] = useState<
    Product | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    added,
    setAdded,
  ] = useState(false);

  /* =====================================================
     MEMOS
  ===================================================== */

  const badges =
    useMemo(
      () => [
        t.badge1,
        t.badge2,
        t.badge3,
      ],
      [t]
    );

  const trustPoints =
    useMemo(
      () => [
        t.trust1,
        t.trust2,
        t.trust3,
      ],
      [t]
    );

  /* =====================================================
     FETCH
  ===================================================== */

  useEffect(() => {

    if (!productId) {
      setLoading(false);
      return;
    }

    async function loadProduct() {

      try {

        const snap =
          await getDoc(
            doc(
              db,
              "products",
              productId
            )
          );

        if (
          snap.exists()
        ) {

          const data =
            snap.data();

          console.log(
            "FIREBASE PRODUCT =>",
            data
          );

          console.log(
            "FIREBASE ADDONS =>",
            data.addons
          );

          setProduct({
            id: snap.id,
            ...(data as any),
          });
        }

      } catch (
        error
      ) {

        console.error(
          error
        );

      } finally {

        setLoading(false);

      }
    }

    loadProduct();

  }, [productId]);

  /* =====================================================
     STATES
  ===================================================== */

  if (loading) {
    return (
      <main className="product-detail-page">
        <div className="product-loading">
          {t.loading}
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-detail-page">
        <div className="product-loading">
          {t.notFound}
        </div>
      </main>
    );
  }

  if (
    !isProductActiveInMarket(
      product,
      market
    )
  ) {
    return (
      <main className="product-detail-page">
        <div className="product-loading">
          {t.notFound}
        </div>
      </main>
    );
  }

  /* =====================================================
     DATA
  ===================================================== */

  const name =
    pickLocaleValue(
      product.name,
      locale
    );

  const desc =
    pickLocaleValue(
      product.description,
      locale
    );

  const priceHT =
    getPriceForMarket(
      product.pricesByMarket,
      market
    );

  const vat =
    getVATForMarket(
      product.vatByMarket,
      market
    );

  const vatAmount =
    vat.enabled
      ? round2(
          (
            priceHT *
            vat.rate
          ) / 100
        )
      : 0;

  const priceTTC =
    round2(
      priceHT +
        vatAmount
    );

  /* =====================================================
     CART
  ===================================================== */

  function handleAddToCart() {

    const safeAddons =
      Array.isArray(
        product.addons
      )
        ? product.addons
        : [];

    console.log(
      "================================="
    );

    console.log(
      "PRODUCT RAW =>",
      product
    );

    console.log(
      "PRODUCT ADDONS =>",
      product.addons
    );

    console.log(
      "SAFE ADDONS =>",
      safeAddons
    );

    console.log(
      "ADDONS LENGTH =>",
      safeAddons.length
    );

    console.log(
      "FIRST ADDON =>",
      safeAddons[0]
    );

    console.log(
      "================================="
    );

    addItem({
      id: product.id,
      sku:
        product.productCode ||
        undefined,
      productCode:
        product.productCode ||
        undefined,

      name,

      quantity: 1,

      imageUrl:
        product.imageUrl,

      description:
        desc,

      priceHT,
      weightKg:
        Number(product.weightKg ?? 0) || 0,
      deliveryPackageCount:
        Number(product.deliveryPackageCount ?? 1) || 1,

      addons:
        safeAddons,

      vat: {
        enabled:
          vat.enabled,

        rate:
          vat.rate,
      },
    });

    setAdded(true);

    setTimeout(() => {

      router.push(
        `/${locale}/checkout`
      );

    }, 500);
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="product-detail-page">

      <section className="product-hero">

        <div className="product-hero__grid">

          <div className="product-visual">

            <div className="product-visual__ambient" />

            <div className="product-image-shell">

              <Image
                src={
                  product.imageUrl ||
                  "/placeholder.jpg"
                }

                alt={name}

                width={700}
                height={700}

                priority

                className="product-image"
              />

            </div>
          </div>

          <div className="product-content">

            <div className="product-eyebrow">
              VitrectoMed
            </div>

            <h1 className="product-title">
              {name}
            </h1>

            <p className="product-recovery">
              {
                t.recoveryTitle
              }
            </p>

            {desc && (
              <p className="product-description">
                {desc}
              </p>
            )}

            <div className="product-badges">

              {badges.map(
                (
                  badge
                ) => (
                  <div
                    key={
                      badge
                    }

                    className="product-badge"
                  >
                    {badge}
                  </div>
                )
              )}

            </div>

            <div className="product-trust">

              {trustPoints.map(
                (
                  item
                ) => (
                  <div
                    key={
                      item
                    }

                    className="product-trust-item"
                  >
                    <span />
                    {item}
                  </div>
                )
              )}

            </div>

            <div className="product-price-card">

              <div className="product-price-row">

                <span>
                  {
                    t.priceExclTax
                  }
                </span>

                <strong>
                  {priceHT.toFixed(
                    2
                  )} €
                </strong>

              </div>

              {vat.enabled && (
                <div className="product-price-row">

                  <span>
                    {t.vat} (
                    {
                      vat.rate
                    }
                    %)
                  </span>

                  <strong>
                    {vatAmount.toFixed(
                      2
                    )} €
                  </strong>

                </div>
              )}

              <div className="product-price-total">

                <span>
                  {
                    t.priceInclTax
                  }
                </span>

                <strong>
                  {priceTTC.toFixed(
                    2
                  )} €
                </strong>

              </div>

            </div>

            <div className="product-actions">

              <button
                type="button"

                onClick={
                  handleAddToCart
                }

                className="product-btn-primary"
              >
                {
                  added
                    ? t.added
                    : t.addToCart
                }
              </button>

            </div>

            <p className="product-footnote">
              {
                t.recoveryText
              }
            </p>

          </div>
        </div>
      </section>
    </main>
  );
}
