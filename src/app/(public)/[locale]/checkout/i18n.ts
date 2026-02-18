export const LOCALES = ["fr", "en", "es", "de", "it", "nl"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_TO_COUNTRY: Record<Locale, string> = {
  fr: "FR",
  en: "GB",
  es: "ES",
  de: "DE",
  it: "IT",
  nl: "NL",
};

export function getLocale(path: string | null): Locale {
  const l = path?.split("/")?.[1];
  return (LOCALES as readonly string[]).includes(l ?? "") ? (l as Locale) : "fr";
}

/** PayPal Smart Buttons locale mapping */
export function mapLocaleToPayPal(locale: Locale): string {
  switch (locale) {
    case "fr":
      return "fr_FR";
    case "en":
      return "en_GB";
    case "es":
      return "es_ES";
    case "de":
      return "de_DE";
    case "it":
      return "it_IT";
    case "nl":
      return "nl_NL";
    default:
      return "en_US";
  }
}

/** ✅ Base complète FR (fallback) */
const FR = {
  title: "Commande",
  firstName: "Prénom",
  lastName: "Nom",
  email: "Email",
  phone: "Téléphone",
  phoneHelp:
    "Utilisé uniquement pour le suivi de livraison ou un problème avec votre commande.",
  billingAddress: "Adresse de facturation",
  shippingAddress: "Adresse de livraison",
  address: "Adresse",
  postalCode: "Code postal",
  city: "Ville",
  country: "Pays",
  sameAsBilling: "Livrer à la même adresse que la facturation",
  loadingShipping: "Chargement livraison…",
  subtotalExclTax: "Sous-total HT",
  productVAT: "TVA produits",
  shippingInclTax: "Livraison TTC",
  shippingVAT: "TVA livraison",
  totalInclTax: "Total TTC",
  payWithStripe: "Payer avec Stripe 💳",
  payWithPayPal: "Payer avec PayPal",
  emptyCart: "Panier vide",
  chooseShipping: "Choisissez une livraison",
  emailRequired: "Email requis",
  nameRequired: "Prénom et nom requis",
  phoneRequired: "Numéro de téléphone requis",
  paymentError: "Erreur paiement",
  heardFromQuestion: "Comment avez-vous connu notre produit ?",
  heardFromInternet: "Internet (recherche Google, site, etc.)",
  heardFromSocial: "Réseaux sociaux",
  heardFromMedical: "Recommandation médicale",
  heardFromOther: "Autre",
  heardFromOtherPlaceholder:
    "Précisez (ex : nom du médecin, nom du média, etc.)",
  heardFromRequired: "Merci d’indiquer comment vous nous avez connus",
  heardFromOtherRequired: 'Merci de préciser si vous choisissez « Autre »',
};

const EN: Partial<typeof FR> = {
  title: "Order",
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone number",
  phoneHelp: "Used only for delivery updates or issues with your order.",
  billingAddress: "Billing address",
  shippingAddress: "Shipping address",
  address: "Address",
  postalCode: "Postal code",
  city: "City",
  country: "Country",
  sameAsBilling: "Ship to the same address as billing",
  loadingShipping: "Loading shipping…",
  subtotalExclTax: "Subtotal excl. tax",
  productVAT: "Product VAT",
  shippingInclTax: "Shipping incl. tax",
  shippingVAT: "Shipping VAT",
  totalInclTax: "Total incl. tax",
  payWithStripe: "Pay with Stripe 💳",
  payWithPayPal: "Pay with PayPal",
  emptyCart: "Cart is empty",
  chooseShipping: "Choose a shipping method",
  emailRequired: "Email required",
  nameRequired: "First and last name required",
  phoneRequired: "Phone number required",
  paymentError: "Payment error",
  heardFromQuestion: "How did you hear about our product?",
  heardFromInternet: "Internet (Google search, website, etc.)",
  heardFromSocial: "Social media",
  heardFromMedical: "Medical recommendation",
  heardFromOther: "Other",
  heardFromOtherPlaceholder: "Please specify (e.g. doctor name, media, etc.)",
  heardFromRequired: "Please tell us how you heard about us",
  heardFromOtherRequired: 'Please specify if you select "Other"',
};

/**
 * ✅ Traductions :
 * - FR = complet
 * - autres = partiels OK, car getT() fallback sur FR
 */
export const TRANSLATIONS: Record<Locale, Partial<typeof FR>> = {
  fr: FR,
  en: EN,
  es: {
    title: "Pedido",
    payWithStripe: "Pagar con Stripe 💳",
    payWithPayPal: "Pagar con PayPal",
  },
  de: {
    title: "Bestellung",
    payWithStripe: "Mit Stripe bezahlen 💳",
    payWithPayPal: "Mit PayPal bezahlen",
  },
  it: {
    title: "Ordine",
    payWithStripe: "Paga con Stripe 💳",
    payWithPayPal: "Paga con PayPal",
  },
  nl: {
    title: "Bestelling",
    payWithStripe: "Betalen met Stripe 💳",
    payWithPayPal: "Betalen met PayPal",
  },
};

/** ✅ t toujours complet : FR + overrides locale */
export function getT(locale: Locale) {
  return { ...FR, ...(TRANSLATIONS[locale] ?? {}) };
}
