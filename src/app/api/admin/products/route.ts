// src/app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

type Market = "FR" | "BE" | "DE" | "AT" | "ES" | "IT" | "NL" | "PT" | "CH";
const MARKETS: Market[] = ["FR", "BE", "DE", "AT", "ES", "IT", "NL", "PT", "CH"];

function isMarket(x: any): x is Market {
  return typeof x === "string" && (MARKETS as string[]).includes(x);
}

/* ============================
   GET : liste des produits
============================ */
export async function GET(req: Request) {
  try {
    const headerPwd = req.headers.get("x-admin-password") || "";
    const envPwd = process.env.ADMIN_PASSWORD || "";

    if (!envPwd) {
      return NextResponse.json(
        { ok: false, error: "ADMIN_PASSWORD non configuré côté serveur" },
        { status: 500 }
      );
    }
    if (!headerPwd || headerPwd !== envPwd) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const marketParam = url.searchParams.get("market");
    const market = marketParam && isMarket(marketParam) ? marketParam : null;

    const snap = await dbAdmin.collection("products").get();

    let products = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // (optionnel) si tu veux cacher les soft-deleted :
    // products = products.filter((p) => p.isActive !== false);

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
    const headerPwd = req.headers.get("x-admin-password") || "";
    const envPwd = process.env.ADMIN_PASSWORD || "";

    if (!envPwd) {
      return NextResponse.json(
        { ok: false, error: "ADMIN_PASSWORD non configuré côté serveur" },
        { status: 500 }
      );
    }
    if (!headerPwd || headerPwd !== envPwd) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Données invalides" },
        { status: 400 }
      );
    }

    const { nameFr, descFr, priceHT, stock, imageUrl } = body as {
      nameFr?: string;
      descFr?: string;
      priceHT?: string | number;
      stock?: string | number;
      imageUrl?: string;
    };

    if (!nameFr || !priceHT || !stock) {
      return NextResponse.json(
        { ok: false, error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const docRef = await dbAdmin.collection("products").add({
      name: { fr: String(nameFr) },
      description: { fr: String(descFr || "") },
      imageUrl: imageUrl || null,
      stock: Number(stock),
      isActive: true,
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
