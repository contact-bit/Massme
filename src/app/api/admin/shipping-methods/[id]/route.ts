import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

// ⚠️ IMPORTANT : params est une Promise dans Next 16
type Context = {
  params: Promise<{ id: string }>;
};

// PATCH → modifier une méthode
export async function PATCH(req: Request, context: Context) {
  try {
    // On "unwrap" la Promise
    const { id } = await context.params;

    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      console.error("❌ [shipping PATCH] Body JSON invalide ou manquant:", e);
      return NextResponse.json(
        { ok: false, error: "Corps JSON invalide ou manquant" },
        { status: 400 }
      );
    }

    const { data } = body || {};

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Données manquantes (data)" },
        { status: 400 }
      );
    }

    console.log("🛠 [shipping PATCH] id =", id);
    console.log("🛠 [shipping PATCH] data =", data);

    await dbAdmin.collection("shipping_methods").doc(id).update(data);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("❌ Error updating shipping_method:", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// DELETE → supprimer une méthode
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    console.log("🛠 [shipping DELETE] id =", id);

    await dbAdmin.collection("shipping_methods").doc(id).delete();

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("❌ Error deleting shipping_method:", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
