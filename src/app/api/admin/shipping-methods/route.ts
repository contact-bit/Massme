import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =====================================================
   GET → liste des méthodes (SOURCE DE VÉRITÉ)
===================================================== */
export async function GET() {
  try {
    const snap = await dbAdmin
      .collection("shipping_methods")
      .where("isActive", "==", true)
      .get();

    const methods = snap.docs.map((d) => {
      const data = d.data();

      return {
        id: d.id,

        name: data.name ?? {},
        delay: data.delay ?? {},

        // 🔒 SOURCE DE VÉRITÉ
        priceHT: Number(data.priceHT ?? 0),
        vatRate:
          typeof data.vatRate === "number" ? data.vatRate : 0,

        isActive: data.isActive ?? true,
        type: data.type ?? "home",
        relayProvider: data.relayProvider ?? null,
        country: data.country ?? null,
      };
    });

    return NextResponse.json(
      { ok: true, methods },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (e) {
    console.error("❌ Error loading shipping_methods:", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

/* =====================================================
   POST → créer une méthode
===================================================== */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.data) {
      return NextResponse.json(
        { ok: false, error: "Missing data" },
        { status: 400 }
      );
    }

    const { data } = body;

    const docRef = await dbAdmin
      .collection("shipping_methods")
      .add(data);

    const created = await docRef.get();

    return NextResponse.json(
      {
        ok: true,
        method: {
          id: docRef.id,
          ...created.data(),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (e) {
    console.error("❌ Error creating shipping_method:", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
