"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import { useCart } from "@/context/CartContext";

import {
  getLocale,
  getT,
  LOCALE_TO_COUNTRY,
  mapLocaleToPayPal,
} from "../i18n";

import useShippingMethods from "./useShippingMethods";
import usePaymentMethods from "./usePaymentMethods";

import {
  calculateTotals,
} from "../utils/calculateTotals";

import type {
  BillingCustomer,
  ShippingCustomer,
  HeardFrom as HeardFromType,
  StripeCheckoutPayload,
  BankTransferPayload,
} from "../types";

const OCULAREST_ID =
  "3tuSUenbUVVF6cuSHwS9";

export default function useCheckout() {
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
  ] = useState<BillingCustomer>({
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
  ] = useState<ShippingCustomer>({
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
  ] = useState<HeardFromType>("");

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

  const totals =
    calculateTotals({
      totalHT,
      totalVAT,
      totalTTC,
      shippingMethod,
    });

  const shippingVatRate =
    shippingMethod?.vatRate ?? 0;

  const shippingTTCCents =
    totals.shippingTTCCents;

  const finalTTCCents =
    totals.finalTTCCents;

  const cartHTCents =
    totals.cartHTCents;

  const cartVatCents =
    totals.cartVatCents;

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
      const payload: BankTransferPayload =
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

          totals,
        };

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
              payload
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
          json.totalTTC ?? ""
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
      const payload: StripeCheckoutPayload =
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
        };

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
              payload
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

  return {
    locale,
    t,

    items,
    safeItems,

    billingCustomer,
    setBillingCustomer,

    shippingCustomer,
    setShippingCustomer,

    sameAsBilling,
    setSameAsBilling,

    heardFrom,
    setHeardFrom,

    heardFromOther,
    setHeardFromOther,

    methods,
    shippingLoading,

    shippingMethod,
    setShippingMethod,

    relayPoint,
    setRelayPoint,

    paymentMethods,

    paymentMethod,
    setPaymentMethod,

    paymentError,

    totals,

    shippingVatRate,
    shippingTTCCents,
    finalTTCCents,

    cartHTCents,
    cartVatCents,

    hasShippingSelected,
    hasPaymentSelected,

    payButtonLabel,

    paypalClientId,
    paypalOptions,
    paypalOrderDocIdRef,

    clearCart,

    pay,
  };
}