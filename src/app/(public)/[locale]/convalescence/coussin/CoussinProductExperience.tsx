"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CreditCard,
  Heart,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { db } from "@/lib/firebase";
import {
  MARKET_BY_LOCALE,
  type Locale,
  type Market,
} from "@/lib/market";

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
  marketSettings?: Partial<Record<Market, { isActive?: boolean }>>;
  pricesByMarket: Record<Market, number>;
  vatByMarket: Record<Market, VatConfig>;
  variants?: ProductVariant[];
  addons?: ProductAddon[];
};

const FALLBACK_IMAGE = "/brand/home-product.png";

function pickLocaleValue(
  obj: Partial<Record<Locale, string>> | undefined,
  locale: Locale
) {
  return obj?.[locale] || obj?.fr || "";
}

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getPriceHT(
  pricesByMarket: Record<Market, number> | undefined,
  market: Market
) {
  return Number(pricesByMarket?.[market] ?? 0);
}

function getVat(
  vatByMarket: Record<Market, VatConfig> | undefined,
  market: Market
) {
  return vatByMarket?.[market] || { enabled: false, rate: 0 };
}

function isProductActiveInMarket(product: Product, market: Market) {
  return (
    product.isActive !== false &&
    Array.isArray(product.markets) &&
    product.markets.includes(market) &&
    product.marketSettings?.[market]?.isActive !== false
  );
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default function CoussinProductExperience({
  locale,
}: {
  locale: Locale;
}) {
  const safeLocale: Locale = MARKET_BY_LOCALE[locale] ? locale : "fr";
  const market = MARKET_BY_LOCALE[safeLocale];
  const router = useRouter();
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState(FALLBACK_IMAGE);
  const [extraCover, setExtraCover] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, "products"));
        const all = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        })) as Product[];

        setProducts(all.filter((product) => isProductActiveInMarket(product, market)));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [market]);

  const product = products[0] || null;

  const variantsForMarket = useMemo(() => {
    if (!product?.variants) return [];

    return product.variants.filter(
      (variant) =>
        Array.isArray(variant.markets) && variant.markets.includes(market)
    );
  }, [market, product]);

  const addonsForMarket = useMemo(() => {
    if (!product?.addons) return [];

    return product.addons.filter(
      (addon) => Array.isArray(addon.markets) && addon.markets.includes(market)
    );
  }, [market, product]);

  const selectedVariant =
    variantsForMarket.find((variant) => variant.id === selectedVariantId) ||
    variantsForMarket[0] ||
    null;

  useEffect(() => {
    if (!product) return;

    const image = selectedVariant?.imageUrl || product.imageUrl || FALLBACK_IMAGE;
    setSelectedImage(image);
  }, [product, selectedVariant]);

  if (loading) {
    return (
      <section className="coussin-loading">
        Chargement du dispositif VitrectoMed...
      </section>
    );
  }

  if (!product) {
    return (
      <section className="coussin-loading">
        Aucun dispositif disponible pour ce pays actuellement.
      </section>
    );
  }

  const name = pickLocaleValue(product.name, safeLocale) || "Coussin après vitrectomie";
  const description =
    pickLocaleValue(product.description, safeLocale) ||
    "Dispositif ergonomique pensé pour aider au positionnement face vers le bas après une chirurgie rétinienne.";

  const mainPriceHT = selectedVariant
    ? getPriceHT(selectedVariant.pricesByMarket, market)
    : getPriceHT(product.pricesByMarket, market);
  const mainVat = selectedVariant
    ? getVat(selectedVariant.vatByMarket, market)
    : getVat(product.vatByMarket, market);

  const selectedAddon = extraCover ? addonsForMarket[0] : null;
  const firstAddon = addonsForMarket[0] || null;
  const firstAddonPriceHT = firstAddon
    ? getPriceHT(firstAddon.pricesByMarket, market)
    : 0;
  const firstAddonVat = firstAddon
    ? getVat(firstAddon.vatByMarket, market)
    : mainVat;
  const firstAddonPriceTTC = round2(
    firstAddonPriceHT +
      (firstAddonVat.enabled
        ? (firstAddonPriceHT * firstAddonVat.rate) / 100
        : 0)
  );
  const addonPriceHT = selectedAddon
    ? getPriceHT(selectedAddon.pricesByMarket, market)
    : 0;
  const priceHT = mainPriceHT + addonPriceHT;
  const vatAmount = mainVat.enabled ? round2((priceHT * mainVat.rate) / 100) : 0;
  const priceTTC = round2(priceHT + vatAmount);
  const monthly = round2(priceTTC / 4);

  const gallery = [
    selectedVariant?.imageUrl || product.imageUrl || FALLBACK_IMAGE,
    product.imageUrl || FALLBACK_IMAGE,
    ...variantsForMarket.map((variant) => variant.imageUrl).filter(Boolean),
    "/brand/home-product.png",
    "/brand/home-hero-patient.jpeg",
    "/brand/home-specialist.png",
  ].filter((image, index, list): image is string => {
    return Boolean(image) && list.indexOf(image) === index;
  });

  function addMainItem() {
    addItem({
      id: selectedVariant ? `${product.id}:${selectedVariant.id}` : product.id,
      sku: selectedVariant?.productCode || product.productCode || undefined,
      productCode: selectedVariant?.productCode || product.productCode || undefined,
      name: selectedVariant ? `${name} – ${selectedVariant.label}` : name,
      priceHT: mainPriceHT,
      weightKg: Number(product.weightKg ?? 0) || 0,
      deliveryPackageCount: Number(product.deliveryPackageCount ?? 1) || 1,
      quantity: 1,
      imageUrl: selectedVariant?.imageUrl || product.imageUrl || FALLBACK_IMAGE,
      description,
      vat: {
        enabled: mainVat.enabled,
        rate: mainVat.rate,
      },
    });

    if (selectedAddon) {
      const addonVat = getVat(selectedAddon.vatByMarket, market);

      addItem({
        id: `${product.id}:addon:${selectedAddon.id}`,
        sku: selectedAddon.productCode || undefined,
        productCode: selectedAddon.productCode || undefined,
        name: selectedAddon.label,
        priceHT: addonPriceHT,
        weightKg: 0,
        deliveryPackageCount: 0,
        quantity: 1,
        imageUrl: selectedAddon.imageUrl || product.imageUrl || FALLBACK_IMAGE,
        description: selectedAddon.description || selectedAddon.label,
        vat: {
          enabled: addonVat.enabled,
          rate: addonVat.rate,
        },
      });
    }
  }

  function handleBuyNow() {
    addMainItem();
    router.push(`/${safeLocale}/checkout`);
  }

  return (
    <>
      <section className="coussin-product">
        <div className="coussin-gallery">
          <div className="coussin-main-image">
            <Image
              src={selectedImage}
              alt={name}
              width={920}
              height={720}
              priority
            />
            <button type="button" className="coussin-floating-action">
              <Heart size={22} />
            </button>
          </div>

          <div className="coussin-thumbs" aria-label="Galerie produit">
            {gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={selectedImage === image ? "is-active" : ""}
                onClick={() => setSelectedImage(image)}
              >
                <Image src={image} alt="" width={92} height={92} />
              </button>
            ))}
          </div>

          <div className="coussin-rufus">
            <strong>Questions rapides</strong>
            <div>
              <span>Est-ce confortable pour la nuque ?</span>
              <span>Est-ce facile à transporter ?</span>
              <span>Est-ce adapté après vitrectomie ?</span>
            </div>
          </div>
        </div>

        <div className="coussin-info">
          <span className="coussin-kicker">VitrectoMed • Dispositif médical</span>
          <h1>{name}</h1>

          <Link href={`/${safeLocale}/pathologies/trou-maculaire`} className="coussin-store-link">
            Voir les conseils de récupération VitrectoMed
          </Link>

          <div className="coussin-rating">
            <strong>4,8</strong>
            <span>
              {[0, 1, 2, 3, 4].map((star) => (
                <Star key={star} size={17} fill="currentColor" />
              ))}
            </span>
            <a href="#avis">128 avis patients</a>
          </div>

          <div className="coussin-choice">Choix VitrectoMed</div>

          <div className="coussin-central-note">
            <Check size={18} />
            Utilisation selon les consignes de votre chirurgien.
          </div>

          {variantsForMarket.length > 0 && (
            <div className="coussin-variants">
              <p>
                Modèle : <strong>{selectedVariant?.label}</strong>
              </p>
              <div>
                {variantsForMarket.map((variant) => {
                  const variantPriceHT = getPriceHT(variant.pricesByMarket, market);
                  const variantVat = getVat(variant.vatByMarket, market);
                  const variantTTC = round2(
                    variantPriceHT +
                      (variantVat.enabled
                        ? (variantPriceHT * variantVat.rate) / 100
                        : 0)
                  );

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      className={selectedVariant?.id === variant.id ? "is-selected" : ""}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setSelectedImage(variant.imageUrl || product.imageUrl || FALLBACK_IMAGE);
                      }}
                    >
                      <Image
                        src={variant.imageUrl || product.imageUrl || FALLBACK_IMAGE}
                        alt={variant.label}
                        width={78}
                        height={58}
                      />
                      <span>{variant.label}</span>
                      <strong>{formatPrice(variantTTC)}</strong>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {firstAddon && (
            <label className="coussin-addon">
              <input
                type="checkbox"
                checked={extraCover}
                onChange={(event) => setExtraCover(event.target.checked)}
              />
              <span>
                Ajouter {firstAddon.label}
                <strong>+ {formatPrice(firstAddonPriceTTC)}</strong>
              </span>
            </label>
          )}

          <dl className="coussin-specs">
            <div>
              <dt>Usage</dt>
              <dd>Position face vers le bas</dd>
            </div>
            <div>
              <dt>Confort</dt>
              <dd>Nuque, épaules et dos</dd>
            </div>
          </dl>
        </div>

        <aside className="coussin-buybox">
          <div className="coussin-buybox-price">{formatPrice(priceTTC)}</div>
          <p>
            Livraison estimée <strong>24 - 48 h</strong>
            <br />
            Préparation immédiate après validation.
          </p>

          <div className="coussin-delivery">
            <Truck size={18} />
            Expédition VitrectoMed en France et en Europe
          </div>

          <strong className="coussin-stock">En stock</strong>

          <button type="button" className="coussin-cart" onClick={addMainItem}>
            Ajouter au panier
          </button>
          <button type="button" className="coussin-buy" onClick={handleBuyNow}>
            Acheter cet article
          </button>

          <ul className="coussin-secure">
            <li>
              <PackageCheck size={17} />
              Expédié par VitrectoMed
            </li>
            <li>
              <RotateCcw size={17} />
              Retours et garanties légales
            </li>
            <li>
              <CreditCard size={17} />
              Paiement sécurisé
            </li>
            <li>
              <ShieldCheck size={17} />
              Données protégées
            </li>
          </ul>

          <button type="button" className="coussin-more">
            Voir plus <ChevronDown size={16} />
          </button>
        </aside>
      </section>

      <section className="coussin-deep-info">
        <div>
          <span className="coussin-kicker">Convalescence</span>
          <h2>Informations officielles VitrectoMed</h2>
          <p>
            Retrouvez les informations essentielles sur l’utilisation du
            coussin après vitrectomie, son rôle pendant la récupération et les
            points de vigilance à respecter selon votre prescription médicale.
          </p>
        </div>
        <div className="coussin-info-grid">
          {[
            ["Position", "Aide à maintenir le visage orienté vers le bas lorsque cette position est recommandée."],
            ["Confort", "Conçu pour limiter les tensions au niveau de la nuque, des épaules et du dos."],
            ["Récupération", "Pensé pour les moments de repos, de lecture et de convalescence à domicile."],
            ["Prudence", "À utiliser selon les consignes de votre chirurgien ou de votre ophtalmologiste."],
          ].map(([title, text]) => (
            <article key={title}>
              <BadgeCheck size={22} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <Link href={`/${safeLocale}/checkout`} className="coussin-bottom-cta">
          Finaliser ma commande <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}
