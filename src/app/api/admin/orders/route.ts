import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function assertAdmin(req: Request) {
  const pass = req.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || pass !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// Essaye plusieurs collections possibles
const CANDIDATE_COLLECTIONS = ["pending_orders", "orders", "orders_v2", "payments", "checkout_orders"];

async function tryReadCollection(name: string) {
  // Pas de orderBy => pas de soucis de champ missing / index
  const snap = await dbAdmin.collection(name).limit(50).get();
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { name, count: docs.length, docs };
}

export async function GET(req: Request) {
  const auth = assertAdmin(req);
  if (auth) return auth;

  try {
    const results = [];
    for (const col of CANDIDATE_COLLECTIONS) {
      try {
        const r = await tryReadCollection(col);
        results.push({
          collection: r.name,
          count: r.count,
          sample: r.docs.slice(0, 3).map((o: any) => ({
            id: o.id,
            email: o.email ?? o.shippingAddress?.email ?? null,
            status: o.status ?? null,
            createdAt: o.createdAt ?? null,
            hasItems: Array.isArray(o.items) ? o.items.length : 0,
          })),
        });

        // Si on trouve une collection non vide => on la renvoie directement en "orders"
        if (r.count > 0) {
          return NextResponse.json({
            ok: true,
            pickedCollection: r.name,
            counts: results,
            orders: r.docs,
          });
        }
      } catch (e: any) {
        results.push({
          collection: col,
          error: e?.message || String(e),
        });
      }
    }

    // Rien trouvé
    return NextResponse.json(
      {
        ok: false,
        message: "Aucune commande trouvée dans les collections candidates.",
        counts: results,
        hint:
          "Soit tu écris dans une autre collection, soit tu lis le mauvais projet Firebase en prod (env Vercel).",
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Orders debug failed", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
