"use client";

import "./products-client.css";

import React, { useEffect, useState } from "react";
import Image from "next/image";
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
    loading: string;
    add: string;
    priceHT: string;
    vat: string;
    priceTTC: string;
    chooseVariant: string;
    extraCover: string;
    yes: string;
    no: string;
    heroTitle: string;
    heroSubtitle: string;
  }
> = {
  fr: {
    noProduct: "Aucun produit disponible pour le moment.",
    loading: "Chargement des produits...",
    add: "Ajouter au panier 🛒",
    priceHT: "Prix HT",
    vat: "TVA",
    priceTTC: "Prix TTC",
    chooseVariant: "Choisissez votre modèle",
    extraCover: "Housse supplémentaire bambou",
    yes: "Oui",
    no: "Non",
    heroTitle: "Découvrez le dispositif VitectroMed",
    heroSubtitle:
      "Une solution pensée pour accompagner la convalescence après vitrectomie, avec une gestion claire des modèles, options et prix selon votre pays.",
  },
  en: {
    noProduct: "No product available at the moment.",
    loading: "Loading products...",
    add: "Add to cart 🛒",
    priceHT: "Price excl. VAT",
    vat: "VAT",
    priceTTC: "Price incl. VAT",
    chooseVariant: "Choose your model",
    extraCover: "Extra bamboo cover",
    yes: "Yes",
    no: "No",
    heroTitle: "Discover the VitectroMed device",
    heroSubtitle:
      "A dedicated solution to support recovery after vitrectomy, with clear models, options and pricing adapted to your country.",
  },
  es: {
    noProduct: "No hay productos disponibles por el momento.",
    loading: "Cargando productos...",
    add: "Añadir al carrito 🛒",
    priceHT: "Precio sin IVA",
    vat: "IVA",
    priceTTC: "Precio con IVA",
    chooseVariant: "Elige tu modelo",
    extraCover: "Funda adicional de bambú",
    yes: "Sí",
    no: "No",
    heroTitle: "Descubre el dispositivo VitectroMed",
    heroSubtitle:
      "Una solución pensada para acompañar la recuperación tras vitrectomía, con modelos, opciones y precios adaptados a tu país.",
  },
  de: {
    noProduct: "Derzeit ist kein Produkt verfügbar.",
    loading: "Produkte werden geladen...",
    add: "In den Warenkorb 🛒",
    priceHT: "Preis exkl. MwSt.",
    vat: "MwSt.",
    priceTTC: "Preis inkl. MwSt.",
    chooseVariant: "Wähle dein Modell",
    extraCover: "Zusätzlicher Bambusbezug",
    yes: "Ja",
    no: "Nein",
    heroTitle: "Entdecken Sie das VitectroMed‑Hilfsmittel",
    heroSubtitle:
      "Eine Lösung zur Unterstützung der Erholung nach Vitrektomie – mit klaren Modellen, Optionen und Preisen je nach Land.",
  },
  it: {
    noProduct: "Nessun prodotto disponibile al momento.",
    loading: "Caricamento dei prodotti...",
    add: "Aggiungi al carrello 🛒",
    priceHT: "Prezzo IVA esclusa",
    vat: "IVA",
    priceTTC: "Prezzo IVA inclusa",
    chooseVariant: "Scegli il tuo modello",
    extraCover: "Federa aggiuntiva in bambù",
    yes: "Sì",
    no: "No",
    heroTitle: "Scopri il dispositivo VitectroMed",
    heroSubtitle:
      "Una soluzione pensata per supportare la convalescenza dopo vitrectomia, con modelli, opzioni e prezzi adattati al tuo paese.",
  },
  nl: {
    noProduct: "Momenteel is er geen product beschikbaar.",
    loading: "Producten worden geladen...",
    add: "Toevoegen aan winkelwagen 🛒",
    priceHT: "Prijs excl. btw",
    vat: "BTW",
    priceTTC: "Prijs incl. btw",
    chooseVariant: "Kies je model",
    extraCover: "Extra bamboehoes",
    yes: "Ja",
    no: "Nee",
    heroTitle: "Ontdek het VitectroMed‑hulpmiddel",
    heroSubtitle:
      "Een oplossing ter ondersteuning van het herstel na vitrectomie, met duidelijke modellen, opties en prijzen per land.",
  },
};

