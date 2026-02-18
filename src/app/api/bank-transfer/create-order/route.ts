import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ref = dbAdmin.collection("orders").doc();
    const reference = `MM-${Date.now()}`;

    await ref.set({
      createdAt: new Date(),
      status: "pending_payment",
      paymentProvider: "bank_transfer",
      reference,

      locale: body.locale,
      items: body.items,

      billingCustomer: body.billingCustomer,
      shippingCustomer: body.shippingCustomer,

      shippingMethod: body.shippingMethod ?? null,
      relayPoint: body.relayPoint ?? null,

      heardFrom: body.heardFrom ?? null,
      heardFromOther: body.heardFromOther ?? null,
    });

    return NextResponse.json({ ok: true, orderId: ref.id, reference });
  } catch (e) {
    console.error("BANK TRANSFER CREATE ORDER ERROR", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
