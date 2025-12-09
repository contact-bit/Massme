import { NextRequest, NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/**
 * Petite fonction utilitaire pour vérifier le header x-admin-password
 */
function isAuthorized(req: NextRequest) {
  if (!ADMIN_PASSWORD) {
    console.error("❌ ADMIN_PASSWORD manquant dans l'environnement");
    return false;
  }
  const header = req.headers.get("x-admin-password") || "";
  return header === ADMIN_PASSWORD;
}

// 🧾 Récupérer la liste des commandes (orders + pending_orders)
export async function GET(req: NextRequest) {
  try {
    // 🔐 Check admin
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ordersSnap = await dbAdmin.collection("orders").get();
    const pendingSnap = await dbAdmin.collection("pending_orders").get();

    console.log("📦 orders count =", ordersSnap.size);
    console.log("⏳ pending_orders count =", pendingSnap.size);

    const ordersFromOrders = ordersSnap.docs.map((doc) => {
      const data = doc.data() as any;

      return {
        ...data,
        stripeSessionId: data.id ?? null,
        id: doc.id, // ID Firestore unique pour React
        source: "orders",
      };
    });

    const ordersFromPending = pendingSnap.docs.map((doc) => {
      const data = doc.data() as any;

      return {
        ...data,
        stripeSessionId: data.id ?? null,
        id: doc.id,
        source: "pending_orders",
      };
    });

    const orders = [...ordersFromOrders, ...ordersFromPending];

    console.log("✅ Total orders renvoyées à l'admin =", orders.length);

    return NextResponse.json({ orders });
  } catch (e) {
    console.error("Error loading orders:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// 🗑️ Supprimer une commande (id passé dans l'URL : ?id=...)
export async function DELETE(req: NextRequest) {
  try {
    // 🔐 Check admin
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }

    // 🔥 On essaie de supprimer dans les 2 collections.
    // Firestore delete() est idempotent : si le doc n'existe pas, ce n'est pas une erreur.
    await dbAdmin.collection("orders").doc(id).delete();
    await dbAdmin.collection("pending_orders").doc(id).delete();

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error deleting order:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
