"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import type { RelayPoint, ShippingMethod } from "@/components/shipping/types";
import { centsToMoney } from "../money";

type HeardFrom = "internet" | "social" | "medical" | "other" | "";

type BillingCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
};

type ShippingCustomer = {
  address: string;
  postalCode: string;
  city: string;
  country: string;
};

type TotalsCents = {
  cartHTCents: number;
  cartVatCents: number;
  cartTTCCents: number;
  shippingHTCents: number;
  shippingVatCents: number;
  shippingTTCCents: number;
  finalTTCCents: number;
};

export default function PayPalSection({
  t,
  locale,
  paypalOptions,
  items,
  shippingMethod,
  relayPoint,
  billingCustomer,
  shippingCustomer,
  heardFrom,
  heardFromOther,
  totals,
  paypalOrderDocIdRef,
  clearCart,
}: {
  t: any;
  locale: string;
  paypalOptions: any;
  items: any[];
  shippingMethod: ShippingMethod | null;
  relayPoint: RelayPoint | null;
  billingCustomer: BillingCustomer;
  shippingCustomer: ShippingCustomer;
  heardFrom: HeardFrom;
  heardFromOther: string;
  totals: TotalsCents;
  paypalOrderDocIdRef: React.MutableRefObject<string | null>;
  clearCart: () => void;
}) {
  return (
    <section className="checkout-section">
      <PayPalScriptProvider options={paypalOptions}>
        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={async () => {
            if (!items.length) throw new Error(t.emptyCart);
            if (!shippingMethod) throw new Error(t.chooseShipping);
            if (!billingCustomer.email) throw new Error(t.emailRequired);
            if (!billingCustomer.firstName || !billingCustomer.lastName)
              throw new Error(t.nameRequired);
            if (!billingCustomer.phone.trim()) throw new Error(t.phoneRequired);
            if (!heardFrom) throw new Error(t.heardFromRequired);
            if (heardFrom === "other" && !heardFromOther.trim())
              throw new Error(t.heardFromOtherRequired);

            if (totals.finalTTCCents <= 0)
              throw new Error("Montant invalide pour PayPal.");

            const fullName = `${billingCustomer.firstName.trim()} ${billingCustomer.lastName.trim()}`;

            const payload = {
              locale,
              email: billingCustomer.email,
              phone: billingCustomer.phone.trim(),

              items,
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

              totals: {
                cartHT: centsToMoney(totals.cartHTCents),
                cartVAT: centsToMoney(totals.cartVatCents),
                cartTTC: centsToMoney(totals.cartTTCCents),
                shippingHT: centsToMoney(totals.shippingHTCents),
                shippingVAT: centsToMoney(totals.shippingVatCents),
                shippingTTC: centsToMoney(totals.shippingTTCCents),
                finalTTC: centsToMoney(totals.finalTTCCents),

                ...totals,
              },
            };

            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            const json = await res.json().catch(() => null);

            if (!res.ok || !json?.ok || !json?.orderId) {
              throw new Error(json?.error ?? "Erreur PayPal (createOrder)");
            }

            paypalOrderDocIdRef.current = json?.orderDocId ?? null;

            return String(json.orderId);
          }}
          onApprove={async (data) => {
            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderID,
                orderDocId: paypalOrderDocIdRef.current,
              }),
            });

            const json = await res.json().catch(() => null);

            if (!res.ok || !json?.ok) {
              console.error("PAYPAL CAPTURE ERROR", json);
              alert(t.paymentError);
              return;
            }

            clearCart();

            const orderDocId = json?.orderDocId || paypalOrderDocIdRef.current;

            window.location.href = orderDocId
              ? `/${locale}/success?order_id=${encodeURIComponent(orderDocId)}`
              : `/${locale}`;
          }}
          onError={(err) => {
            console.error("PAYPAL BUTTON ERROR", err);
            alert(t.paymentError);
          }}
        />
      </PayPalScriptProvider>
    </section>
  );
}
