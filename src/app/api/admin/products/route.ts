// src/app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { assertAdmin } from "@/server/adminAuth";

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
const MARKETS: Market[] = [
  "FR",
  "EN",
  "BE",
  "DE",
  "AT",
  "ES",
  "IT",
  "NL",
  "CH",
];

function isMarket(x: any): x is Market {
  return typeof x === "string" && (MARKETS as string[]).includes(x);
}

function sanitizeProductMarkets(product: any) {
  const markets = Array.isArray(product?.markets)
    ? product.markets.filter(isMarket)
    : ["FR"];

  const filterMarketRecord = (value: unknown) => {
    if (!value || typeof value !== "object") return value;

    return Object.fromEntries(
      Object.entries(value).filter(([market]) => isMarket(market))
    );
  };

  const sanitizeOption = (option: any) => ({
    ...option,
    markets: Array.isArray(option?.markets)
      ? option.markets.filter(isMarket)
      : markets,
    pricesByMarket: filterMarketRecord(option?.pricesByMarket),
    vatByMarket: filterMarketRecord(option?.vatByMarket),
  });

  return {
    ...product,
    markets,
    marketSettings: filterMarketRecord(product?.marketSettings),
    pricesByMarket: filterMarketRecord(product?.pricesByMarket),
    vatByMarket: filterMarketRecord(product?.vatByMarket),
    currencyByMarket: filterMarketRecord(product?.currencyByMarket),
    variants: Array.isArray(product?.variants)
      ? product.variants.map(sanitizeOption)
      : product?.variants,
    addons: Array.isArray(product?.addons)
      ? product.addons.map(sanitizeOption)
      : product?.addons,
  };
}

/* ============================
   GET : liste des produits
============================ */
export async function GET(req: Request) {
  try {
    const auth = await assertAdmin(req);
    if (auth) return auth;

    const url = new URL(req.url);
    const marketParam = url.searchParams.get("market");
    const market = marketParam && isMarket(marketParam) ? marketParam : null;

    const snap = await dbAdmin.collection("products").get();

    let products = snap.docs.map((doc) => {
      const data = doc.data() as any;
      return sanitizeProductMarkets({
        id: doc.id,
        ...data,
      });
    }) as any[];

    if (market) {
      products = products.filter((p) => {
        const m = Array.isArray(p.markets) ? p.markets : ["FR"];
        return m.includes(market);
      });
    }

    products.sort((a, b) => {
      const ta = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const tb = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return tb - ta;
    });

    return NextResponse.json({ ok: true, products }, { status: 200 });
  } catch (e) {
    console.error("❌ Error loading products:", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

/* ============================
   POST : création produit
============================ */
export async function POST(req: Request) {
  try {
    const auth = await assertAdmin(req);
    if (auth) return auth;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Données invalides" },
        { status: 400 }
      );
    }

    const {
      nameFr,
      productCode,
      descFr,
      priceHT,
      weightKg,
      deliveryPackageCount,
      imageUrl,
    } = body as {
      nameFr?: string;
      productCode?: string;
      descFr?: string;
      priceHT?: string | number;
      weightKg?: string | number;
      deliveryPackageCount?: string | number;
      imageUrl?: string;
    };

    if (!nameFr || !priceHT) {
      return NextResponse.json(
        { ok: false, error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }
    const now = new Date().toISOString();

    const docRef = await dbAdmin.collection("products").add({
      name: { fr: String(nameFr) },
      productCode: String(productCode || "").trim(),
      description: { fr: String(descFr || "") },
      imageUrl: imageUrl || null,
      weightKg: Math.max(0, Number(weightKg ?? 0) || 0),
      deliveryPackageCount: Math.max(
        1,
        Math.round(Number(deliveryPackageCount ?? 1) || 1)
      ),
      isActive: true,
      marketSettings: {
        FR: {
          isActive: true,
        },
      },
      applyVAT: true,
      markets: ["FR"],
      pricesByMarket: { FR: Number(priceHT) },
      currencyByMarket: { FR: "EUR" },
      price: { eur: Number(priceHT) },
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      { ok: true, id: docRef.id },
      { status: 201 }
    );
  } catch (e) {
    console.error("❌ PRODUCT CREATE ERROR:", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
