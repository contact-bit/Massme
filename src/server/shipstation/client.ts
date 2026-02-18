// src/server/shipstation/client.ts

type ShipStationAddress = {
  name?: string;
  company?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
};

export type ShipStationOrderInput = {
  orderNumber: string;
  orderDate: string; // ISO string
  orderStatus?: "awaiting_shipment" | "on_hold" | "shipped" | "cancelled";
  customerEmail?: string;
  billTo?: ShipStationAddress;
  shipTo: ShipStationAddress;
  items: Array<{
    sku?: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
};

function getAuthHeader() {
  const key = process.env.SHIPSTATION_API_KEY;
  const secret = process.env.SHIPSTATION_API_SECRET;
  if (!key || !secret) {
    throw new Error(
      "Missing SHIPSTATION_API_KEY or SHIPSTATION_API_SECRET in environment variables."
    );
  }
  const token =
    typeof Buffer !== "undefined"
      ? Buffer.from(`${key}:${secret}`).toString("base64")
      : btoa(`${key}:${secret}`);
  return `Basic ${token}`;
}

async function shipstationFetch(path: string, init?: RequestInit) {
  const baseUrl =
    process.env.SHIPSTATION_BASE_URL?.replace(/\/$/, "") ||
    "https://ssapi.shipstation.com";

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    // On évite le cache en server env
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `ShipStation API error (${res.status}) on ${path}: ${text || res.statusText}`
    );
  }

  // Certaines routes peuvent répondre vide
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

/**
 * Crée (ou met à jour si même orderNumber) une commande ShipStation.
 * ShipStation "upsert" généralement par orderNumber.
 */
export async function createOrUpdateOrder(order: ShipStationOrderInput) {
  // Endpoint ShipStation classique: POST /orders/createorder
  // (ShipStation gère l’upsert avec orderNumber selon config / comportement attendu)
  return shipstationFetch("/orders/createorder", {
    method: "POST",
    body: JSON.stringify(order),
  });
}
