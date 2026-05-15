/* =====================================================
   TYPES
===================================================== */

type GetPayButtonLabelParams = {
  provider?:
    | string
    | null;

  t: {
    payWithPayPal: string;
    payWithStripe: string;
  };
};

/* =====================================================
   GET PAY BUTTON LABEL
===================================================== */

export function getPayButtonLabel({
  provider,
  t,
}: GetPayButtonLabelParams): string {
  /* =========================================
     PAYPAL
  ========================================= */

  if (
    provider ===
    "paypal"
  ) {
    return t.payWithPayPal;
  }

  /* =========================================
     BANK TRANSFER
  ========================================= */

  if (
    provider ===
    "bank_transfer"
  ) {
    return "Continuer avec le virement bancaire";
  }

  /* =========================================
     STRIPE / DEFAULT
  ========================================= */

  return t.payWithStripe;
}