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

// POST → créer une méthode
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

    const docRef = await dbAdmin.collection("shipping_methods").add(data);
    const created = await docRef.get();

    return NextResponse.json({
      ok: true,
      id: docRef.id,
      method: { id: docRef.id, ...created.data() },
    });
  } catch (e) {
    console.error("❌ Error creating shipping_method:", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
