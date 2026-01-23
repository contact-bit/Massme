import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

// GET → liste des méthodes
export async function GET() {
  try {
    const snap = await dbAdmin.collection("shipping_methods").get();

    const methods = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ ok: true, methods });
  } catch (e) {
    console.error("❌ Error loading shipping_methods:", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// POST → créer une méthode (PAR PAYS)
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

    // 🔒 VALIDATION MINIMALE
    if (
      !data.country ||
      !data.name ||
      !data.delay ||
      !data.type ||
      typeof data.priceHT !== "number" ||
      typeof data.vatRate !== "number"
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid shipping method format" },
        { status: 400 }
      );
    }

    const payload = {
      country: data.country,

      name: {
        fr: data.name.fr ?? "",
        en: data.name.en ?? "",
      },

      delay: {
        fr: data.delay.fr ?? "",
        en: data.delay.en ?? "",
      },

      type: data.type,
      relayProvider: data.relayProvider ?? null,

      priceHT: Number(data.priceHT),
      vatRate: Number(data.vatRate),

      isActive: data.isActive ?? true,
      createdAt: new Date(),
    };

    const docRef = await dbAdmin
      .collection("shipping_methods")
      .add(payload);

    return NextResponse.json({
      ok: true,
      id: docRef.id,
      method: { id: docRef.id, ...payload },
    });
  } catch (e) {
    console.error("❌ Error creating shipping_method:", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
