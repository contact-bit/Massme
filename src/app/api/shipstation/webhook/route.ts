import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { isShipStationEnabled } from "@/server/logistics/settings";
import { buildShipStationShippedUpdate } from "@/server/logistics/updates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  if (!key || !secret) {
    throw new Error("Missing SHIPSTATION_API_KEY or SHIPSTATION_API_SECRET");
  }
  const token = Buffer.from(`${key}:${secret}`).toString("base64");
  return `Basic ${token}`;
}

/**
 * Sécurise le webhook avec un token dans l'URL:
 * /api/shipstation/webhook?token=XXXX
 */
function checkToken(req: Request) {
  const expected = process.env.SHIPSTATION_WEBHOOK_TOKEN;
  if (!expected) return true; // dev: si non défini, on laisse passer
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  return token === expected;
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

export async function POST(req: Request) {
  const requestId = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  console.log(`\n🟦 [shipstation:webhook] START requestId=${requestId}`);

  try {
    if (!checkToken(req)) {
      console.warn(`🟨 [${requestId}] Invalid webhook token`);
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const enabled = await isShipStationEnabled();

    if (!enabled) {
      console.warn(`🟨 [${requestId}] ShipStation disabled by logistics provider setting`);
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: "shipstation_disabled",
        requestId,
      });
    }

    const event = await req.json();
    console.log(`📩 [${requestId}] webhook event:`, event);

    const resourceUrl =
      event?.resource_url || event?.resourceUrl || event?.resource_url?.href;

    if (!resourceUrl || typeof resourceUrl !== "string") {
      console.warn(`🟨 [${requestId}] Missing resource_url in webhook payload`);
      return NextResponse.json({ ok: true, ignored: true, requestId });
    }

    console.log(`🌐 [${requestId}] fetching resource_url=${resourceUrl}`);

    const res = await fetch(resourceUrl, {
      method: "GET",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();
    console.log(`🌐 [${requestId}] resource status=${res.status}`);
    if (text) {
      console.log(`🌐 [${requestId}] resource body (trunc):`, text.slice(0, 1200));
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "ShipStation resource fetch failed",
          status: res.status,
          body: text.slice(0, 2000),
          requestId,
        },
        { status: 502 }
      );
    }

    const resource = safeJsonParse(text);

    const orderNumber =
      asString(resource?.orderNumber) ||
      asString(resource?.order?.orderNumber) ||
      asString(resource?.order?.orderKey) ||
      asString(resource?.orderKey);

    const trackingNumber =
      asString(resource?.trackingNumber) ||
      asString(resource?.shipment?.trackingNumber) ||
      asString(resource?.tracking_number) ||
      asString(resource?.shipment?.tracking_number);

    const carrier =
      asString(resource?.carrierCode) ||
      asString(resource?.shipment?.carrierCode) ||
      asString(resource?.carrier) ||
      asString(resource?.shipment?.carrier);

    const shipDate =
      asString(resource?.shipDate) ||
      asString(resource?.shipment?.shipDate) ||
      new Date().toISOString();

    console.log(`🔎 [${requestId}] extracted:`, {
      orderNumber,
      trackingNumber,
      carrier,
      shipDate,
    });

    if (!orderNumber) {
      console.warn(`🟨 [${requestId}] Could not extract orderNumber/orderKey`);
      return NextResponse.json({ ok: true, ignored: true, requestId });
    }

    const firestoreOrderId = orderNumber;

    console.log(`📝 [${requestId}] updating Firestore orders/${firestoreOrderId}`);

    const updates = buildShipStationShippedUpdate({
      orderNumber: firestoreOrderId,
      trackingNumber: trackingNumber ?? null,
      carrier: carrier ?? null,
      shipDate: shipDate ?? null,
    });

    await dbAdmin.collection("orders").doc(firestoreOrderId).set(updates, {
      merge: true,
    });

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