"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import {
  isMainVitrectomedProduct,
  useCart,
  type CartItem,
} from "@/context/CartContext";
import { db } from "@/lib/firebase";
import {
  MARKET_BY_LOCALE,
  type Market,
} from "@/lib/market";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ------------------------------------------
   🌍 LOCALES
------------------------------------------ */
type Locale = "fr" | "en" | "es" | "de" | "it" | "nl";

const SUPPORTED_LOCALES: Locale[] = [
  "fr",
  "en",
  "es",
  "de",
  "it",
  "nl",
];

/* ------------------------------------------
   🌍 TRANSLATIONS
------------------------------------------ */
const TRANSLATIONS: Record<
  Locale,
  {
    title: string;
    empty: string;
    remove: string;
    subtotalHT: string;
    vat: string;
    totalHT: string;
    totalTTC: string;
    checkout: string;
    emptyHint: string;
    addProduct: string;
  }
> = {
  fr: {
    title: "Votre panier",
    empty: "Votre panier est vide.",
    remove: "Retirer",
    subtotalHT: "Sous-total HT",
    vat: "TVA",
    totalHT: "Total HT",
    totalTTC: "Total TTC",
    checkout: "Commander",
    emptyHint: "Ajoutez le coussin VitrectoMed pour démarrer votre commande.",
    addProduct: "Ajouter l’article",
  },
  en: {
    title: "Your cart",
    empty: "Your cart is empty.",
    remove: "Remove",
    subtotalHT: "Subtotal (excl. VAT)",
    vat: "VAT",
    totalHT: "Total excl. VAT",
    totalTTC: "Total incl. VAT",
    checkout: "Checkout",
    emptyHint: "Add the VitrectoMed cushion to start your order.",
    addProduct: "Add item",
  },
  es: {
    title: "Tu carrito",
    empty: "Tu carrito está vacío.",
    remove: "Eliminar",
    subtotalHT: "Subtotal sin IVA",
    vat: "IVA",
    totalHT: "Total sin IVA",
    totalTTC: "Total con IVA",
    checkout: "Pagar",
    emptyHint: "Añade el cojín VitrectoMed para empezar tu pedido.",
    addProduct: "Añadir el artículo",
  },
  de: {
    title: "Ihr Warenkorb",
    empty: "Ihr Warenkorb ist leer.",
    remove: "Entfernen",
    subtotalHT: "Zwischensumme netto",
    vat: "MwSt",
    totalHT: "Gesamt netto",
    totalTTC: "Gesamt brutto",
    checkout: "Zur Kasse",
    emptyHint: "Fügen Sie das VitrectoMed-Kissen hinzu, um Ihre Bestellung zu starten.",
    addProduct: "Artikel hinzufügen",
  },
  it: {
    title: "Il tuo carrello",
    empty: "Il tuo carrello è vuoto.",
    remove: "Rimuovi",
    subtotalHT: "Subtotale IVA esclusa",
    vat: "IVA",
    totalHT: "Totale IVA esclusa",
    totalTTC: "Totale IVA inclusa",
    checkout: "Checkout",
    emptyHint: "Aggiungi il cuscino VitrectoMed per iniziare l'ordine.",
    addProduct: "Aggiungi l'articolo",
  },
  nl: {
    title: "Je winkelwagen",
    empty: "Je winkelwagen is leeg.",
    remove: "Verwijderen",
    subtotalHT: "Subtotaal excl. btw",
    vat: "BTW",
    totalHT: "Totaal excl. btw",
    totalTTC: "Totaal incl. btw",
    checkout: "Afrekenen",
    emptyHint: "Voeg het VitrectoMed-kussen toe om je bestelling te starten.",
    addProduct: "Artikel toevoegen",
  },
};

type VatConfig = {
  enabled: boolean;
  rate: number;
};

type ProductVariant = {
  id: string;
  productCode?: string;
  label: string;
  imageUrl?: string;
  markets?: Market[];
  pricesByMarket?: Record<Market, number>;
  vatByMarket?: Record<Market, VatConfig>;
};

