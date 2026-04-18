// src/server/orders/loadOrdersForExport.ts

import { dbAdmin } from "@/lib/firebase.admin";

/* =========================================================
   DATE HELPERS (ULTRA SAFE)
========================================================= */

function parseDate(v: any): Date | null {
  if (!v) return null;

  // Firestore Timestamp
  if (typeof v?.toDate === "function") {
    try {
      return v.toDate();
    } catch {}
  }

  // Firestore raw object {_seconds}
  if (v?._seconds) {
    return new Date(v._seconds * 1000);
  }

  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function getOrderDate(order: any): Date | null {
  return (
    parseDate(order.createdAt) ||
    parseDate(order.paidAt) ||
    parseDate(order.updatedAt) ||
    null
  );
}

/* =========================================================
   MAIN
========================================================= */

export async function loadOrdersForExport() {
  try {
    console.log("🔥 LOAD ORDERS EXPORT");

    // ✅ ON PREND UNIQUEMENT LES VRAIES COMMANDES
    const snap = await dbAdmin
      .collection("orders")
      .limit(500)
      .get();

    console.log("📦 FIRESTORE ORDERS:", snap.size);

    const orders: any[] = [];

    snap.forEach((doc) => {
      const data = doc.data();

      const order = {
        id: doc.id,
        ...data,
      };

      const date = getOrderDate(order);

      // 🔥 FILTRE DIRECT : on ignore les commandes sans date
      if (!date) {
        console.warn("⚠️ ORDER WITHOUT DATE:", doc.id);
        return;
      }

      orders.push(order);
    });

    console.log("✅ VALID ORDERS:", orders.length);

    // 🔥 TRI (plus récent → ancien)
    orders.sort((a, b) => {
      const da = getOrderDate(a)!.getTime();
      const db = getOrderDate(b)!.getTime();
      return db - da;
    });

    // 🔍 DEBUG IMPORTANT
    if (orders.length > 0) {
      console.log("🧪 FIRST ORDER:", {
        id: orders[0].id,
        date: getOrderDate(orders[0]),
      });
    }

    return orders;
  } catch (err) {
    console.error("❌ loadOrdersForExport ERROR:", err);
    return [];
  }
}