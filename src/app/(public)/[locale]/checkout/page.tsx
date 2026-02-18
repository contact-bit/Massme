"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

import { getLocale, getT, LOCALE_TO_COUNTRY, mapLocaleToPayPal } from "./i18n";
import { moneyToCents } from "./money";

import useShippingMethods from "./hooks/useShippingMethods";
import usePaymentMethods from "./hooks/usePaymentMethods";

import "./checkout.css";

const OCULAREST_ID = "3tuSUenbUVVF6cuSHwS9";

export default function CheckoutPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getT(locale);

  const { items, totalHT, totalVAT, totalTTC, clearCart } = useCart();

  const paypalOrderDocIdRef = useRef<string | null>(null);

  const [billingCustomer, setBillingCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    country: "FR",
  });

  const [shippingCustomer, setShippingCustomer] = useState({
    address: "",
    postalCode: "",
    city: "",
    country: "FR",
  });

  const [sameAsBilling, setSameAsBilling] = useState(true);

  const [heardFrom, setHeardFrom] = useState<
    "internet" | "social" | "medical" | "other" | ""
  >("");
  const [heardFromOther, setHeardFromOther] = useState("");

  // country auto selon locale
  useEffect(() => {
    const country = LOCALE_TO_COUNTRY[locale] ?? "FR";
    setBillingCustomer((prev) => ({ ...prev, country }));
    setShippingCustomer((prev) => ({ ...prev, country }));
  }, [locale]);

  // shipping = billing si checkbox
  useEffect(() => {
    if (sameAsBilling) {
      setShippingCustomer({
        address: billingCustomer.address,
        postalCode: billingCustomer.postalCode,
        city: billingCustomer.city,
        country: billingCustomer.country,
      });
    }
  }, [sameAsBilling, billingCustomer]);

  // hooks
  const {
    methods,
    loading: shippingLoading,
    shippingMethod,
    setShippingMethod,
    relayPoint,
    setRelayPoint,
  } = useShippingMethods({ country: shippingCustomer.country, locale });

  const {
    paymentMethods,
    paymentMethod,
    setPaymentMethod,
    error: paymentError,
  } = usePaymentMethods({ country: shippingCustomer.country });

  // totals en centimes
  const shippingHTEUR = shippingMethod?.priceHT ?? 0;
  const shippingVatRate = shippingMethod?.vatRate ?? 0;

  const cartHTCents = moneyToCents(totalHT);
  const cartVatCents = moneyToCents(totalVAT);
  const cartTTCCents = moneyToCents(totalTTC);

  const shippingHTCents = moneyToCents(shippingHTEUR);
  const shippingVatCents =
    shippingVatRate > 0 ? Math.round((shippingHTCents * shippingVatRate) / 100) : 0;
  const shippingTTCCents = shippingHTCents + shippingVatCents;

  const finalTTCCents = cartTTCCents + shippingTTCCents;

  // -----------------------
  // PayPal options (prod-safe)
  // -----------------------
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  useEffect(() => {
    // Logs utiles en prod (sans exposer tout le secret)
    console.log("[PayPal] NEXT_PUBLIC_PAYPAL_CLIENT_ID present =", !!paypalClientId);
    if (paypalClientId) {
      console.log("[PayPal] clientId prefix =", paypalClientId.slice(0, 6) + "...");
    }
  }, [paypalClientId]);

  const paypalOptions = useMemo(
    () => ({
      // Si jamais quelqu’un a un clientId vide en prod, on évite le crash en le voyant tout de suite
      clientId: paypalClientId || "MISSING_CLIENT_ID",
      currency: "EUR",
      intent: "capture",
      components: "buttons",
      locale: mapLocaleToPayPal(locale),
    }),
    [locale, paypalClientId]
  );

  // items safe (ocularest max 2)
  const safeItems = useMemo(() => {
    return items.map((item) => {
      if (item.id === OCULAREST_ID) {
        return { ...item, quantity: Math.min(item.quantity, 2) };
      }
      return item;
    });
  }, [items]);

  async function pay() {
    if (!items.length) return alert(t.emptyCart);
    if (!shippingMethod) return alert(t.chooseShipping);
    if (!paymentMethod) return alert("Choisissez une méthode de paiement");
    if (!billingCustomer.email) return alert(t.emailRequired);
    if (!billingCustomer.firstName || !billingCustomer.lastName)
      return alert(t.nameRequired);
    if (!billingCustomer.phone.trim()) return alert(t.phoneRequired);
    if (!heardFrom) return alert(t.heardFromRequired);
    if (heardFrom === "other" && !heardFromOther.trim())
      return alert(t.heardFromOtherRequired);

    const fullName = `${billingCustomer.firstName.trim()} ${billingCustomer.lastName.trim()}`;

    // ✅ VIREMENT BANCAIRE
    if (paymentMethod.provider === "bank_transfer") {
      const res = await fetch("/api/bank-transfer/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          items: safeItems,
          shippingMethod,
          relayPoint,
          billingCustomer: {
            ...billingCustomer,
            name: fullName,
            phone: billingCustomer.phone.trim(),
          },
          shippingCustomer: {
            ...shippingCustomer,
            name: fullName,
            phone: billingCustomer.phone.trim(),
          },
          heardFrom,
          heardFromOther: heardFrom === "other" ? heardFromOther.trim() : null,
          totals: {
            cartHTCents,
            cartVatCents,
            cartTTCCents,
            shippingHTCents,
            shippingVatCents,
            shippingTTCCents,
            finalTTCCents,
          },
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok || !json?.orderId) {
        alert(t.paymentError);
        return;
      }

      clearCart();

      window.location.href = `/${locale}/bank-transfer?order_id=${encodeURIComponent(
        json.orderId
      )}`;
      return;
    }

    // ✅ STRIPE
    if (paymentMethod.provider === "stripe") {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: safeItems,
          locale,
          customerEmail: billingCustomer.email,
          customerPhone: billingCustomer.phone.trim(),
          heardFrom,
          heardFromOther: heardFrom === "other" ? heardFromOther.trim() : null,
          billingAddress: {
            name: fullName,
            firstName: billingCustomer.firstName,
            lastName: billingCustomer.lastName,
            phone: billingCustomer.phone.trim(),
            address: billingCustomer.address,
            postalCode: billingCustomer.postalCode,
            city: billingCustomer.city,
            country: billingCustomer.country,
          },
          shippingAddress: {
            name: fullName,
            firstName: billingCustomer.firstName,
            lastName: billingCustomer.lastName,
            phone: billingCustomer.phone.trim(),
            address: shippingCustomer.address,
            postalCode: shippingCustomer.postalCode,
            city: shippingCustomer.city,
            country: shippingCustomer.country,
          },
          shippingMethod,
          relayPoint,
          paymentMethod,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.url) return alert(t.paymentError);

      clearCart();
      window.location.href = json.url;
      return;
    }

    // ✅ PAYPAL : paiement via bouton, pas via ce bouton
    if (paymentMethod.provider === "paypal") {
      alert("Merci d’utiliser le bouton PayPal pour régler la commande.");
      return;
    }

    alert("Cette méthode de paiement n’est pas encore disponible.");
  }

  const payButtonLabel =
    paymentMethod?.provider === "paypal"
      ? t.payWithPayPal
      : paymentMethod?.provider === "bank_transfer"
      ? "Continuer (virement bancaire)"
      : t.payWithStripe;

  return (
    <main className="checkout">
      <h1 className="checkout-title">{t.title}</h1>

      <CartSummaryInline />

      {shippingLoading ? (
        <section className="checkout-section">
          <p className="checkout-loading">{t.loadingShipping}</p>
        </section>
      ) : (
        <section className="checkout-section checkout-section-shipping">
          <ChooseShipping
            methods={methods}
            locale={locale}
            onMethodSelect={setShippingMethod}
            onRelaySelect={setRelayPoint}
          />
        </section>
      )}

      <BillingForm
        t={t}
        billingCustomer={billingCustomer}
        setBillingCustomer={setBillingCustomer}
      />

      <ShippingAddressForm
        t={t}
        sameAsBilling={sameAsBilling}
        setSameAsBilling={setSameAsBilling}
        shippingCustomer={shippingCustomer}
        setShippingCustomer={setShippingCustomer}
      />

      <HeardFrom
        t={t}
        heardFrom={heardFrom}
        setHeardFrom={setHeardFrom}
        heardFromOther={heardFromOther}
        setHeardFromOther={setHeardFromOther}
      />

      <section className="checkout-section">
        <ChoosePayment
          methods={paymentMethods}
          locale={locale}
          onMethodSelect={setPaymentMethod}
          error={paymentError}
        />
      </section>

      <OrderTotals
        t={t}
        cartHTCents={cartHTCents}
        cartVatCents={cartVatCents}
        shippingTTCCents={shippingTTCCents}
        shippingVatRate={shippingVatRate}
        finalTTCCents={finalTTCCents}
      />

      {/* PayPal: on n'affiche PAS le composant si le clientId manque en prod */}
      {paymentMethod?.provider === "paypal" &&
        (!paypalClientId ? (
          <section className="checkout-section">
            <p style={{ color: "crimson", fontWeight: 600 }}>
              PayPal est indisponible en production : variable manquante{" "}
              <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>.
            </p>
            <p style={{ opacity: 0.8 }}>
              Ajoute-la dans les variables d’environnement de prod (Vercel / hébergeur),
              puis redeploy.
            </p>
          </section>
        ) : (
          <PayPalSection
            t={t}
            locale={locale}
            paypalOptions={paypalOptions}
            items={safeItems}
            shippingMethod={shippingMethod}
            relayPoint={relayPoint}
            billingCustomer={billingCustomer}
            shippingCustomer={shippingCustomer}
            heardFrom={heardFrom}
            heardFromOther={heardFromOther}
            totals={{
              cartHTCents,
              cartVatCents,
              cartTTCCents,
              shippingHTCents,
              shippingVatCents,
              shippingTTCCents,
              finalTTCCents,
            }}
            paypalOrderDocIdRef={paypalOrderDocIdRef}
            clearCart={clearCart}
          />
        ))}

      <button onClick={pay} className="checkout-pay">
        {payButtonLabel}
      </button>
    </main>
  );
}
