import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

// ⚠️ IMPORTANT : params est une Promise dans Next 16
type Context = {
  params: Promise<{ id: string }>;
};

// PATCH → modifier une méthode (MULTI-PAYS)
export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      console.error("❌ [shipping PATCH] JSON invalide:", e);
      return NextResponse.json(
        { ok: false, error: "JSON invalide ou manquant" },
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

    // 🔒 NORMALISATION COUNTRIES (si présent)
    let countries;
    if (Array.isArray(data.countries)) {
      countries = data.countries.map((c: any) => ({
        code: String(c.code),
        priceHT: Number(c.priceHT ?? 0),
        vatRate:
          typeof c.vatRate === "number" ? c.vatRate : undefined,
        isActive: c.isActive ?? true,
      }));
    }

    // 🔒 PAYLOAD CONTRÔLÉ
    const payload: any = {
      ...(data.name && {
        name: {
          fr: data.name.fr ?? "",
          en: data.name.en ?? "",
        },
      }),

      ...(data.delay && {
        delay: {
          fr: data.delay.fr ?? "",
          en: data.delay.en ?? "",
        },
      }),

      ...(data.type && { type: data.type }),

      ...(data.relayProvider !== undefined && {
        relayProvider: data.relayProvider,
      }),

      ...(typeof data.isActive === "boolean" && {
        isActive: data.isActive,
      }),

      ...(countries && { countries }),

      updatedAt: new Date(),
    };

    console.log("🛠 [shipping PATCH] id =", id);
    console.log("🛠 [shipping PATCH] payload =", payload);

    await dbAdmin
      .collection("shipping_methods")
      .doc(id)
      .update(payload);

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
