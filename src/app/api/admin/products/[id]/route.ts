// src/app/api/admin/products/[id]/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

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

function isMarket(x: unknown): x is Market {
  return typeof x === "string" && (MARKETS as readonly string[]).includes(x);
}

function toNum(v: unknown): number {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function toInt(v: unknown): number {
  const n = Math.floor(toNum(v));
  return Number.isFinite(n) ? n : 0;
}

function pickLangRecord(obj: any): Record<Lang, string> {
  const out: any = {};
  for (const l of LANGS) out[l] = typeof obj?.[l] === "string" ? obj[l] : "";
  return out as Record<Lang, string>;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // ✅ Security check
    const headerPwd = req.headers.get("x-admin-password") || "";
    const envPwd = process.env.ADMIN_PASSWORD || "";

    if (!envPwd) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD non configuré côté serveur" },
        { status: 500 }
      );
    }

    if (!headerPwd || headerPwd !== envPwd) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse JSON
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Corps JSON invalide ou manquant" },
        { status: 400 }
      );
    }

    const data = body?.data;
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // ✅ Build sanitized update (whitelist)
    const update: any = {};

    // basic fields
    if ("imageUrl" in data) {
      update.imageUrl = typeof data.imageUrl === "string" ? data.imageUrl : null;
    }
    if ("isActive" in data) {
      update.isActive = !!data.isActive;
    }
    if ("stock" in data) {
      update.stock = Math.max(0, toInt(data.stock));
    }

    // multi-language
    if ("name" in data) update.name = pickLangRecord(data.name);
    if ("description" in data) update.description = pickLangRecord(data.description);

    // markets (✅ jamais null)
    let markets: Market[] | undefined;

    if ("markets" in data) {
      const arr = Array.isArray(data.markets) ? data.markets : [];
      const filtered = arr.filter(isMarket);
      markets = filtered.length > 0 ? filtered : ["FR"];
      update.markets = markets;
    }

    // fallback legacy price.eur
    const legacyEur =
      typeof data?.price === "number"
        ? data.price
        : typeof data?.price?.eur === "number"
        ? data.price.eur
        : null;

    // determine markets for price normalization:
    const effectiveMarkets: Market[] =
      markets ??
      (Array.isArray(data.markets) ? data.markets.filter(isMarket) : []) ??
      [];

    // force non-empty fallback
    const finalMarkets: Market[] = effectiveMarkets.length > 0 ? effectiveMarkets : ["FR"];

    // currencyByMarket: always server-authoritative
    const cbm: Record<Market, Currency> = {} as any;
    for (const m of finalMarkets) cbm[m] = CURRENCY_BY_MARKET[m];
    update.currencyByMarket = cbm;

    // pricesByMarket:
    const incomingPBM = data.pricesByMarket;

    const pbm: Record<Market, number> = {} as any;

    if (incomingPBM && typeof incomingPBM === "object") {
      for (const m of finalMarkets) {
        const raw = incomingPBM[m];
        pbm[m] = Math.round(toNum(raw) * 100) / 100;
      }
      update.pricesByMarket = pbm;
    } else if (legacyEur != null) {
      for (const m of finalMarkets) {
        if (CURRENCY_BY_MARKET[m] === "EUR") {
          pbm[m] = Math.round(toNum(legacyEur) * 100) / 100;
        }
      }
      update.pricesByMarket = pbm;
      // compat legacy
      update.price = { eur: Math.round(toNum(legacyEur) * 100) / 100 };
    }

    // always update updatedAt
    update.updatedAt = new Date().toISOString();

    // Update Firestore
    await dbAdmin.collection("products").doc(id).update(update);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("❌ Error updating product:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
