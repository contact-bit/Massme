// src/app/api/admin/products/[id]/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { assertAdmin } from "@/server/adminAuth";

/* ----------------------------------
   TYPES
---------------------------------- */
type Lang = "fr" | "en" | "es" | "de" | "it" | "nl";
type Market =
  | "FR"
  | "EN"
  | "BE"
  | "DE"
  | "AT"
  | "ES"
  | "IT"
  | "NL"
  | "CH";
type Currency = "EUR" | "CHF";

const LANGS: Lang[] = ["fr", "en", "es", "de", "it", "nl"];
const MARKETS: Market[] = ["FR", "EN", "BE", "DE", "AT", "ES", "IT", "NL", "CH"];

const CURRENCY_BY_MARKET: Record<Market, Currency> = {
  FR: "EUR",
  EN: "EUR",
  BE: "EUR",
  DE: "EUR",
  AT: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  CH: "CHF",
};

/* ----------------------------------
   HELPERS
---------------------------------- */
function isMarket(x: unknown): x is Market {
  return typeof x === "string" && MARKETS.includes(x as Market);
}

function toNum(v: unknown): number {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function toInt(v: unknown): number {
  return Math.floor(toNum(v));
}

function pickLangRecord(obj: any): Record<Lang, string> {
  const out: any = {};
  for (const l of LANGS) {
    out[l] = typeof obj?.[l] === "string" ? obj[l] : "";
  }
  return out;
}

/**
 * Normalise un bloc markets / pricesByMarket / vatByMarket.
 */
function normalizePricedByMarket(
  input: any,
  fallbackMarkets: Market[]
): {
  markets: Market[];
  pricesByMarket: Record<Market, number>;
  vatByMarket: Record<Market, { enabled: boolean; rate: number }>;
} {
  let markets: Market[] = fallbackMarkets;

  if (Array.isArray(input?.markets)) {
    const filtered = input.markets.filter(isMarket);
    if (filtered.length > 0) {
      markets = filtered;
    }
  }

  const pricesByMarket: Record<Market, number> = {} as any;
  const vatByMarket: Record<Market, { enabled: boolean; rate: number }> =
    {} as any;

  const srcPrices = input?.pricesByMarket;
  const srcVat = input?.vatByMarket;

  for (const m of markets) {
    const rawPrice = srcPrices?.[m];
    pricesByMarket[m] = Math.round(toNum(rawPrice) * 100) / 100;

    const v = srcVat?.[m];
    const rate = Math.max(0, toNum(v?.rate));
    vatByMarket[m] = {
      enabled: !!v?.enabled && rate > 0,
      rate: !!v?.enabled && rate > 0 ? rate : 0,
    };
  }

  return { markets, pricesByMarket, vatByMarket };
}

function normalizeMarketSettings(
  input: any,
  markets: Market[]
): Record<Market, { isActive: boolean }> {
  const src = input?.marketSettings;
  const out: Record<Market, { isActive: boolean }> = {} as any;

  for (const market of markets) {
    out[market] = {
      isActive: src?.[market]?.isActive !== false,
    };
  }

  return out;
}

function normalizeMarketSettingsRecord(
  input: any
): Partial<Record<Market, { isActive: boolean }>> {
  const out: Partial<Record<Market, { isActive: boolean }>> = {};

  for (const market of MARKETS) {
    if (input?.[market]) {
      out[market] = {
        isActive: input[market]?.isActive !== false,
      };
    }
  }

  return out;
}

/* ----------------------------------
   COMMON SECURITY
---------------------------------- */
async function getAdminAuthorization(req: Request) {
  const error = await assertAdmin(req);
  return error ? { ok: false, error } : { ok: true };
}

/* ----------------------------------
   EXTRACT ID FROM URL
---------------------------------- */
function getIdFromUrl(req: Request): string | null {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] || null;
    return last && last !== "products" ? last : null;
  } catch {
    return null;
  }
}

