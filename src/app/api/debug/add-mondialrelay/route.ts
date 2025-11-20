import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export async function GET() {
  try {
    const doc = await dbAdmin.collection("shipping_methods").add({
      zone: "fr",
      isActive: true,

      type: "relay",
      relayProvider: "mondialrelay", // ⚠️ IMPORTANT

      name: {
        fr: "Mondial Relay – Point Relais",
        en: "Mondial Relay – Pickup Point",
      },

      delay: {
        fr: "3-5 jours",
        en: "3-5 days",
      },

      price: {
        fr: 4.90,
        en: 4.90,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Méthode Mondial Relay créée",
      id: doc.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
