// src/app/api/admin/products/[id]/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ⬅️ Next 16 : params est une Promise
    const { id } = await context.params;

    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      console.error("❌ Body JSON invalide ou manquant:", e);
      return NextResponse.json(
        { error: "Corps JSON invalide ou manquant" },
        { status: 400 }
      );
    }

    const { data } = body || {};

    if (!data) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Admin SDK → bypass les règles Firestore client
    await dbAdmin.collection("products").doc(id).update(data);

    console.log("✅ Produit mis à jour avec succès");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("❌ Error updating product:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
