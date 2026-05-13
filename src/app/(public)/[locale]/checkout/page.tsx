"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import { useCart } from "@/context/CartContext";

import ChooseShipping from "@/components/shipping/ChooseShipping";
import ChoosePayment from "@/components/payment/ChoosePayment";

import CartSummaryInline from "./components/CartSummaryInline";
import BillingForm from "./components/BillingForm";
import ShippingAddressForm from "./components/ShippingAddressForm";
import HeardFrom from "./components/HeardFrom";
import OrderTotals from "./components/OrderTotals";
import PayPalSection from "./components/PayPalSection";

import {
  getLocale,
  getT,
  LOCALE_TO_COUNTRY,
  mapLocaleToPayPal,
} from "./i18n";

import { moneyToCents } from "./money";

import useShippingMethods from "./hooks/useShippingMethods";
import usePaymentMethods from "./hooks/usePaymentMethods";

import "./checkout.css";

const OCULAREST_ID =
  "3tuSUenbUVVF6cuSHwS9";

export default function CheckoutPage() {
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
    clearCart,
  } = useCart();

  const paypalOrderDocIdRef =
    useRef<string | null>(null);

  /* =====================================================
     CUSTOMERS
  ===================================================== */

  const [
    billingCustomer,
    setBillingCustomer,
  ] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    country: "FR",
  });

  const [
    shippingCustomer,
    setShippingCustomer,
  ] = useState({
    address: "",
    postalCode: "",
    city: "",
    country: "FR",
  });

  const [
    sameAsBilling,
    setSameAsBilling,
  ] = useState(true);

  /* =====================================================
     SURVEY
  ===================================================== */

  const [
    heardFrom,
    setHeardFrom,
  ] = useState<
    | "internet"
    | "social"
    | "medical"
    | "other"
    | ""
  >("");

  const [
    heardFromOther,
    setHeardFromOther,
  ] = useState("");

  /* =====================================================
     AUTO COUNTRY
  ===================================================== */

  useEffect(() => {
    const country =
      LOCALE_TO_COUNTRY[
        locale
      ] ?? "FR";

    setBillingCustomer(
      (prev) => ({
        ...prev,
        country,
      })
    );

    setShippingCustomer(
      (prev) => ({
        ...prev,
        country,
      })
    );
  }, [locale]);

  /* =====================================================
     SAME AS BILLING
  ===================================================== */

  useEffect(() => {
    if (
      sameAsBilling
    ) {
      setShippingCustomer({
        address:
          billingCustomer.address,

        postalCode:
          billingCustomer.postalCode,

        city:
          billingCustomer.city,

        country:
          billingCustomer.country,
      });
    }
  }, [
    sameAsBilling,
    billingCustomer,
  ]);

  /* =====================================================
     SHIPPING
  ===================================================== */

  const {
    methods,
    loading:
      shippingLoading,
    shippingMethod,
    setShippingMethod,
    relayPoint,
    setRelayPoint,
  } = useShippingMethods({
    country:
      shippingCustomer.country,

    locale,
  });

  /* =====================================================
     PAYMENT
  ===================================================== */

  const {
    paymentMethods,
    paymentMethod,
    setPaymentMethod,
    error:
      paymentError,
  } = usePaymentMethods({
    country:
      shippingCustomer.country,
  });

  /* =====================================================
     TOTALS
  ===================================================== */

  const shippingHTEUR =
    shippingMethod?.priceHT ??
    0;

  const shippingVatRate =
    shippingMethod?.vatRate ??
    0;

  const cartHTCents =
    moneyToCents(totalHT);

  const cartVatCents =
    moneyToCents(totalVAT);

  const cartTTCCents =
    moneyToCents(totalTTC);

  const shippingHTCents =
    moneyToCents(
      shippingHTEUR
    );

  const shippingVatCents =
    shippingVatRate > 0
      ? Math.round(
          (
            shippingHTCents *
            shippingVatRate
          ) / 100
        )
      : 0;

  const shippingTTCCents =
    shippingHTCents +
    shippingVatCents;

  const finalTTCCents =
    cartTTCCents +
    shippingTTCCents;

  /* =====================================================
     PAYPAL
  ===================================================== */

  const paypalClientId =
    process.env
      .NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const paypalOptions =
    useMemo(
      () => ({
        clientId:
          paypalClientId ||
          "MISSING_CLIENT_ID",

        currency: "EUR",

        intent: "capture",

        components:
          "buttons",

        locale:
          mapLocaleToPayPal(
            locale
          ),
      }),

      [
        locale,
        paypalClientId,
      ]
    );

  /* =====================================================
     SAFE ITEMS
  ===================================================== */

  const safeItems =
    useMemo(() => {
      return items.map(
        (item) => {
          if (
            item.id ===
            OCULAREST_ID
          ) {
            return {
              ...item,

              quantity:
                Math.min(
                  item.quantity,
                  2
                ),
            };
          }

          return item;
        }
      );
    }, [items]);

  /* =====================================================
     STATES
  ===================================================== */

  const hasShippingSelected =
    !!shippingMethod;

  const hasPaymentSelected =
    !!paymentMethod;

  /* =====================================================
     PAY LABEL
  ===================================================== */

  const payButtonLabel =
    paymentMethod?.provider ===
    "paypal"

      ? t.payWithPayPal

      : paymentMethod?.provider ===
        "bank_transfer"

      ? "Continuer avec le virement bancaire"

      : t.payWithStripe;

  /* =====================================================
     PAY
  ===================================================== */

  async function pay() {
    if (!items.length) {
      return alert(
        t.emptyCart
      );
    }

    if (!shippingMethod) {
      return alert(
        t.chooseShipping
      );
    }

    if (!paymentMethod) {
      return alert(
        "Choisissez une méthode de paiement"
      );
    }

    if (
      !billingCustomer.email
    ) {
      return alert(
        t.emailRequired
      );
    }

    if (
      !billingCustomer.firstName ||
      !billingCustomer.lastName
    ) {
      return alert(
        t.nameRequired
      );
    }

    if (
      !billingCustomer.phone.trim()
    ) {
      return alert(
        t.phoneRequired
      );
    }

    if (!heardFrom) {
      return alert(
        t.heardFromRequired
      );
    }

    if (
      heardFrom ===
        "other" &&
      !heardFromOther.trim()
    ) {
      return alert(
        t.heardFromOtherRequired
      );
    }

    const fullName = `
      ${billingCustomer.firstName.trim()}
      ${billingCustomer.lastName.trim()}
    `.trim();

    /* =========================================
       BANK TRANSFER
    ========================================= */

    if (
      paymentMethod.provider ===
      "bank_transfer"
    ) {
      const res =
        await fetch(
          "/api/bank-transfer/create-order",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              {
                locale,

                items:
                  safeItems,

                shippingMethod,

                relayPoint,

                billingCustomer:
                  {
                    ...billingCustomer,

                    name:
                      fullName,

                    phone:
                      billingCustomer.phone.trim(),
                  },

                shippingCustomer:
                  {
                    ...shippingCustomer,

                    name:
                      fullName,

                    phone:
                      billingCustomer.phone.trim(),
                  },

                heardFrom,

                heardFromOther:
                  heardFrom ===
                  "other"
                    ? heardFromOther.trim()
                    : null,

                totals: {
                  cartHTCents,
                  cartVatCents,
                  cartTTCCents,

                  shippingHTCents,
                  shippingVatCents,
                  shippingTTCCents,

                  finalTTCCents,
                },
              }
            ),
          }
        );

      const json =
        await res
          .json()
          .catch(
            () => null
          );

      if (
        !res.ok ||
        !json?.ok ||
        !json?.orderId
      ) {
        alert(
          t.paymentError
        );

        return;
      }

      clearCart();

      window.location.href = `/${locale}/bank-transfer?order_id=${encodeURIComponent(
        json.orderId
      )}&reference=${encodeURIComponent(
        json.reference ||
          json.orderNumber ||
          ""
      )}&amount=${encodeURIComponent(
        String(
          json.totalTTC ??
            ""
        )
      )}`;

      return;
    }

    /* =========================================
       STRIPE
    ========================================= */

    if (
      paymentMethod.provider ===
      "stripe"
    ) {
      const res =
        await fetch(
          "/api/checkout",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              {
                items:
                  safeItems,

                locale,

                customerEmail:
                  billingCustomer.email,

                customerPhone:
                  billingCustomer.phone.trim(),

                heardFrom,

                heardFromOther:
                  heardFrom ===
                  "other"
                    ? heardFromOther.trim()
                    : null,

                billingAddress:
                  {
                    name:
                      fullName,

                    firstName:
                      billingCustomer.firstName,

                    lastName:
                      billingCustomer.lastName,

                    phone:
                      billingCustomer.phone.trim(),

                    address:
                      billingCustomer.address,

                    postalCode:
                      billingCustomer.postalCode,

                    city:
                      billingCustomer.city,

                    country:
                      billingCustomer.country,
                  },

                shippingAddress:
                  {
                    name:
                      fullName,

                    firstName:
                      billingCustomer.firstName,

                    lastName:
                      billingCustomer.lastName,

                    phone:
                      billingCustomer.phone.trim(),

                    address:
                      shippingCustomer.address,

                    postalCode:
                      shippingCustomer.postalCode,

                    city:
                      shippingCustomer.city,

                    country:
                      shippingCustomer.country,
                  },

                shippingMethod,

                relayPoint,

                paymentMethod,
              }
            ),
          }
        );

      const json =
        await res
          .json()
          .catch(
            () => null
          );

      if (
        !res.ok ||
        !json?.url
      ) {
        return alert(
          t.paymentError
        );
      }

      clearCart();

      window.location.href =
        json.url;

      return;
    }

    /* =========================================
       PAYPAL
    ========================================= */

    if (
      paymentMethod.provider ===
      "paypal"
    ) {
      alert(
        "Merci d’utiliser le bouton PayPal pour régler la commande."
      );

      return;
    }

    alert(
      "Cette méthode de paiement n’est pas encore disponible."
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="checkout">
      <div className="checkout-wrapper">

        {/* =========================================
            HERO
        ========================================= */}

        <header className="checkout-header">
          <div className="checkout-badge">
            Paiement sécurisé
          </div>

          <h1 className="checkout-title">
            {t.title}
          </h1>

          <p className="checkout-description">
            Finalisez votre commande
            en toute sécurité grâce à
            notre expérience premium,
            pensée pour un parcours
            fluide, rapide et rassurant.
          </p>
        </header>

        {/* =========================================
            CART
        ========================================= */}

        <div className="checkout-block">
          <CartSummaryInline />
        </div>

        {/* =========================================
            SHIPPING
        ========================================= */}

        {shippingLoading ? (
          <section className="checkout-section">
            <p className="checkout-loading">
              {
                t.loadingShipping
              }
            </p>
          </section>
        ) : (
          <section className="checkout-section">

            <div className="checkout-section-top">
              <div>
                <span className="checkout-section-kicker">
                  Livraison
                </span>

                <h2 className="checkout-subtitle">
                  Choisissez votre
                  méthode de livraison
                </h2>
              </div>

              <div
                className={`
                  checkout-selection-pill
                  ${
                    hasShippingSelected
                      ? ""
                      : "checkout-selection-pill-muted"
                  }
                `}
              >
                {hasShippingSelected
                  ? "Méthode sélectionnée"
                  : "Sélection requise"}
              </div>
            </div>

            <div className="checkout-choice-wrapper">
              <ChooseShipping
                methods={
                  methods
                }
                locale={
                  locale
                }
                selectedMethod={
                  shippingMethod
                }
                onMethodSelect={(
                  method
                ) => {
                  setShippingMethod(
                    method
                  );
                }}
                onRelaySelect={
                  setRelayPoint
                }
              />
            </div>
          </section>
        )}

        {/* =========================================
            BILLING
        ========================================= */}

        <BillingForm
          t={t}
          billingCustomer={
            billingCustomer
          }
          setBillingCustomer={
            setBillingCustomer
          }
        />

        {/* =========================================
            SHIPPING ADDRESS
        ========================================= */}

        <ShippingAddressForm
          t={t}
          sameAsBilling={
            sameAsBilling
          }
          setSameAsBilling={
            setSameAsBilling
          }
          shippingCustomer={
            shippingCustomer
          }
          setShippingCustomer={
            setShippingCustomer
          }
        />

        {/* =========================================
            HEARD FROM
        ========================================= */}

        <HeardFrom
          t={t}
          heardFrom={
            heardFrom
          }
          setHeardFrom={
            setHeardFrom
          }
          heardFromOther={
            heardFromOther
          }
          setHeardFromOther={
            setHeardFromOther
          }
        />

        {/* =========================================
            PAYMENT
        ========================================= */}

        <section className="checkout-section">

          <div className="checkout-section-top">
            <div>
              <span className="checkout-section-kicker">
                Paiement
              </span>

              <h2 className="checkout-subtitle">
                Choisissez votre
                méthode de paiement
              </h2>
            </div>

            <div
              className={`
                checkout-selection-pill
                ${
                  hasPaymentSelected
                    ? ""
                    : "checkout-selection-pill-muted"
                }
              `}
            >
              {hasPaymentSelected
                ? "Paiement sélectionné"
                : "Sélection requise"}
            </div>
          </div>

          <div className="checkout-choice-wrapper">
            <ChoosePayment
              methods={
                paymentMethods
              }
              locale={
                locale
              }
              selectedMethod={
                paymentMethod
              }
              onMethodSelect={(
                method
              ) => {
                setPaymentMethod(
                  method
                );
              }}
              error={
                paymentError
              }
            />
          </div>
        </section>

        {/* =========================================
            TOTALS
        ========================================= */}

        <OrderTotals
          t={t}
          cartHTCents={
            cartHTCents
          }
          cartVatCents={
            cartVatCents
          }
          shippingTTCCents={
            shippingTTCCents
          }
          shippingVatRate={
            shippingVatRate
          }
          finalTTCCents={
            finalTTCCents
          }
        />

        {/* =========================================
            PAYPAL
        ========================================= */}

        {paymentMethod?.provider ===
          "paypal" &&
          (!paypalClientId ? (
            <section className="checkout-section">
              <p
                style={{
                  color:
                    "#fca5a5",

                  fontWeight:
                    700,
                }}
              >
                PayPal est
                indisponible :
                variable{" "}
                <code>
                  NEXT_PUBLIC_PAYPAL_CLIENT_ID
                </code>{" "}
                manquante.
              </p>
            </section>
          ) : (
            <PayPalSection
              t={t}
              locale={
                locale
              }
              paypalOptions={
                paypalOptions
              }
              items={
                safeItems
              }
              shippingMethod={
                shippingMethod
              }
              relayPoint={
                relayPoint
              }
              billingCustomer={
                billingCustomer
              }
              shippingCustomer={
                shippingCustomer
              }
              heardFrom={
                heardFrom
              }
              heardFromOther={
                heardFromOther
              }
              totals={{
                cartHTCents,
                cartVatCents,
                cartTTCCents,

                shippingHTCents,
                shippingVatCents,
                shippingTTCCents,

                finalTTCCents,
              }}
              paypalOrderDocIdRef={
                paypalOrderDocIdRef
              }
              clearCart={
                clearCart
              }
            />
          ))}

        {/* =========================================
            PAY BUTTON
        ========================================= */}

        <button
          onClick={pay}
          className={`
            checkout-pay
            ${
              hasPaymentSelected
                ? "checkout-pay-active"
                : ""
            }
          `}
        >
          <span>
            {
              payButtonLabel
            }
          </span>
        </button>
      </div>
    </main>
  );
}