/* =====================================================
   TYPES
===================================================== */

type VatConfig = {
  enabled: boolean;
  rate: number;
};

type ProductVariant = {
  id: string;
  label: string;
  imageUrl?: string;
  markets: Market[];
  pricesByMarket: Record<Market, number>;
  vatByMarket: Record<Market, VatConfig>;
};

type ProductAddon = {
  id: string;
  label: string;
  imageUrl?: string;
  markets: Market[];
  pricesByMarket: Record<Market, number>;
  vatByMarket: Record<Market, VatConfig>;
};

type Product = {
  id: string;
  name: Partial<Record<Locale, string>>;
  description?: Partial<Record<Locale, string>>;
  imageUrl?: string;
  isActive?: boolean;

  markets: Market[];
  pricesByMarket: Record<Market, number>;
  vatByMarket: Record<Market, VatConfig>;

  variants?: ProductVariant[];
  addons?: ProductAddon[];
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

function getPriceHT(
  pricesByMarket: Record<Market, number> | undefined,
  market: Market
): number {
  if (!pricesByMarket) return 0;
  return Number(pricesByMarket[market] ?? 0);
}

function getVat(
  vatByMarket: Record<Market, VatConfig> | undefined,
  market: Market
): VatConfig {
  const v = vatByMarket?.[market];
  return v || { enabled: false, rate: 0 };
}

function getVariantImage(
  p: Product,
  variantsForMarket: ProductVariant[],
  selectedVariantId: string | null
) {
  if (!variantsForMarket.length) {
    return p.imageUrl || "/placeholder.jpg";
  }

  const chosen =
    (selectedVariantId &&
      variantsForMarket.find((v) => v.id === selectedVariantId)) ||
    variantsForMarket[0];

  return chosen?.imageUrl || p.imageUrl || "/placeholder.jpg";
}

/* =====================================================
   COMPONENT
===================================================== */

export default function ProductsClient({ locale }: { locale: Locale }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string | null>
  >({});
  const [extraCoverChoice, setExtraCoverChoice] = useState<
    Record<string, boolean>
  >({});
  const [loading, setLoading] = useState(true);

  const { addItem } = useCart();
  const router = useRouter();

  const safeLocale: Locale = UI[locale] ? locale : "fr";
  const T = UI[safeLocale];

  const market: Market = MARKET_BY_LOCALE[safeLocale];

  /* ---------------- LOAD PRODUCTS ---------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);
      const snap = await getDocs(collection(db, "products"));

      const all = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      })) as Product[];

      const filtered = all.filter(
        (p) =>
          p.isActive !== false &&
          Array.isArray(p.markets) &&
          p.markets.includes(market)
      );

      setProducts(filtered);
      setLoading(false);
    }

    load();
  }, [market]);

  /* ---------------- HANDLERS ---------------- */

  const handleSelectVariant = (productId: string, variantId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
  };

  const handleExtraCover = (productId: string, enabled: boolean) => {
    setExtraCoverChoice((prev) => ({ ...prev, [productId]: enabled }));
  };

  const addToCartAndGoCheckout = (p: Product) => {
    const baseName = pickLocaleValue(p.name, safeLocale);
    const desc = pickLocaleValue(p.description, safeLocale);

    const variantsForMarket = Array.isArray(p.variants)
      ? p.variants.filter(
          (v) => Array.isArray(v.markets) && v.markets.includes(market)
        )
      : [];

    const addonsForMarket = Array.isArray(p.addons)
      ? p.addons.filter(
          (a) => Array.isArray(a.markets) && a.markets.includes(market)
        )
      : [];

    const hasVariants = variantsForMarket.length > 0;
    const hasAddons = addonsForMarket.length > 0;

    let mainPriceHT = getPriceHT(p.pricesByMarket, market);
    let mainVat = getVat(p.vatByMarket, market);
    let mainName = baseName;
    let mainImage = p.imageUrl;

    let selectedVariant: ProductVariant | null = null;

    if (hasVariants) {
      const chosenId =
        selectedVariants[p.id] || variantsForMarket[0]?.id || undefined;
      selectedVariant =
        variantsForMarket.find((v) => v.id === chosenId) ||
        variantsForMarket[0];

      if (!selectedVariants[p.id] && selectedVariant) {
        setSelectedVariants((prev) => ({ ...prev, [p.id]: selectedVariant!.id }));
      }

      if (selectedVariant) {
        mainPriceHT = getPriceHT(selectedVariant.pricesByMarket, market);
        mainVat = getVat(selectedVariant.vatByMarket, market);
        mainName = `${baseName} – ${selectedVariant.label}`;
        mainImage = selectedVariant.imageUrl || mainImage;
      }
    }

    // ligne principale
    addItem({
      id: hasVariants && selectedVariant ? `${p.id}:${selectedVariant.id}` : p.id,
      name: mainName,
      priceHT: mainPriceHT,
      quantity: 1,
      imageUrl: mainImage,
      description: desc,
      vat: {
        enabled: mainVat.enabled,
        rate: mainVat.rate,
      },
    });

    // housse
    if (hasAddons && extraCoverChoice[p.id]) {
      const addon = addonsForMarket[0];
      if (addon) {
        const addonPriceHT = getPriceHT(addon.pricesByMarket, market);
        const addonVat = getVat(addon.vatByMarket, market);

        addItem({
          id: `${p.id}:addon:${addon.id}`,
          name: addon.label,
          priceHT: addonPriceHT,
          quantity: 1,
          imageUrl: mainImage,
          description: addon.label,
          vat: {
            enabled: addonVat.enabled,
            rate: addonVat.rate,
          },
        });
      }
    }

    router.push(`/${safeLocale}/checkout`);
  };

  /* ---------------- RENDER ---------------- */

  return (
    <main className="products-page">
      <header className="products-header">
        <p className="products-eyebrow">VitectroMed · Vitrectomy support</p>
        <h1 className="products-title">{T.heroTitle}</h1>
        <p className="products-subtitle">{T.heroSubtitle}</p>
      </header>

      {loading && (
        <div className="products-loading">
          <span className="loader" />
          <p>{T.loading}</p>
        </div>
      )}

      {!loading && !products.length && (
        <section className="products-empty">
          <p>{T.noProduct}</p>
        </section>
      )}

      {!loading && products.length > 0 && (() => {
        const p = products[0]; // mono‑produit
        const name = pickLocaleValue(p.name, safeLocale);
        const desc = pickLocaleValue(p.description, safeLocale);

        const variantsForMarket = Array.isArray(p.variants)
          ? p.variants.filter(
              (v) => Array.isArray(v.markets) && v.markets.includes(market)
            )
          : [];

        const addonsForMarket = Array.isArray(p.addons)
          ? p.addons.filter(
              (a) => Array.isArray(a.markets) && a.markets.includes(market)
            )
          : [];

        const hasVariants = variantsForMarket.length > 0;
        const hasAddons = addonsForMarket.length > 0;

        const selectedVariantId =
          selectedVariants[p.id] || variantsForMarket[0]?.id || null;

        const imageSrc = getVariantImage(
          p,
          variantsForMarket,
          selectedVariantId
        );

        let displayPriceHT = getPriceHT(p.pricesByMarket, market);
        let displayVat = getVat(p.vatByMarket, market);

        if (hasVariants && selectedVariantId) {
          const v =
            variantsForMarket.find((vv) => vv.id === selectedVariantId) ||
            variantsForMarket[0];
          if (v) {
            displayPriceHT = getPriceHT(v.pricesByMarket, market);
            displayVat = getVat(v.vatByMarket, market);
          }
        }

        const addonSelected =
          hasAddons && extraCoverChoice[p.id] ? addonsForMarket[0] : null;

        let displayPriceWithAddonHT = displayPriceHT;
        if (addonSelected) {
          const addonPriceHT = getPriceHT(addonSelected.pricesByMarket, market);
          displayPriceWithAddonHT += addonPriceHT;
        }

        const vatAmount = displayVat.enabled
          ? round2((displayPriceWithAddonHT * displayVat.rate) / 100)
          : 0;
        const priceTTC = round2(displayPriceWithAddonHT + vatAmount);

        return (
          <section className="product-card">
            {/* IMAGE */}
            <div className="product-img-wrapper">
              <Image
                src={imageSrc}
                alt={name}
                fill
                className="product-img"
              />
            </div>

            {/* CONTENU */}
            <div className="product-body">
              <h2 className="product-title">{name}</h2>
              {desc && <p className="product-desc">{desc}</p>}

              {hasVariants && (
                <div className="product-variants-block">
                  <p className="product-variants-label">
                    {T.chooseVariant} :
                  </p>
                  <div className="product-variants-list">
                    {variantsForMarket.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        className={
                          selectedVariantId === v.id
                            ? "variant-pill active"
                            : "variant-pill"
                        }
                        onClick={() => handleSelectVariant(p.id, v.id)}
                      >
                        {v.imageUrl && (
                          <span className="variant-thumb">
                            <Image
                              src={v.imageUrl}
                              alt={v.label}
                              width={40}
                              height={40}
                            />
                          </span>
                        )}
                        <span className="variant-label">{v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hasAddons && (
                <div className="product-addon-block">
                  {(() => {
                    const firstAddon = addonsForMarket[0];
                    const addonVat = firstAddon
                      ? getVat(firstAddon.vatByMarket, market)
                      : { enabled: false, rate: 0 };
                    const addonPriceHT = firstAddon
                      ? getPriceHT(firstAddon.pricesByMarket, market)
                      : 0;
                    const addonVatAmount =
                      firstAddon && addonVat.enabled
                        ? round2((addonPriceHT * addonVat.rate) / 100)
                        : 0;
                    const addonPriceTTC = round2(
                      addonPriceHT + addonVatAmount
                    );

                    return (
                      <>
                        <p className="product-addon-label">
                          {T.extraCover} :
                          {firstAddon && (
                            <span>
                              {" "}
                              (+{addonPriceHT.toFixed(2)} € HT
                              {addonVat.enabled &&
                                ` | TVA ${addonVat.rate}%: ${addonVatAmount.toFixed(
                                  2
                                )} € | ${addonPriceTTC.toFixed(
                                  2
                                )} € TTC`}
                              )
                            </span>
                          )}
                        </p>

                        <div className="product-addon-toggle">
                          <button
                            type="button"
                            className={
                              extraCoverChoice[p.id]
                                ? "addon-pill"
                                : "addon-pill active"
                            }
                            onClick={() => handleExtraCover(p.id, false)}
                          >
                            {T.no}
                          </button>
                          <button
                            type="button"
                            className={
                              extraCoverChoice[p.id]
                                ? "addon-pill active"
                                : "addon-pill"
                            }
                            onClick={() => handleExtraCover(p.id, true)}
                          >
                            {T.yes}
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="product-prices">
                <p>
                  <strong>{T.priceHT} :</strong>{" "}
                  {displayPriceWithAddonHT.toFixed(2)} €
                </p>

                {vatAmount > 0 && (
                  <>
                    <p>
                      <strong>
                        {T.vat} ({displayVat.rate}%):
                      </strong>{" "}
                      {vatAmount.toFixed(2)} €
                    </p>

                    <p className="price-ttc">
                      <strong>{T.priceTTC} :</strong> {priceTTC.toFixed(2)} €
                    </p>
                  </>
                )}
              </div>

              <div className="product-actions">
                <button
                  onClick={() => addToCartAndGoCheckout(p)}
                  className="btn btn-primary"
                >
                  {T.add}
                </button>
              </div>
            </div>
          </section>
        );
      })()}
    </main>
  );
}
