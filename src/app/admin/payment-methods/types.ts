import type { CountryCode, ShippingLocale } from "@/lib/shipping-i18n";

export type PaymentMethodProvider = "stripe" | "paypal" | "manual";

export type PaymentMethod = {
  id: string;
  country: CountryCode;
  name?: Partial<Record<ShippingLocale, string>>;
  description?: Partial<Record<ShippingLocale, string>>;
  provider: PaymentMethodProvider; // ✅
  config: Record<string, unknown>;
  isActive: boolean;
  sortOrder: number | null;
};
