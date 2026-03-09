import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { isShipStationEnabled } from "@/server/logistics/settings";
import { buildShipStationPreparingUpdate } from "@/server/logistics/updates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function assertAdmin(req: Request) {
  const pass = req.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected || pass !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function money(n: any): number {
  const v = typeof n === "number" ? n : typeof n === "string" ? Number(n) : 0;
  return Number.isFinite(v) ? v : 0;
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text };
  }
}

function mask(s?: string) {
  if (!s) return "MISSING";
  if (s.length <= 6) return "***";
  return `${s.slice(0, 3)}***${s.slice(-3)}`;
}

export async function POST(req: Request) {
  const authError = assertAdmin(req);
  if (authError) return authError;

  const requestId = `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  console.log(`\n🟦 [shipstation:push-order] START requestId=${requestId}`);

  try {
    const enabled = await isShipStationEnabled();

    if (!enabled) {
      console.warn(`🟨 [${requestId}] ShipStation disabled by logistics provider setting`);
      return NextResponse.json(
        {
          ok: false,
          error: "shipstation_disabled",
          message: "ShipStation is disabled. Current logistics provider is internal.",
          requestId,
        },
        { status: 409 }
      );
    }

    // --- 1) ENV CHECK ---
    const apiKey = process.env.SHIPSTATION_API_KEY;
    const apiSecret = process.env.SHIPSTATION_API_SECRET;

    console.log(
      `🧪 [${requestId}] env SHIPSTATION_API_KEY=${mask(apiKey)} SHIPSTATION_API_SECRET=${mask(apiSecret)}`
    );

    if (!apiKey || !apiSecret) {
      console.error(`🟥 [${requestId}] Missing ShipStation env vars`);
      return NextResponse.json(
        {
          error: "Missing SHIPSTATION_API_KEY / SHIPSTATION_API_SECRET",
          requestId,
        },
        { status: 500 }
      );
    }

    // --- 2) PARSE BODY ---
    let body: any = null;
    try {
      body = await req.json();
    } catch (e: any) {
      console.error(`🟥 [${requestId}] Invalid JSON body`, e?.message);
      return NextResponse.json(
        { error: "Invalid JSON body", requestId },
        { status: 400 }
      );
    }

    const orderId = body?.orderId;
    console.log(`📥 [${requestId}] body.orderId=${orderId}`);

    if (!orderId || typeof orderId !== "string") {
      console.error(`🟥 [${requestId}] Missing/invalid orderId`);
      return NextResponse.json(
        { error: "Missing or invalid orderId", requestId },
        { status: 400 }
      );
    }

    // --- 3) DB CHECK ---
    console.log(
      `🧩 [${requestId}] dbAdmin exists=${!!dbAdmin} hasCollectionFn=${typeof (dbAdmin as any)?.collection === "function"}`
    );

    // --- 4) LOAD ORDER ---
    console.log(`📦 [${requestId}] fetching Firestore orders/${orderId}`);
    const snap = await dbAdmin.collection("orders").doc(orderId).get();

    console.log(`📦 [${requestId}] order exists=${snap.exists}`);

    if (!snap.exists) {
      return NextResponse.json(
        { error: "Order not found", orderId, requestId },
        { status: 404 }
      );
    }

    const order = snap.data() as any;
    if (!order) {
      return NextResponse.json(
        { error: "Order document empty", orderId, requestId },
        { status: 500 }
      );
    }

    console.log(`🧾 [${requestId}] order fields:`, {
      id: order.id,
      status: order.status,
      locale: order.locale,
      paymentProvider: order?.payment?.provider,
      shippingType: order?.shippingMethod?.type,
      shippingName: order?.shippingMethod?.name,
      hasRelay: !!order?.relayPoint,
      itemsCount: Array.isArray(order?.items) ? order.items.length : 0,
      totalTTC: order?.totals?.totalTTC,
    });

    // ---- Adresses (TON schéma) ----
    const billing = order.billingAddress ?? {};
    const shipping = order.shippingAddress ?? {};
    const relayPoint = order.relayPoint ?? null;
    const shippingMethod = order.shippingMethod ?? {};

    const customerName =
      billing.name ||
      `${billing.firstName ?? ""} ${billing.lastName ?? ""}`.trim() ||
      `${shipping.firstName ?? ""} ${shipping.lastName ?? ""}`.trim() ||
      "Customer";

    const customerEmail = order.email ?? null;
    const customerPhone =
      order.phone ?? billing.phone ?? shipping.phone ?? null;

    // ShipTo : si relay -> adresse du point relais, sinon adresse shipping
    const isRelay = shippingMethod?.type === "relay" && relayPoint?.address;

    console.log(`🚚 [${requestId}] isRelay=${isRelay}`);

    const shipTo = isRelay
      ? {
          name: customerName,
          company: relayPoint?.name ?? "Relay Point",
          street1: relayPoint?.address ?? "",
          street2: relayPoint?.address2 ?? "",
          city: relayPoint?.city ?? "",
          state: "",
          postalCode: relayPoint?.postalCode ?? "",
          country: relayPoint?.country ?? "FR",
          phone: customerPhone,
          residential: false,
        }
      : {
          name:
            shipping.name ||
            `${shipping.firstName ?? ""} ${shipping.lastName ?? ""}`.trim() ||
            customerName,
          company: "",
          street1: shipping.address ?? "",
          street2: "",
          city: shipping.city ?? "",
          state: "",
          postalCode: shipping.postalCode ?? "",
          country: shipping.country ?? "FR",
          phone: shipping.phone ?? customerPhone,
          residential: true,
        };

    const billTo = {
      name: customerName,
      company: "",
      street1: billing.address ?? "",
      street2: "",
      city: billing.city ?? "",
      state: "",
      postalCode: billing.postalCode ?? "",
      country: billing.country ?? "FR",
      phone: billing.phone ?? customerPhone,
      residential: true,
    };

    console.log(`🏠 [${requestId}] billTo:`, {
      name: billTo.name,
      city: billTo.city,
      postalCode: billTo.postalCode,
      country: billTo.country,
    });

    console.log(`📮 [${requestId}] shipTo:`, {
      name: shipTo.name,
      company: shipTo.company,
      city: shipTo.city,
      postalCode: shipTo.postalCode,
      country: shipTo.country,
    });

    // ---- Items ----
    const items = (order.items ?? []).map((it: any, idx: number) => {
      const qty = Math.max(1, Number(it.quantity ?? 1));
      const totalTtc = money(it?.lineTotals?.ttc);
      const unitPrice =
        totalTtc ? totalTtc / qty : money(it.priceTTC) || money(it.priceHT);

      return {
        lineItemKey: `${orderId}_${idx}`,
        sku: it.id ?? null,
        name: it.name ?? "Item",
        quantity: qty,
        unitPrice: Number(unitPrice.toFixed(2)),
        imageUrl: it.imageUrl ?? null,
      };
    });

    console.log(`🛒 [${requestId}] items preview:`, items.slice(0, 3));

    // Totaux
    const shippingAmount =
      money(order?.totals?.shipHT) + money(order?.totals?.shipVAT);
    const taxAmount = money(order?.totals?.totalVAT);
    const amountPaid = money(order?.totals?.totalTTC);

    console.log(`💶 [${requestId}] totals:`, {
      shippingAmount,
      taxAmount,
      amountPaid,
    });

    // orderDate
    const orderDate =
      order?.createdAt?.toDate && typeof order.createdAt.toDate === "function"
        ? order.createdAt.toDate()
        : new Date();

    // ---- Payload ShipStation ----
    const payload = {
      orderKey: orderId,
      orderNumber: orderId,
      orderDate: new Date(orderDate).toISOString(),
      orderStatus: "awaiting_shipment",
      customerEmail,

      billTo,
      shipTo,
      items,

      amountPaid,
      taxAmount,
      shippingAmount,

      customerNotes: isRelay
        ? `Relay: ${relayPoint?.name ?? ""} (${relayPoint?.id ?? ""})`
        : null,

      advancedOptions: {
        customField1: order?.shippingMethod?.name ?? null,
        customField2: isRelay ? `relay:${relayPoint?.id ?? ""}` : null,
        customField3: order?.payment?.provider ?? null,
      },
    };

    console.log(`📤 [${requestId}] ShipStation payload summary:`, {
      orderKey: payload.orderKey,
      orderStatus: payload.orderStatus,
      customerEmail: payload.customerEmail,
      itemsCount: payload.items.length,
      shipToCountry: payload.shipTo.country,
      shipToPostalCode: payload.shipTo.postalCode,
      shippingAmount: payload.shippingAmount,
      taxAmount: payload.taxAmount,
      amountPaid: payload.amountPaid,
    });

    // --- 5) CALL SHIPSTATION ---
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    console.log(`🌐 [${requestId}] calling ShipStation /orders/createorder ...`);

    const res = await fetch("https://ssapi.shipstation.com/orders/createorder", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await res.text();

    console.log(`🌐 [${requestId}] ShipStation response status=${res.status}`);
    if (text) {
      console.log(
        `🌐 [${requestId}] ShipStation response body (trunc):`,
        text.slice(0, 800)
      );
    }

    if (!res.ok) {
      console.error(`🟥 [${requestId}] ShipStation not ok`);
      return NextResponse.json(
        {
          error: "ShipStation error",
          status: res.status,
          shipstationBody: text?.slice(0, 2000) ?? "",
          requestId,
        },
        { status: 502 }
      );
    }

    const ss = text ? safeJsonParse(text) : {};

    console.log(`✅ [${requestId}] ShipStation parsed:`, {
      orderId: ss?.orderId,
      orderNumber: ss?.orderNumber,
      orderKey: ss?.orderKey,
    });

    // --- 6) UPDATE FIRESTORE ---
    console.log(`📝 [${requestId}] updating Firestore fulfillment...`);

    const updates = buildShipStationPreparingUpdate({
      shipstationOrderId: ss?.orderId ?? null,
      shipstationOrderKey: orderId,
    });

    await dbAdmin.collection("orders").doc(orderId).set(updates, {
      merge: true,
    });

    console.log(`🟩 [shipstation:push-order] DONE requestId=${requestId}`);

    return NextResponse.json({ ok: true, shipstation: ss, requestId });
  } catch (e: any) {
    console.error(`🟥 [shipstation:push-order] UNCAUGHT requestId=${requestId}`, e);

    return NextResponse.json(
      {
        error: e?.message ?? "Server error",
        requestId,
        hint: "Check server console for stacktrace (dbAdmin import / env / ShipStation response).",
      },
      { status: 500 }
    );
  }
}