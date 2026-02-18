import { NextResponse } from "next/server";
import { createOrUpdateOrder } from "@/server/shipstation/client";
import { dbAdmin } from "@/lib/firebase.admin";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const doc = await dbAdmin.collection("orders").doc(orderId).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = doc.data();

    if (!order) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }

    const body = {
      orderKey: orderId, // CRITIQUE → idempotence / mapping stable
      orderNumber: orderId,
      orderDate: new Date().toISOString(),
      orderStatus: "awaiting_shipment",

      customerEmail: order.customer?.email ?? null,

      billTo: {
        name: `${order.billing?.firstName ?? ""} ${order.billing?.lastName ?? ""}`,
        street1: order.billing?.address1 ?? "",
        city: order.billing?.city ?? "",
        postalCode: order.billing?.postalCode ?? "",
        country: order.billing?.country ?? "FR",
        phone: order.billing?.phone ?? null,
      },

      shipTo: {
        name: `${order.shipping?.firstName ?? ""} ${order.shipping?.lastName ?? ""}`,
        street1: order.shipping?.address1 ?? "",
        city: order.shipping?.city ?? "",
        postalCode: order.shipping?.postalCode ?? "",
        country: order.shipping?.country ?? "FR",
        phone: order.shipping?.phone ?? null,
      },

      items: (order.items ?? []).map((item: any, i: number) => ({
        lineItemKey: `${orderId}_${i}`,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        sku: item.sku ?? null,
      })),

      amountPaid: order.totals?.total ?? 0,
    };

    const ssOrder = await createOrUpdateOrder(body);

    await dbAdmin.collection("orders").doc(orderId).set(
      {
        fulfillment: {
          status: "preparing",
          shipstation: {
            orderKey: orderId,
            orderId: ssOrder.orderId,
          },
          updatedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, shipstation: ssOrder });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
