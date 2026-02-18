import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text };
  }
}

function getAuthHeader() {
  const key = process.env.SHIPSTATION_API_KEY;
  const secret = process.env.SHIPSTATION_API_SECRET;
  if (!key || !secret) throw new Error("Missing ShipStation env vars");
  const token = Buffer.from(`${key}:${secret}`).toString("base64");
  return `Basic ${token}`;
}

/**
 * Sécurise le webhook avec un token dans l'URL:
 * /api/shipstation/webhook?token=XXXX
 */
function checkToken(req: Request) {
  const expected = process.env.SHIPSTATION_WEBHOOK_TOKEN;
  if (!expected) return true; // si tu ne l'as pas mis, on laisse passer (dev)
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  return token === expected;
}

export async function POST(req: Request) {
  const requestId = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  console.log(`\n🟦 [shipstation:webhook] START requestId=${requestId}`);

  try {
    if (!checkToken(req)) {
      console.warn(`🟨 [${requestId}] Invalid webhook token`);
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const event = await req.json();
    console.log(`📩 [${requestId}] webhook event:`, event);

    // ShipStation webhook contient généralement resource_url
    const resourceUrl =
      event?.resource_url || event?.resourceUrl || event?.resource_url?.href;

    if (!resourceUrl || typeof resourceUrl !== "string") {
      console.warn(`🟨 [${requestId}] Missing resource_url in webhook payload`);
      return NextResponse.json({ ok: true, ignored: true, requestId });
    }

    console.log(`🌐 [${requestId}] fetching resource_url=${resourceUrl}`);

    const res = await fetch(resourceUrl, {
      method: "GET",
      headers: { Authorization: getAuthHeader() },
      cache: "no-store",
    });

    const text = await res.text();
    console.log(`🌐 [${requestId}] resource status=${res.status}`);
    if (text) console.log(`🌐 [${requestId}] resource body (trunc):`, text.slice(0, 1200));

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "ShipStation resource fetch failed", status: res.status, body: text.slice(0, 2000), requestId },
        { status: 502 }
      );
    }

    const resource = safeJsonParse(text);

    // Selon le webhook, ça peut renvoyer un "shipment" ou des infos order/label.
    // On tente de retrouver orderNumber/orderKey + tracking.
    const orderNumber =
      resource?.orderNumber ||
      resource?.order?.orderNumber ||
      resource?.order?.orderKey ||
      resource?.orderKey;

    const trackingNumber =
      resource?.trackingNumber ||
      resource?.shipment?.trackingNumber ||
      resource?.tracking_number ||
      resource?.shipment?.tracking_number;

    const carrier =
      resource?.carrierCode ||
      resource?.shipment?.carrierCode ||
      resource?.carrier ||
      resource?.shipment?.carrier;

    const shipDate =
      resource?.shipDate ||
      resource?.shipment?.shipDate ||
      new Date().toISOString();

    console.log(`🔎 [${requestId}] extracted:`, {
      orderNumber,
      trackingNumber,
      carrier,
      shipDate,
    });

    if (!orderNumber || typeof orderNumber !== "string") {
      console.warn(`🟨 [${requestId}] Could not extract orderNumber/orderKey`);
      return NextResponse.json({ ok: true, ignored: true, requestId });
    }

    // Chez toi orderNumber = orderId Firestore
    const firestoreOrderId = orderNumber;

    console.log(`📝 [${requestId}] updating Firestore orders/${firestoreOrderId}`);

    await dbAdmin.collection("orders").doc(firestoreOrderId).set(
      {
        fulfillment: {
          status: "shipped",
          tracking: {
            trackingNumber: trackingNumber ?? null,
            carrier: carrier ?? null,
            shipDate: shipDate ?? null,
          },
          updatedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    console.log(`🟩 [shipstation:webhook] DONE requestId=${requestId}`);
    return NextResponse.json({ ok: true, requestId });
  } catch (e: any) {
    console.error(`🟥 [shipstation:webhook] ERROR requestId=${requestId}`, e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error", requestId },
      { status: 500 }
    );
  }
}
