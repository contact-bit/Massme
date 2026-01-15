import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

/* ----------------------------------
   TYPES
---------------------------------- */
type Lang = "fr" | "en" | "es" | "de" | "it" | "nl" | "pt";
type Market = "FR" | "BE" | "DE" | "AT" | "ES" | "IT" | "NL" | "PT" | "CH";
type Currency = "EUR" | "CHF";

const LANGS: Lang[] = ["fr", "en", "es", "de", "it", "nl", "pt"];
const MARKETS: Market[] = ["FR", "BE", "DE", "AT", "ES", "IT", "NL", "PT", "CH"];

const CURRENCY_BY_MARKET: Record<Market, Currency> = {
  FR: "EUR",
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

/* ==================================
   PATCH PRODUCT
================================== */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    /* ---------- SECURITY ---------- */
    const headerPwd = req.headers.get("x-admin-password") || "";
    const envPwd = process.env.ADMIN_PASSWORD || "";

    if (!envPwd) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD manquant côté serveur" },
        { status: 500 }
      );
    }

    if (headerPwd !== envPwd) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* ---------- BODY ---------- */
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

    /* ---------- I18N ---------- */
    if ("name" in data) update.name = pickLangRecord(data.name);
    if ("description" in data)
      update.description = pickLangRecord(data.description);

    /* ---------- MARKETS ---------- */
    let markets: Market[] = ["FR"];
    if (Array.isArray(data.markets)) {
      const filtered = data.markets.filter(isMarket);
      if (filtered.length > 0) markets = filtered;
    }
    update.markets = markets;

    /* ---------- CURRENCY ---------- */
    const currencyByMarket: Record<Market, Currency> = {} as any;
    for (const m of markets) {
      currencyByMarket[m] = CURRENCY_BY_MARKET[m];
    }
    update.currencyByMarket = currencyByMarket;

    /* ---------- PRICES ---------- */
    const pricesByMarket: Record<Market, number> = {} as any;

    if (data.pricesByMarket && typeof data.pricesByMarket === "object") {
      for (const m of markets) {
        pricesByMarket[m] =
          Math.round(toNum(data.pricesByMarket[m]) * 100) / 100;
      }
    }

    update.pricesByMarket = pricesByMarket;

    /* ---------- ✅ TVA PAR PAYS (FIX CRITIQUE) ---------- */
    const vatByMarket: Record<
      Market,
      { enabled: boolean; rate: number }
    > = {} as any;

    if (data.vatByMarket && typeof data.vatByMarket === "object") {
      for (const m of markets) {
        const v = data.vatByMarket[m];
        vatByMarket[m] = {
          enabled: !!v?.enabled,
          rate: Math.max(0, toNum(v?.rate)),
        };
      }
    } else {
      for (const m of markets) {
        vatByMarket[m] = { enabled: false, rate: 0 };
      }
    }

    update.vatByMarket = vatByMarket;

    /* ---------- LEGACY ---------- */
    const DEFAULT_MARKET: Market = "FR";
    if (pricesByMarket[DEFAULT_MARKET] != null) {
      update.priceHT = pricesByMarket[DEFAULT_MARKET];
      update.price = { eur: pricesByMarket[DEFAULT_MARKET] };
    }

    update.updatedAt = new Date().toISOString();

    /* ---------- SAVE ---------- */
    await dbAdmin.collection("products").doc(id).update(update);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ PRODUCT PATCH ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
