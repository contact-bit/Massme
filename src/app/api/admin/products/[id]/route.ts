// src/app/api/admin/products/[id]/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

/* ----------------------------------
   TYPES
---------------------------------- */
type Lang = "fr" | "en" | "es" | "de" | "it" | "nl" | "pt";
type Market =
  | "FR"
  | "EN"
  | "BE"
  | "DE"
  | "AT"
  | "ES"
  | "IT"
  | "NL"
  | "PT"
  | "CH";
type Currency = "EUR" | "CHF";

const LANGS: Lang[] = ["fr", "en", "es", "de", "it", "nl", "pt"];
const MARKETS: Market[] = ["FR", "EN", "BE", "DE", "AT", "ES", "IT", "NL", "PT", "CH"];

const CURRENCY_BY_MARKET: Record<Market, Currency> = {
  FR: "EUR",
  EN: "EUR",
  BE: "EUR",
  DE: "EUR",
  AT: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  PT: "EUR",
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

/* ----------------------------------
   COMMON SECURITY
---------------------------------- */
function getAdminPassword(req: Request): { ok: boolean; error?: NextResponse } {
  const headerPwd = req.headers.get("x-admin-password") || "";
  const envPwd = process.env.ADMIN_PASSWORD || "";

  if (!envPwd) {
    return {
      ok: false,
      error: NextResponse.json(
        { error: "ADMIN_PASSWORD manquant côté serveur" },
        { status: 500 }
      ),
    };
  }

  if (headerPwd !== envPwd) {
    return {
      ok: false,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true };
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
    const sec = getAdminPassword(req);
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
    const sec = getAdminPassword(req);
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
    if ("isActive" in data) update.isActive = !!data.isActive;
    if ("stock" in data) update.stock = Math.max(0, toInt(data.stock));
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

    // 🔥 nouveau : gestion du stock oui/non
    if ("manageStock" in data) {
      update.manageStock = !!data.manageStock;
    }

    /* ---------- I18N ---------- */
    if ("name" in data) update.name = pickLangRecord(data.name);
    if ("description" in data)
      update.description = pickLangRecord(data.description);

    /* ---------- PRODUIT : MARKETS / PRICES / TVA ---------- */
    let productMarkets: Market[] = ["FR"];
    if (Array.isArray(data.markets)) {
      const filtered = data.markets.filter(isMarket);
      if (filtered.length > 0) {
        productMarkets = filtered;
      }
    }
    update.markets = productMarkets;

    const currencyByMarket: Record<Market, Currency> = {} as any;
    for (const m of productMarkets) {
      currencyByMarket[m] = CURRENCY_BY_MARKET[m];
    }
    update.currencyByMarket = currencyByMarket;

    const productPriced = normalizePricedByMarket(data, productMarkets);
    update.pricesByMarket = productPriced.pricesByMarket;
    update.vatByMarket = productPriced.vatByMarket;

    /* ---------- VARIANTS ---------- */
    if (Array.isArray(data.variants)) {
      update.variants = data.variants.map((v: any) => {
        const priced = normalizePricedByMarket(v, productMarkets);

        return {
          id: String(v.id || ""),
          label: String(v.label || ""),
          imageUrl: v.imageUrl ? String(v.imageUrl) : "",
          markets: priced.markets,
          pricesByMarket: priced.pricesByMarket,
          vatByMarket: priced.vatByMarket,
        };
      });
    } else {
      update.variants = [];
    }

    /* ---------- ADDONS ---------- */
    if (Array.isArray(data.addons)) {
      update.addons = data.addons.map((a: any) => {
        const priced = normalizePricedByMarket(a, productMarkets);

        return {
          id: String(a.id || ""),
          label: String(a.label || ""),
          imageUrl: a.imageUrl ? String(a.imageUrl) : "",
          markets: priced.markets,
          pricesByMarket: priced.pricesByMarket,
          vatByMarket: priced.vatByMarket,
        };
      });
    } else {
      update.addons = [];
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
