// src/app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

type Market = "FR" | "BE" | "DE" | "AT" | "ES" | "IT" | "NL" | "PT" | "CH";
const MARKETS: Market[] = ["FR", "BE", "DE", "AT", "ES", "IT", "NL", "PT", "CH"];

function isMarket(x: any): x is Market {
  return typeof x === "string" && (MARKETS as string[]).includes(x);
}

export async function GET(req: Request) {
  try {
    // ✅ Security check
    const headerPwd = req.headers.get("x-admin-password") || "";
    const envPwd = process.env.ADMIN_PASSWORD || "";

    if (!envPwd) {
      return NextResponse.json(
        { ok: false, error: "ADMIN_PASSWORD non configuré côté serveur" },
        { status: 500 }
      );
    }
    if (!headerPwd || headerPwd !== envPwd) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Optional filter market
    const url = new URL(req.url);
    const marketParam = url.searchParams.get("market");
    const market = marketParam && isMarket(marketParam) ? marketParam : null;

    const snap = await dbAdmin.collection("products").get();

    let products = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // if market specified, filter by markets[] (fallback legacy: no markets => FR)
    if (market) {
      products = products.filter((p) => {
        const m = Array.isArray(p.markets) ? p.markets : ["FR"];
        return m.includes(market);
      });
    }

    // Option: sort stable (updatedAt desc if exists)
    products.sort((a, b) => {
      const ta = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const tb = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return tb - ta;
    });

    return NextResponse.json({ ok: true, products }, { status: 200 });
  } catch (e) {
    console.error("❌ Error loading products:", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
