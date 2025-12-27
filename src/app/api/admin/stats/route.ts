import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export const dynamic = "force-dynamic";

type AnyOrder = Record<string, any>;

function getNumber(v: any) {
  return typeof v === "number" ? v : Number(v ?? 0);
}

function computeOrderTotal(order: AnyOrder) {
  // Cas 1: total déjà présent
  if (typeof order.total === "number") return order.total;

  // Cas 2: Stripe amount_total en centimes
  if (typeof order.amount_total === "number") return order.amount_total / 100;

  // Cas 3: recalcul items + shipping
  const subtotal =
    order.items?.reduce((sum: number, item: any) => {
      const price =
        typeof item.price === "number"
          ? item.price
          : typeof item.price?.eur === "number"
          ? item.price.eur
          : 0;

      const qty = typeof item.quantity === "number" ? item.quantity : 1;
      return sum + price * qty;
    }, 0) ?? 0;

  const shipping =
    typeof order.shippingMethod?.price === "number"
      ? order.shippingMethod.price
      : getNumber(order.shippingMethod?.price?.eur);

  return subtotal + shipping;
}

export async function GET() {
  try {
    // ✅ adapte ici si besoin
    const ORDERS_COL = "pending_orders";

    // Products
    const productsSnap = await dbAdmin.collection("products").get();
    const products = productsSnap.size;

    // Orders (all)
    const ordersSnap = await dbAdmin.collection(ORDERS_COL).get();
    const orders = ordersSnap.size;

    // Paid orders
    const paidSnap = await dbAdmin
      .collection(ORDERS_COL)
      .where("status", "==", "paid")
      .get();
    const paidOrders = paidSnap.size;

    // Revenue from paid orders
    let revenue = 0;
    paidSnap.forEach((doc) => {
      revenue += computeOrderTotal(doc.data());
    });

    return NextResponse.json({
      products,
      orders,
      paidOrders,
      revenue,
    });
  } catch (e: any) {
    console.error("❌ /api/admin/stats error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to compute stats" },
      { status: 500 }
    );
  }
}