/* ==================================
   DELETE PRODUCT (HARD DELETE)
================================== */
export async function DELETE(req: Request) {
  try {
    const sec = await getAdminAuthorization(req);
    if (!sec.ok && sec.error) return sec.error;

    const id = getIdFromUrl(req);
    if (!id) {
      return NextResponse.json(
        { error: "Missing product id" },
        { status: 400 }
      );
    }

    await dbAdmin.collection("products").doc(id).delete();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("❌ PRODUCT DELETE ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ==================================
   PATCH PRODUCT
================================== */
export async function PATCH(req: Request) {
  try {
    const sec = await getAdminAuthorization(req);
    if (!sec.ok && sec.error) return sec.error;

    const id = getIdFromUrl(req);
    if (!id) {
      return NextResponse.json(
        { error: "Missing product id" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body?.data || typeof body.data !== "object") {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    const data = body.data;
    const update: any = {};

    /* ---------- BASIC ---------- */
    if ("imageUrl" in data) update.imageUrl = data.imageUrl || null;
    if ("productCode" in data) {
      update.productCode = String(data.productCode || "").trim();
    }
    if ("isActive" in data) update.isActive = !!data.isActive;
    if ("weightKg" in data) {
      update.weightKg =
        Math.round(Math.max(0, toNum(data.weightKg)) * 100) /
        100;
    }
    if ("deliveryPackageCount" in data) {
      update.deliveryPackageCount = Math.max(
        1,
        toInt(data.deliveryPackageCount || 1)
      );
    }

    /* ---------- I18N ---------- */
    if ("name" in data) update.name = pickLangRecord(data.name);
    if ("description" in data)
      update.description = pickLangRecord(data.description);

    /* ---------- PRODUIT : MARKETS / PRICES / TVA ---------- */
    let productMarkets: Market[] | null = null;
    if (Array.isArray(data.markets)) {
      const filtered = data.markets.filter(isMarket);
      if (filtered.length > 0) {
        productMarkets = filtered;
        update.markets = productMarkets;

        const currencyByMarket: Record<Market, Currency> = {} as any;
        for (const m of productMarkets) {
          currencyByMarket[m] = CURRENCY_BY_MARKET[m];
        }
        update.currencyByMarket = currencyByMarket;
        update.marketSettings = normalizeMarketSettings(data, productMarkets);

        const productPriced = normalizePricedByMarket(data, productMarkets);
        update.pricesByMarket = productPriced.pricesByMarket;
        update.vatByMarket = productPriced.vatByMarket;
      }
    } else if ("marketSettings" in data) {
      const currentSnap = await dbAdmin
        .collection("products")
        .doc(id)
        .get();
      const currentMarketSettings =
        currentSnap.data()?.marketSettings || {};
      update.marketSettings = normalizeMarketSettingsRecord(
        {
          ...currentMarketSettings,
          ...data.marketSettings,
        }
      );
    }

    /* ---------- VARIANTS ---------- */
    if (Array.isArray(data.variants)) {
      update.variants = data.variants.map((v: any) => {
        const priced = normalizePricedByMarket(v, productMarkets || ["FR"]);

        return {
          id: String(v.id || ""),
          productCode: String(v.productCode || "").trim(),
          label: String(v.label || ""),
          description: String(v.description || ""),
          imageUrl: v.imageUrl ? String(v.imageUrl) : "",
          markets: priced.markets,
          pricesByMarket: priced.pricesByMarket,
          vatByMarket: priced.vatByMarket,
        };
      });
    }

    /* ---------- ADDONS ---------- */
    if (Array.isArray(data.addons)) {
      update.addons = data.addons.map((a: any) => {
        const priced = normalizePricedByMarket(a, productMarkets || ["FR"]);

        return {
          id: String(a.id || ""),
          productCode: String(a.productCode || "").trim(),
          label: String(a.label || ""),
          description: String(a.description || ""),
          imageUrl: a.imageUrl ? String(a.imageUrl) : "",
          markets: priced.markets,
          pricesByMarket: priced.pricesByMarket,
          vatByMarket: priced.vatByMarket,
        };
      });
    }

    /* ---------- LEGACY (OPTIONNEL) ---------- */
    if (update.pricesByMarket && update.pricesByMarket.FR != null) {
      update.priceHT = update.pricesByMarket.FR;
      update.price = { eur: update.pricesByMarket.FR };
    }

    update.updatedAt = new Date().toISOString();

    await dbAdmin.collection("products").doc(id).update(update);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("❌ PRODUCT PATCH ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
