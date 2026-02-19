import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

// ---- Cache mémoire (par instance serveur) ----
type CacheEntry = { expiresAt: number; data: any };
const CACHE_TTL_MS = 15_000; // 15s : assez pour éviter spam, assez court pour rester "live"
const cache = new Map<string, CacheEntry>();

// ---- Backoff si ShipStation rate-limit ----
let globalBackoffUntil = 0; // timestamp ms

function now() {
  return Date.now();
}

function getAuthHeader() {
  const key = process.env.SHIPSTATION_API_KEY;
  const secret = process.env.SHIPSTATION_API_SECRET;
  if (!key || !secret) {
    throw new Error("Missing SHIPSTATION_API_KEY / SHIPSTATION_API_SECRET");
  }
  return `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
}

async function shipstationFetch(path: string) {
  const baseUrl = (process.env.SHIPSTATION_BASE_URL || "https://ssapi.shipstation.com").replace(/\/$/, "");

  // Si on est en backoff global, on ne refait pas d'appel
  if (now() < globalBackoffUntil) {
    return { __rateLimited: true, __backoffMs: globalBackoffUntil - now() };
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: { Authorization: getAuthHeader(), "Content-Type": "application/json" },
    cache: "no-store",
  });

  const text = await res.text().catch(() => "");

  // ✅ 429: rate limit → on active backoff et on renvoie un objet spécial
  if (res.status === 429) {
    const retryAfterHeader = res.headers.get("retry-after");
    const retryAfterSec = retryAfterHeader ? Number(retryAfterHeader) : NaN;

    const backoffMs = Number.isFinite(retryAfterSec) && retryAfterSec > 0
      ? retryAfterSec * 1000
      : 30_000; // fallback 30s

    globalBackoffUntil = now() + backoffMs;

    return {
      __rateLimited: true,
      __backoffMs: backoffMs,
      __raw: text || null,
    };
  }

  if (!res.ok) {
    throw new Error(`ShipStation ${res.status} ${path}: ${text || res.statusText}`);
  }

  return text ? JSON.parse(text) : null;
}

export async function GET(req: Request, context: Context) {
  const requestId = `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  try {
    const { id } = await context.params;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    // ✅ Cache par orderId (évite spam UI)
    const cached = cache.get(id);
    if (cached && cached.expiresAt > now()) {
      return NextResponse.json({ ...cached.data, _cache: "hit", requestId });
    }

    const ref = dbAdmin.collection("orders").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });

    const order = snap.data() as any;

    const ssOrderId = order?.shipstation?.response?.orderId ?? null;
    const ssOrderNumber = order?.shipstation?.orderNumber ?? order?.orderNumber ?? id;

    // ---- Récupération order ShipStation ----
    let ssOrder: any = null;

    if (ssOrderId) {
      ssOrder = await shipstationFetch(`/orders/${ssOrderId}`);
    } else {
      const search = await shipstationFetch(`/orders?orderNumber=${encodeURIComponent(ssOrderNumber)}`);
      if (search?.__rateLimited) ssOrder = search;
      else ssOrder = Array.isArray(search?.orders) ? search.orders[0] : null;
    }

    // ✅ Si rate limited sur la requête order → on renvoie un statut "rate_limited" au front
    if (ssOrder?.__rateLimited) {
      const data = {
        ok: true,
        id,
        shipstation: {
          orderId: ssOrderId ?? null,
          orderNumber: ssOrderNumber,
          orderStatus: "rate_limited",
          shipments: [],
          backoffMs: ssOrder.__backoffMs ?? null,
        },
      };

      cache.set(id, { expiresAt: now() + CACHE_TTL_MS, data });
      return NextResponse.json({ ...data, _cache: "set(rate_limited)", requestId });
    }

    // ---- Shipments (tracking) ----
    let shipments: any[] = [];
    try {
      const shipRes = await shipstationFetch(`/shipments?orderNumber=${encodeURIComponent(ssOrderNumber)}`);

      // si rate limited sur shipments, on garde orderStatus mais on renvoie shipments vide + marqueur
      if (shipRes?.__rateLimited) {
        shipments = [];
      } else {
        shipments = Array.isArray(shipRes?.shipments) ? shipRes.shipments : [];
      }
    } catch {
      // non bloquant
    }

    const data = {
      ok: true,
      id,
      shipstation: {
        orderId: ssOrder?.orderId ?? ssOrderId ?? null,
        orderNumber: ssOrder?.orderNumber ?? ssOrderNumber,
        orderStatus: ssOrder?.orderStatus ?? null,
        shipments: shipments.map((s) => ({
          carrierCode: s?.carrierCode ?? null,
          serviceCode: s?.serviceCode ?? null,
          trackingNumber: s?.trackingNumber ?? null,
          shipDate: s?.shipDate ?? null,
          voided: Boolean(s?.voided),
        })),
      },
    };

    // ✅ cache
    cache.set(id, { expiresAt: now() + CACHE_TTL_MS, data });

    return NextResponse.json({ ...data, _cache: "set", requestId });
  } catch (e: any) {
    console.error("❌ GET ShipStation live error:", e);
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
