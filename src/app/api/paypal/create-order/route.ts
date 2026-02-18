// src/app/api/paypal/create-order/route.ts
import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import { getPayPalClient } from "@/lib/paypal-client";
import { dbAdmin } from "@/lib/firebase.admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CURRENCY = "EUR";

/**
 * TVA par pays (fallback).
 * -> Tu peux remplacer ça par une lecture BDD plus tard (collection "vatRates" par ex).
 */
const VAT_BY_COUNTRY: Record<string, number> = {
  FR: 20,
  BE: 21,
  DE: 19,
  ES: 21,
  IT: 22,
  NL: 21,
  PT: 23,
  IE: 23,
  AT: 20,
  LU: 17,
  // Hors UE / cas sans TVA
  CH: 0,
  GB: 0,
  US: 0,
  CA: 0,
};

function normalizeCountryCode(input: unknown): string {
  const s = String(input ?? "").trim().toUpperCase();
  return s.length === 2 ? s : "";
}

function toCents(n: unknown): number {
  return Math.round((Number(n) || 0) * 100);
}

function centsToMoney(cents: number): string {
  return (cents / 100).toFixed(2);
}

function safeInt(n: unknown, fallback = 0): number {
  const v = Number(n);
  return Number.isFinite(v) ? Math.trunc(v) : fallback;
}

