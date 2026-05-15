import type { PaymentMethod } from "@/app/admin/payments/types";

import type {
  ShippingMethod,
  RelayPoint,
} from "@/components/shipping/types";

/* =====================================================
   CUSTOMERS
===================================================== */

export type BillingCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
};

export type ShippingCustomer = {
  address: string;
  postalCode: string;
  city: string;
  country: string;
};

/* =====================================================
   HEARD FROM
===================================================== */

export type HeardFrom =
  | "internet"
  | "social"
  | "medical"
  | "other"
  | "";

/* =====================================================
   TOTALS
===================================================== */

export type CheckoutTotals = {
  cartHTCents: number;
  cartVatCents: number;
  cartTTCCents: number;

  shippingHTCents: number;
  shippingVatCents: number;
  shippingTTCCents: number;

  finalTTCCents: number;
};

/* =====================================================
   PAYLOADS
===================================================== */

export type StripeCheckoutPayload = {
  items: unknown[];

  locale: string;

  customerEmail: string;

  customerPhone: string;

  heardFrom: HeardFrom;

  heardFromOther: string | null;

  billingAddress: {
    name: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
  };

  shippingAddress: {
    name: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
  };

  shippingMethod: ShippingMethod;

  relayPoint: RelayPoint | null;

  paymentMethod: PaymentMethod;
};

export type BankTransferPayload = {
  locale: string;

  items: unknown[];

  shippingMethod: ShippingMethod;

  relayPoint: RelayPoint | null;

  billingCustomer: BillingCustomer & {
    name: string;
  };

  shippingCustomer: ShippingCustomer & {
    name: string;
    phone: string;
  };

  heardFrom: HeardFrom;

  heardFromOther: string | null;

  totals: CheckoutTotals;
};