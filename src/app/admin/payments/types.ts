// ../types.ts
import type { CountryCode, ShippingLocale } from "@/lib/shipping-i18n";

export type PaymentMethodProvider = "stripe" | "paypal" | "manual" | "bank_transfer";

export type BankTransferConfig = {
  accountHolder?: string;
  iban?: string;
  bic?: string;
  bankName?: string;
  instructions?: string; // simple, ou i18n si tu veux plus tard
};

export type PaymentMethod = {
  id: string;
  country: CountryCode;
  name?: Partial<Record<ShippingLocale, string>>;
  description?: Partial<Record<ShippingLocale, string>>;
  provider: PaymentMethodProvider;
  config: Record<string, unknown> | BankTransferConfig;
  isActive: boolean;
  sortOrder: number | null;
};