// ✅ pour TVA / prix non entiers
function safeNumber(n: unknown, fallback = 0): number {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

function clampVatRate(rate: number): number {
  if (!Number.isFinite(rate)) return 0;
  if (rate < 0) return 0;
  if (rate > 100) return 100;
  return rate;
}

/**
 * Calcule TVA en centimes : round(HT * rate / 100)
 */
function vatFromHtCents(htCents: number, vatRate: number): number {
  const r = clampVatRate(vatRate);
  return Math.round((htCents * r) / 100);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;

    const locale = String(body?.locale || "fr");

    // Données commande (front)
    const items = Array.isArray(body?.items) ? body.items : [];

    const customerEmail = body?.email || body?.customerEmail || null;
    const customerPhone = body?.phone || body?.customerPhone || null;

    const billingAddress = body?.billingAddress || null;
    const shippingAddress = body?.shippingAddress || null;

    const shippingMethod = body?.shippingMethod || null;
    const relayPoint = body?.relayPoint || null;

    const heardFrom = body?.heardFrom || null;
    const heardFromOther = body?.heardFromOther || null;

    if (!items.length || !customerEmail || !shippingMethod || !shippingAddress) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Données manquantes (items/email/shippingMethod/shippingAddress).",
        },
        { status: 400 }
      );
    }

    // ---- Pays -> TVA fallback ----
    const countryCode =
      normalizeCountryCode(shippingAddress?.countryCode) ||
      normalizeCountryCode(shippingAddress?.country) ||
      normalizeCountryCode(billingAddress?.countryCode) ||
      normalizeCountryCode(billingAddress?.country);

    const defaultVatRate = VAT_BY_COUNTRY[countryCode] ?? 20;

    // ---- Recalcul serveur EN CENTIMES (ultra safe PayPal) ----
    let itemsHTCents = 0;
    let itemsVATCents = 0;

    const normalizedItems = items.map((it: any) => {
      const qty = Math.max(1, Math.floor(safeInt(it.quantity, 1)));

      // IMPORTANT: prix HT unitaire attendu
      const unitHT = safeNumber(it.priceHT ?? it.price ?? 0, 0);
      const unitHTCents = toCents(unitHT);

      const lineHTCents = unitHTCents * qty;

      // ✅ vatRate: si fourni -> on l’utilise, sinon fallback pays
      const rawVatRate =
        it?.vatRate !== undefined && it?.vatRate !== null && it?.vatRate !== ""
          ? safeNumber(it.vatRate, defaultVatRate)
          : defaultVatRate;

      const vatRate = clampVatRate(rawVatRate);
      const lineVATCents = vatFromHtCents(lineHTCents, vatRate);

      itemsHTCents += lineHTCents;
      itemsVATCents += lineVATCents;

      return {
        ...it,
        quantity: qty,
        priceHT: unitHT,
        vatRate,
        lineTotals: {
          ht: centsToMoney(lineHTCents),
          vat: centsToMoney(lineVATCents),
          ttc: centsToMoney(lineHTCents + lineVATCents),
        },
      };
    });

    // Livraison: SHIPPING en HT dans breakdown PayPal
    const shipHT = safeNumber(shippingMethod.priceHT ?? shippingMethod.price ?? 0, 0);
    const shipHTCents = toCents(shipHT);

    const rawShipVatRate =
      shippingMethod?.vatRate !== undefined &&
      shippingMethod?.vatRate !== null &&
      shippingMethod?.vatRate !== ""
        ? safeNumber(shippingMethod.vatRate, defaultVatRate)
        : defaultVatRate;

    const shipVatRate = clampVatRate(rawShipVatRate);
    const shipVATCents = vatFromHtCents(shipHTCents, shipVatRate);

    const totalHTCents = itemsHTCents + shipHTCents;
    const totalVATCents = itemsVATCents + shipVATCents;
    const totalTTCCents = totalHTCents + totalVATCents;

    if (!Number.isFinite(totalTTCCents) || totalTTCCents <= 0) {
      return NextResponse.json(
        { ok: false, error: "Total TTC invalide" },
        { status: 400 }
      );
    }

    // ---- 1) Crée la commande Firestore d’abord ----
    const orderRef = dbAdmin.collection("orders").doc();
    const orderDocId = orderRef.id;

    await orderRef.set(
      {
        id: orderDocId,
        locale,
        status: "pending",

        email: customerEmail,
        phone: customerPhone,

        heardFrom,
        heardFromOther,

        billingAddress,
        shippingAddress,

        items: normalizedItems,

        shippingMethod: {
          ...shippingMethod,
          priceHT: shipHT,
          vatRate: shipVatRate,
          priceTTC: Number(centsToMoney(shipHTCents + shipVATCents)),
        },

        relayPoint: relayPoint ?? null,

        totals: {
          countryCode: countryCode || null,
          defaultVatRate,

          itemsHT: Number(centsToMoney(itemsHTCents)),
          itemsVAT: Number(centsToMoney(itemsVATCents)),
          shipHT: Number(centsToMoney(shipHTCents)),
          shipVAT: Number(centsToMoney(shipVATCents)),

          totalHT: Number(centsToMoney(totalHTCents)),
          totalVAT: Number(centsToMoney(totalVATCents)),
          totalTTC: Number(centsToMoney(totalTTCCents)),
        },

        payment: {
          provider: "paypal",
          providerOrderId: null,
          captureId: null,
          status: "CREATED",
        },

        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // ---- 2) Crée l'order PayPal ----
    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");

    // ✅ Breakdown cohérent (PayPal):
    // item_total (HT produits) + shipping (HT) + tax_total (TVA totale) = amount.value (TTC)
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: "default",
          custom_id: orderDocId, // ✅ IMPORTANT (pour capture-order + emails)
          amount: {
            currency_code: CURRENCY,
            value: centsToMoney(totalTTCCents),
            breakdown: {
              item_total: { currency_code: CURRENCY, value: centsToMoney(itemsHTCents) },
              shipping: { currency_code: CURRENCY, value: centsToMoney(shipHTCents) },
              tax_total: { currency_code: CURRENCY, value: centsToMoney(totalVATCents) },
            },
          },
        },
      ],
    });

    const order = await client.execute(request);

    const paypalOrderId = order?.result?.id as string | undefined;
    if (!paypalOrderId) {
      console.error("[paypal/create-order] PayPal response without id:", order?.result);
      return NextResponse.json(
        { ok: false, error: "PayPal orderId manquant" },
        { status: 500 }
      );
    }

    // ---- 3) Save PayPal order id dans Firestore ----
    await orderRef.set(
      {
        payment: {
          provider: "paypal",
          providerOrderId: paypalOrderId,
          status: "CREATED",
        },
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      orderId: paypalOrderId,
      orderDocId,
      totals: {
        amount: centsToMoney(totalTTCCents),
        item_total: centsToMoney(itemsHTCents),
        shipping: centsToMoney(shipHTCents),
        tax_total: centsToMoney(totalVATCents),
      },
    });
  } catch (e: unknown) {
    console.error("[paypal/create-order] ERROR:", e);
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
