"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { usePathname } from "next/navigation";

import { db } from "@/lib/firebase";

import { useCart } from "@/context/CartContext";

import {
  getLocale,
  getT,
} from "../i18n";

import "./CartSummaryInline.css";

/* =====================================================
   TYPES
===================================================== */

type CartItem = {
  id: string;

  name: string;

  quantity: number;

  imageUrl?: string;

  description?: string;

  priceHT: number;
};

type ProtectiveCaseProduct = {
  id: string;
  productCode?: string;

  name: string;

  imageUrl?: string;

  priceHT: number;

  vat: {
    enabled: boolean;
    rate: number;
  };
};

/* =====================================================
   CONSTANTS
===================================================== */

const VITRECTOMED_PRODUCT_ID =
  "3tuSUenbUVVF6cuSHwS9";

/* =====================================================
   COMPONENT
===================================================== */

export default function CartSummaryInline() {

  const pathname =
    usePathname();

  const locale =
    getLocale(pathname);

  const t =
    getT(locale);

  const {
    items,
    totalHT,
    totalVAT,
    totalTTC,
    updateQuantity,
    removeItem,
    addItem,
  } = useCart();

  const [
    dismissedUpsell,
    setDismissedUpsell,
  ] = useState(false);

  const [
    protectiveCase,
    setProtectiveCase,
  ] =
    useState<ProtectiveCaseProduct | null>(
      null
    );

  /* =====================================================
     LOAD ADDON FROM PRODUCT
  ===================================================== */

  useEffect(() => {

    async function loadProtectiveCase() {

      try {

        const snap =
          await getDoc(
            doc(
              db,
              "products",
              VITRECTOMED_PRODUCT_ID
            )
          );

        if (!snap.exists()) {

          console.error(
            "Vitrectomed product not found"
          );

          return;
        }

        const data =
          snap.data();

        const addon =
          data?.addons?.[0];

        if (!addon) {

          console.error(
            "No addon found in product"
          );

          return;
        }

        setProtectiveCase({
          id:
            addon.id,
          productCode:
            addon.productCode || "",

          name:
            addon.label ||
            "Extra bamboo cover",

          imageUrl:
            addon.imageUrl || "",

          priceHT:
            addon.pricesByMarket?.FR ||
            16.6,

          vat: {
            enabled:
              addon.vatByMarket?.FR
                ?.enabled ?? true,

            rate:
              addon.vatByMarket?.FR
                ?.rate ?? 20,
          },
        });

      } catch (error) {

        console.error(
          "Error loading addon:",
          error
        );
      }
    }

    loadProtectiveCase();

  }, []);

  /* =====================================================
     TOTAL ITEMS
  ===================================================== */

  const totalItems =
    useMemo(() => {

      return items.reduce(
        (
          total: number,
          item: CartItem
        ) =>
          total +
          item.quantity,

        0
      );

    }, [items]);

  /* =====================================================
     UPSELL
  ===================================================== */

  const hasVitrectomedProduct =
    items.some(
      (
        item: CartItem
      ) =>
        item.id ===
        VITRECTOMED_PRODUCT_ID
    );

  const hasProtectiveCase =
    items.some(
      (
        item: CartItem
      ) =>
        item.id ===
        protectiveCase?.id
    );

  const showUpsell =
    hasVitrectomedProduct &&
    !hasProtectiveCase &&
    !dismissedUpsell &&
    !!protectiveCase;

  /* =====================================================
     ADD CASE
  ===================================================== */

  function handleAddCase() {

    if (!protectiveCase) {
      return;
    }

    addItem({
      id:
        protectiveCase.id,
      sku:
        protectiveCase.productCode ||
        undefined,
      productCode:
        protectiveCase.productCode ||
        undefined,

      name:
        protectiveCase.name,

      quantity: 1,

      imageUrl:
        protectiveCase.imageUrl,

      description:
        t.upsellDescription,

      priceHT:
        protectiveCase.priceHT,

      vat:
        protectiveCase.vat,
    });
  }

  /* =====================================================
     EMPTY
  ===================================================== */

  if (!items.length) {

    return (
      <section className="cart-summary-empty">

        <div className="cart-summary-empty-icon">
          🛒
        </div>

        <div className="cart-summary-empty-content">

          <h2 className="cart-summary-empty-title">
            {t.emptyCart}
          </h2>

          <p className="cart-summary-empty-description">
            {t.emptyCartDescription}
          </p>

        </div>

      </section>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section className="cart-summary">

      {/* HEADER */}

      <div className="cart-summary-header">

        <div className="cart-summary-heading">

          <div className="cart-summary-badge">
            {t.order}
          </div>

          <h2 className="cart-summary-title">
            {t.yourCart}
          </h2>

        </div>

        <div className="cart-summary-count">

          {totalItems}
          {" "}
          {t.article}
          {totalItems > 1
            ? "s"
            : ""}

        </div>

      </div>

      {/* PRODUCTS */}

      <div className="cart-summary-list">

        {items.map(
          (
            item: CartItem,
            index: number
          ) => {

            const isMaxQuantity =
              item.quantity >= 2;

            return (
              <article
                key={`${item.id}-${index}`}
                className="cart-summary-item"
              >

                <div className="cart-summary-image-shell">

                  {item.imageUrl ? (
                    <img
                      src={
                        item.imageUrl
                      }
                      alt={
                        item.name
                      }
                      className="cart-summary-image"
                    />
                  ) : (
                    <div className="cart-summary-image-placeholder" />
                  )}

                </div>

                <div className="cart-summary-content">

                  <div className="cart-summary-content-top">

                    <div>

                      <h3 className="cart-summary-product-name">
                        {item.name}
                      </h3>

                      <p className="cart-summary-product-price">

                        {item.priceHT.toFixed(
                          2
                        )}
                        {" "}
                        €
                        {" "}
                        {t.excludingTax}
                        {" "}
                        / unité

                      </p>

                    </div>

                    <div className="cart-summary-line-total">

                      {(item.priceHT *
                        item.quantity).toFixed(
                        2
                      )}
                      {" "}
                      €

                    </div>

                  </div>

                  <div className="cart-summary-actions">

                    <div className="cart-summary-quantity">

                      <button
                        type="button"
                        className="cart-summary-quantity-button"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity - 1
                          )
                        }
                      >
                        −
                      </button>

                      <span className="cart-summary-quantity-value">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        disabled={
                          isMaxQuantity
                        }
                        className="cart-summary-quantity-button"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>

                    </div>

                    <button
                      type="button"
                      className="cart-summary-remove"
                      onClick={() =>
                        removeItem(
                          item.id
                        )
                      }
                    >
                      {t.remove}
                    </button>

                  </div>

                </div>

              </article>
            );
          }
        )}

      </div>

      {/* UPSELL */}

      {showUpsell &&
        protectiveCase && (

        <section className="cart-summary-upsell">

          <div className="cart-summary-upsell-image-shell">

            {protectiveCase.imageUrl ? (
              <img
                src={
                  protectiveCase.imageUrl
                }
                alt={
                  protectiveCase.name
                }
                className="cart-summary-upsell-image"
              />
            ) : (
              <div className="cart-summary-image-placeholder" />
            )}

          </div>

          <div className="cart-summary-upsell-content">

            <div>

              <div className="cart-summary-upsell-kicker">
                {t.upsellRecommended}
              </div>

              <h3 className="cart-summary-upsell-title">
                {t.upsellTitle}
              </h3>

              <p className="cart-summary-upsell-description">
                {t.upsellDescription}
              </p>

            </div>

            <div className="cart-summary-upsell-footer">

              <div className="cart-summary-upsell-price">

                +
                {protectiveCase.priceHT.toFixed(
                  2
                )}
                {" "}
                €
                {" "}
                HT

                <span
                  style={{
                    opacity: 0.65,
                    fontSize: ".85rem",
                    marginLeft: ".45rem",
                    fontWeight: 500,
                  }}
                >
                  {t.excludingTaxLong}
                </span>

              </div>

              <div
                style={{
                  display: "flex",
                  gap: ".8rem",
                  flexWrap: "wrap",
                }}
              >

                <button
                  type="button"
                  className="cart-summary-upsell-button"
                  onClick={
                    handleAddCase
                  }
                >
                  {t.upsellYes}
                </button>

                <button
                  type="button"
                  className="cart-summary-upsell-decline"
                  onClick={() =>
                    setDismissedUpsell(
                      true
                    )
                  }
                >
                  {t.upsellNo}
                </button>

              </div>

            </div>

          </div>

        </section>
      )}

      {/* TOTALS */}

      <div className="cart-summary-totals">

        <div className="cart-summary-row">

          <span>
            {t.totalHT}
          </span>

          <span>

            {totalHT.toFixed(
              2
            )}
            {" "}
            €

          </span>

        </div>

        {totalVAT > 0 && (
          <div className="cart-summary-row">

            <span>
              TVA
            </span>

            <span>

              {totalVAT.toFixed(
                2
              )}
              {" "}
              €

            </span>

          </div>
        )}

        <div className="cart-summary-divider" />

        <div className="cart-summary-row cart-summary-row-total">

          <span>
            {t.totalTTCProducts}
          </span>

          <span>

            {totalTTC.toFixed(
              2
            )}
            {" "}
            €

          </span>

        </div>

      </div>

      {/* TRUST */}

      <div className="cart-summary-trust">

        <div className="cart-summary-trust-item">
          🔒 {t.securePayment}
        </div>

        <div className="cart-summary-trust-item">
          📦 {t.trackedShipping}
        </div>

        <div className="cart-summary-trust-item">
          ✨ {t.premiumSupport}
        </div>

      </div>

    </section>
  );
}
