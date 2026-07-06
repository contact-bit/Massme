"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { MARKET_BY_LOCALE, Locale, Market } from "@/lib/market";
import "./products-client.css";

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
    chooseVariant: string;
    extraCover: string;
    yes: string;
    no: string;
  }
> = {
  fr: {
    noProduct: "Aucun produit disponible.",
    view: "Voir le produit →",
    add: "Ajouter au panier 🛒",
    priceHT: "Prix HT",
    vat: "TVA",
    priceTTC: "Prix TTC",
    chooseVariant: "Choisissez votre modèle",
    extraCover: "Housse supplémentaire bambou",
    yes: "Oui",
    no: "Non",
  },
  en: {
    noProduct: "No product available.",
    view: "View product →",
    add: "Add to cart 🛒",
    priceHT: "Price excl. VAT",
    vat: "VAT",
    priceTTC: "Price incl. VAT",
    chooseVariant: "Choose your model",
    extraCover: "Extra bamboo cover",
    yes: "Yes",
    no: "No",
  },
  es: {
    noProduct: "No hay productos disponibles.",
    view: "Ver producto →",
    add: "Añadir al carrito 🛒",
    priceHT: "Precio sin IVA",
    vat: "IVA",
    priceTTC: "Precio con IVA",
    chooseVariant: "Elige tu modelo",
    extraCover: "Funda adicional de bambú",
    yes: "Sí",
    no: "No",
  },
  de: {
    noProduct: "Kein Produkt verfügbar.",
    view: "Produkt ansehen →",
    add: "In den Warenkorb 🛒",
    priceHT: "Preis exkl. MwSt",
    vat: "MwSt",
    priceTTC: "Preis inkl. MwSt",
    chooseVariant: "Wähle dein Modell",
    extraCover: "Zusätzlicher Bambusbezug",
    yes: "Ja",
    no: "Nein",
  },
  it: {
    noProduct: "Nessun prodotto disponibile.",
    view: "Vedi prodotto →",
    add: "Aggiungi al carrello 🛒",
    priceHT: "Prezzo IVA esclusa",
    vat: "IVA",
    priceTTC: "Prezzo IVA inclusa",
    chooseVariant: "Scegli il tuo modello",
    extraCover: "Federa aggiuntiva in bambù",
    yes: "Sì",
    no: "No",
  },
  nl: {
    noProduct: "Geen product beschikbaar.",
    view: "Bekijk product →",
    add: "Toevoegen aan winkelwagen 🛒",
    priceHT: "Prijs excl. btw",
    vat: "BTW",
    priceTTC: "Prijs incl. btw",
    chooseVariant: "Kies je model",
    extraCover: "Extra bamboe hoes",
    yes: "Ja",
    no: "Nee",
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
  productCode?: string;
  label: string;
  description?: string;
  imageUrl?: string;
  markets: Market[];
  pricesByMarket: Record<Market, number>;
  vatByMarket: Record<Market, VatConfig>;
};

type ProductAddon = {
  id: string;
  productCode?: string;
  label: string;
  description?: string;
  imageUrl?: string;
  markets: Market[];
  pricesByMarket: Record<Market, number>;
  vatByMarket: Record<Market, VatConfig>;
};

type Product = {
  id: string;
  productCode?: string;
  name: Partial<Record<Locale, string>>;
  description?: Partial<Record<Locale, string>>;
  imageUrl?: string;
  isActive?: boolean;
  weightKg?: number;
  deliveryPackageCount?: number;

  markets: Market[];
  marketSettings?: Partial<
    Record<
      Market,
      {
        isActive?: boolean;
      }
    >
  >;

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
        ...(d.data() as Omit<Product, "id">),
      })) as Product[];

      const filtered = all.filter(
        (p) => isProductActiveInMarket(p, market)
      );

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

  /* ---------------- HANDLERS ---------------- */
  const handleSelectVariant = (productId: string, variantId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
  };

  const handleExtraCover = (productId: string, enabled: boolean) => {
    setExtraCoverChoice((prev) => ({ ...prev, [productId]: enabled }));
  };

  /* ---------------- ADD TO CART + REDIRECT ---------------- */
  const addToCartAndGoCheckout = (p: Product) => {
    const baseName = pickLocaleValue(p.name, safeLocale);
    const desc = pickLocaleValue(p.description, safeLocale);

    const variantsForMarket = Array.isArray(p.variants)
      ? p.variants.filter(
          (v) =>
            !Array.isArray(v.markets) ||
            v.markets.length === 0 ||
            v.markets.includes(market)
        )
      : [];

    const addonsForMarket = Array.isArray(p.addons)
      ? p.addons.filter(
          (a) =>
            !Array.isArray(a.markets) ||
            a.markets.length === 0 ||
            a.markets.includes(market)
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
      sku:
        selectedVariant?.productCode ||
        p.productCode ||
        undefined,
      productCode:
        selectedVariant?.productCode ||
        p.productCode ||
        undefined,
      name: mainName,
      priceHT: mainPriceHT,
      weightKg:
        Number(p.weightKg ?? 0) || 0,
      deliveryPackageCount:
        Number(p.deliveryPackageCount ?? 1) || 1,
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
          sku:
            addon.productCode ||
            undefined,
          productCode:
            addon.productCode ||
            undefined,
          name: addon.label,
          priceHT: addonPriceHT,
          weightKg: 0,
          deliveryPackageCount: 0,
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
    <main className="products-page products-grid">
      {products.map((p) => {
        const name = pickLocaleValue(p.name, safeLocale);
        const desc = pickLocaleValue(p.description, safeLocale);

        const variantsForMarket = Array.isArray(p.variants)
          ? p.variants.filter(
              (v) =>
                !Array.isArray(v.markets) ||
                v.markets.length === 0 ||
                v.markets.includes(market)
            )
          : [];

        const addonsForMarket = Array.isArray(p.addons)
          ? p.addons.filter(
              (a) =>
                !Array.isArray(a.markets) ||
                a.markets.length === 0 ||
                a.markets.includes(market)
            )
          : [];

        const hasVariants = variantsForMarket.length > 0;
        const hasAddons = addonsForMarket.length > 0;

        const selectedVariantId =
          selectedVariants[p.id] || variantsForMarket[0]?.id || null;

        // image dynamique selon variante
        const imageSrc = getVariantImage(
          p,
          variantsForMarket,
          selectedVariantId
        );

        // prix
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
          const addonPriceHT = getPriceHT(
            addonSelected.pricesByMarket,
            market
          );
          displayPriceWithAddonHT += addonPriceHT;
        }

        const vatAmount = displayVat.enabled
          ? round2((displayPriceWithAddonHT * displayVat.rate) / 100)
          : 0;
        const priceTTC = round2(displayPriceWithAddonHT + vatAmount);

        return (
          <article key={p.id} className="product-card">
            <div className="product-img-wrapper">
              <Image
                src={imageSrc}
                alt={name}
                fill
                className="product-img"
              />
            </div>

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
                      <span className="variant-label">
                        {v.label}
                        {v.description && (
                          <small>{v.description}</small>
                        )}
                      </span>
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
                  const addonLabel =
                    firstAddon?.label || T.extraCover;
                  const addonDescription =
                    firstAddon?.description || "";

                  return (
                    <>
                      <p className="product-addon-label">
                        {addonLabel}
                        {firstAddon && (
                          <span>
                            {" "}
                            (+{addonPriceHT.toFixed(2)} € HT
                            {addonVat.enabled &&
                              ` | TVA ${addonVat.rate}%: ${addonVatAmount.toFixed(
                                2
                              )} € | ${addonPriceTTC.toFixed(2)} € TTC`}
                            )
                          </span>
                        )}
                      </p>

                      {addonDescription && (
                        <p className="product-addon-description">
                          {addonDescription}
                        </p>
                      )}

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
