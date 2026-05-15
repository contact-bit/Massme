import type {
  BillingCustomer,
  HeardFrom,
} from "../types";

/* =====================================================
   TYPES
===================================================== */

type ValidateCheckoutParams = {
  items: unknown[];

  shippingMethod: unknown;

  paymentMethod: {
    provider?: string;
  } | null;

  billingCustomer: BillingCustomer;

  heardFrom: HeardFrom;

  heardFromOther: string;
};

type ValidateCheckoutResult = {
  valid: boolean;

  error: string | null;
};

/* =====================================================
   VALIDATE CHECKOUT
===================================================== */

export function validateCheckout({
  items,
  shippingMethod,
  paymentMethod,
  billingCustomer,
  heardFrom,
  heardFromOther,
}: ValidateCheckoutParams): ValidateCheckoutResult {
  /* =========================================
     EMPTY CART
  ========================================= */

  if (!items.length) {
    return {
      valid: false,

      error:
        "Votre panier est vide.",
    };
  }

  /* =========================================
     SHIPPING
  ========================================= */

  if (!shippingMethod) {
    return {
      valid: false,

      error:
        "Choisissez une méthode de livraison.",
    };
  }

  /* =========================================
     PAYMENT
  ========================================= */

  if (!paymentMethod) {
    return {
      valid: false,

      error:
        "Choisissez une méthode de paiement.",
    };
  }

  /* =========================================
     EMAIL
  ========================================= */

  if (
    !billingCustomer.email.trim()
  ) {
    return {
      valid: false,

      error:
        "Adresse email requise.",
    };
  }

  /* =========================================
     FIRST / LAST NAME
  ========================================= */

  if (
    !billingCustomer.firstName.trim() ||
    !billingCustomer.lastName.trim()
  ) {
    return {
      valid: false,

      error:
        "Nom et prénom requis.",
    };
  }

  /* =========================================
     PHONE
  ========================================= */

  if (
    !billingCustomer.phone.trim()
  ) {
    return {
      valid: false,

      error:
        "Numéro de téléphone requis.",
    };
  }

  /* =========================================
     HEARD FROM
  ========================================= */

  if (!heardFrom) {
    return {
      valid: false,

      error:
        "Veuillez indiquer comment vous nous avez connus.",
    };
  }

  /* =========================================
     HEARD FROM OTHER
  ========================================= */

  if (
    heardFrom ===
      "other" &&
    !heardFromOther.trim()
  ) {
    return {
      valid: false,

      error:
        "Veuillez préciser votre réponse.",
    };
  }

  /* =========================================
     VALID
  ========================================= */

  return {
    valid: true,

    error: null,
  };
}