type Product = {
  id: string;
  productCode?: string;
  name?: Partial<Record<Locale, string>>;
  description?: Partial<Record<Locale, string>>;
  imageUrl?: string;
  isActive?: boolean;
  weightKg?: number;
  deliveryPackageCount?: number;
  markets?: Market[];
  marketSettings?: Partial<Record<Market, { isActive?: boolean }>>;
  pricesByMarket?: Record<Market, number>;
  vatByMarket?: Record<Market, VatConfig>;
  variants?: ProductVariant[];
};

const FALLBACK_IMAGE = "/brand/home-product.png";
const VITRECTOMED_PRODUCT_ID = "3tuSUenbUVVF6cuSHwS9";

function pickLocaleValue(
  obj: Partial<Record<Locale, string>> | undefined,
  locale: Locale
) {
  return obj?.[locale] || obj?.fr || "";
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

function variantIsAvailableInMarket(
  variant: ProductVariant,
  market: Market
) {
  return (
    !Array.isArray(variant.markets) ||
    variant.markets.length === 0 ||
    variant.markets.includes(market)
  );
}

function buildCartItemFromProduct(
  product: Product,
  locale: Locale,
  market: Market
): CartItem | null {
  const variantsForMarket = Array.isArray(product.variants)
    ? product.variants.filter((variant) =>
        variantIsAvailableInMarket(variant, market)
      )
    : [];
  const selectedVariant = variantsForMarket[0] || null;
  const baseName =
    pickLocaleValue(product.name, locale) || "Coussin VitrectoMed";
  const description = pickLocaleValue(product.description, locale);
  const priceHT = selectedVariant
    ? getPriceHT(selectedVariant.pricesByMarket, market)
    : getPriceHT(product.pricesByMarket, market);
  const vat = selectedVariant
    ? getVat(selectedVariant.vatByMarket, market)
    : getVat(product.vatByMarket, market);

  if (!priceHT) return null;

  return {
    id: selectedVariant
      ? `${product.id}:${selectedVariant.id}`
      : product.id,
    sku:
      selectedVariant?.productCode ||
      product.productCode ||
      undefined,
    productCode:
      selectedVariant?.productCode ||
      product.productCode ||
      undefined,
    name: selectedVariant
      ? `${baseName} – ${selectedVariant.label}`
      : baseName,
    priceHT,
    weightKg: Number(product.weightKg ?? 0) || 0,
    deliveryPackageCount:
      Number(product.deliveryPackageCount ?? 1) || 1,
    quantity: 1,
    imageUrl:
      selectedVariant?.imageUrl || product.imageUrl || FALLBACK_IMAGE,
    description,
    vat: {
      enabled: vat.enabled,
      rate: vat.rate,
    },
  };
}

/* ------------------------------------------
   🛒 CART DRAWER
------------------------------------------ */
export default function CartDrawer() {
  const drawerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const rawLocale = pathname?.split("/")[1];

  const locale: Locale = SUPPORTED_LOCALES.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : "fr";
  const market = MARKET_BY_LOCALE[locale];

  const t = TRANSLATIONS[locale];
  const [suggestedProduct, setSuggestedProduct] = useState<Product | null>(null);

  const {
    items,
    removeItem,
    updateQuantity,
    addItem,
    isOpen,
    closeCart,
    totalHT,
    totalVAT,
    totalTTC,
  } = useCart();

  const showVAT = totalVAT > 0;
  const defaultCartItem = useMemo<CartItem | null>(() => {
    if (!suggestedProduct) return null;

    return buildCartItemFromProduct(suggestedProduct, locale, market);
  }, [locale, market, suggestedProduct]);

  async function fetchSuggestedProduct() {
    try {
      const snap = await getDocs(collection(db, "products"));
      const products = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, "id">),
      })) as Product[];

      const activeProducts = products.filter((product) =>
        isProductActiveInMarket(product, market)
      );
      const product =
        activeProducts.find(
          (candidate) => candidate.id === VITRECTOMED_PRODUCT_ID
        ) ||
        activeProducts[0] ||
        null;

      setSuggestedProduct(product);
      return product;
    } catch (error) {
      console.error("[cart] product suggestion failed:", error);
      return null;
    }
  }

  useEffect(() => {
    if (!isOpen || items.length > 0 || suggestedProduct) {
      return;
    }

    fetchSuggestedProduct();
  }, [isOpen, items.length, market, suggestedProduct]);

  async function handleAddSuggestedProduct() {
    const cartItem =
      defaultCartItem ||
      (suggestedProduct
        ? buildCartItemFromProduct(suggestedProduct, locale, market)
        : null);

    if (cartItem) {
      addItem(cartItem);
      return;
    }

    const product = await fetchSuggestedProduct();
    const loadedCartItem = product
      ? buildCartItemFromProduct(product, locale, market)
      : null;

    if (loadedCartItem) {
      addItem(loadedCartItem);
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;
      if (drawerRef.current?.contains(target)) return;

      const element = target instanceof Element ? target : target.parentElement;
      if (element?.closest("[data-cart-trigger]")) return;

      closeCart();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeCart, isOpen]);

  // Keep the drawer completely out of the page until the customer
  // explicitly opens it from the navigation cart button.
  if (!isOpen) {
    return null;
  }

  return (
    <aside
      ref={drawerRef}
      id="cart-drawer"
      className="cart-drawer cart-drawer--popover open"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cart-drawer-title"
    >
        {/* HEADER */}
        <div className="cart-header">
          <h2 className="cart-title" id="cart-drawer-title">{t.title}</h2>
          <button
            type="button"
            className="cart-close-btn"
            onClick={closeCart}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* ITEMS */}
        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty__intro">
                <ShoppingBag size={30} aria-hidden="true" />
                <div>
                  <p>{t.empty}</p>
                  <span>{t.emptyHint}</span>
                </div>
              </div>

              <div className="cart-empty-product">
                <img
                  src={defaultCartItem?.imageUrl || FALLBACK_IMAGE}
                  alt={defaultCartItem?.name || "VitrectoMed"}
                  className="cart-empty-product__image"
                />

                <div className="cart-empty-product__body">
                  <p className="cart-empty-product__name">
                    {defaultCartItem?.name || "Coussin VitrectoMed"}
                  </p>

                  {defaultCartItem ? (
                    <p className="cart-empty-product__price">
                      {defaultCartItem.priceHT.toFixed(2)} € HT
                    </p>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                className="cart-empty__cta"
                onClick={handleAddSuggestedProduct}
              >
                {t.addProduct}
              </button>
            </div>
          ) : (
            items.map((item) => {
              const isMainProduct = isMainVitrectomedProduct(item);

              return (
              <article key={item.id} className="cart-item">
                <img
                  src={item.imageUrl || "/placeholder.jpg"}
                  alt={item.name}
                  className="cart-item-img"
                />

                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>

                  <p className="cart-item-price">
                    {item.priceHT.toFixed(2)} € HT × {item.quantity}
                  </p>

                  <div className="cart-item-actions">
                    {isMainProduct ? (
                      <div className="cart-item-quantity cart-item-quantity--choice" aria-label={`Quantité de ${item.name}`}>
                        {[1, 2].map((quantity) => (
                          <button
                            key={quantity}
                            type="button"
                            className={item.quantity === quantity ? "is-active" : ""}
                            onClick={() => updateQuantity(item.id, quantity)}
                            aria-pressed={item.quantity === quantity}
                          >
                            ×{quantity}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="cart-item-quantity" aria-label={`Quantité de ${item.name}`}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Diminuer la quantité"
                        >
                          <Minus size={15} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Augmenter la quantité"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      className="cart-item-remove"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 size={15} /> {t.remove}
                    </button>
                  </div>
                </div>
              </article>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-totals">
              <div>
                <span>{t.subtotalHT}</span>
                <span>{totalHT.toFixed(2)} €</span>
              </div>

              {showVAT && (
                <div>
                  <span>{t.vat}</span>
                  <span>{totalVAT.toFixed(2)} €</span>
                </div>
              )}

              <div className="cart-total">
                <strong>
                  {showVAT ? t.totalTTC : t.totalHT}
                </strong>
                <strong>
                  {(showVAT ? totalTTC : totalHT).toFixed(2)} €
                </strong>
              </div>
            </div>

            <Link
              href={`/${locale}/checkout`}
              className="btn btn-primary btn-full"
              onClick={closeCart}
            >
              {t.checkout}
            </Link>
          </div>
        )}
    </aside>
  );
}
