export type Translation = {
  title: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  phoneHelp: string;

  billingAddress: string;

  shippingAddress: string;

  address: string;

  postalCode: string;

  city: string;

  country: string;

  sameAsBilling: string;

  loadingShipping: string;

  subtotalExclTax: string;

  productVAT: string;

  shippingInclTax: string;

  shippingVAT: string;

  totalInclTax: string;

  payWithStripe: string;

  payWithPayPal: string;

  emptyCart: string;

  chooseShipping: string;

  emailRequired: string;

  nameRequired: string;

  phoneRequired: string;

  paymentError: string;

  heardFromQuestion: string;

  heardFromInternet: string;

  heardFromSocial: string;

  heardFromMedical: string;

  heardFromOther: string;

  heardFromOtherPlaceholder: string;

  heardFromRequired: string;

  heardFromOtherRequired: string;

  securePayment: string;

  checkoutDescription: string;

  shipping: string;

  chooseShippingMethod: string;

  selectedMethod: string;

  selectionRequired: string;

  payment: string;

  choosePaymentMethod: string;

  selectedPayment: string;

  paypalUnavailable: string;

  /* =========================================
     UPSELL
  ========================================= */

  upsellRecommended: string;

  upsellTitle: string;

  upsellDescription: string;

  upsellYes: string;

  upsellNo: string;

  /* =========================================
     CART SUMMARY
  ========================================= */

  order: string;

  yourCart: string;

  article: string;

  excludingTax: string;

  excludingTaxLong: string;

  remove: string;

  emptyCartDescription: string;

  totalHT: string;

  totalTTCProducts: string;

  trackedShipping: string;

  premiumSupport: string;
};

export type CheckoutTranslations =
  Translation;