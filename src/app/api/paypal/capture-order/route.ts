// src/app/api/paypal/capture-order/route.ts
import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import { getPayPalClient } from "@/lib/paypal-client";
import { dbAdmin } from "@/lib/firebase.admin";
import { sendOrderEmails } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toCents(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.round(v * 100);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;

    const orderId = body?.orderId;
    const fallbackOrderDocId = body?.orderDocId || body?.customId || null;

    if (!orderId) {
      return NextResponse.json(
        { ok: false, error: "orderId manquant" },
        { status: 400 }
      );
    }

    const client = getPayPalClient();

    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
    captureRequest.requestBody({});

    const capture = await client.execute(captureRequest);

    const purchaseUnit = capture?.result?.purchase_units?.[0];
    const captureObj = purchaseUnit?.payments?.captures?.[0];

    const captureId = captureObj?.id;
    const captureStatus = captureObj?.status; // "COMPLETED"
    const capturedValue = captureObj?.amount?.value; // string ex "111.00"
    const capturedCurrency = captureObj?.amount?.currency_code; // "EUR"

    const customId = purchaseUnit?.custom_id || null;
    const orderDocId = customId || fallbackOrderDocId;

    if (!captureId) {
      return NextResponse.json(
        { ok: false, error: "captureId manquant" },
        { status: 500 }
      );
    }

    if (captureStatus !== "COMPLETED") {
      return NextResponse.json(
        {
          ok: false,
          error: `Capture non complétée (status=${captureStatus})`,
          captureId,
          captureStatus,
        },
        { status: 400 }
      );
    }

    // Si pas de docId Firestore, on ne peut pas update / envoyer mail
    if (!orderDocId) {
      console.warn("[paypal/capture-order] orderDocId introuvable", {
        orderId,
        customId,
        fallbackOrderDocId,
      });

      return NextResponse.json({
        ok: true,
        orderId,
        captureId,
        captureStatus,
        capturedValue: capturedValue ?? null,
        capturedCurrency: capturedCurrency ?? null,
        orderDocId: null,
        emailSent: false,
        warning:
          "orderDocId introuvable, commande non mise à jour et email non envoyé",
      });
    }

    const orderRef = dbAdmin.collection("orders").doc(orderDocId);

    // 1) Lire la commande (anti-doublon + email)
    const snapBefore = await orderRef.get();
    const existing = snapBefore.exists ? (snapBefore.data() as any) : null;

    const alreadySent = Boolean(existing?.emails?.sent);

    // 2) Update Firestore paid
    await orderRef.set(
      {
        status: "paid",
        payment: {
          provider: "paypal",
          providerOrderId: orderId,
          captureId,
          status: captureStatus,
          capturedAmount: {
            value: capturedValue ?? null,
            currency: capturedCurrency ?? null,
          },
        },
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // 3) Relire après update
    const snapAfter = await orderRef.get();
    const orderData = snapAfter.exists ? (snapAfter.data() as any) : null;

    // 4) Envoi email (NE DOIT JAMAIS FAIRE ÉCHOUER LA CAPTURE)
    let emailSent = false;

    if (!alreadySent && orderData?.email) {
      const totalTTC = Number(orderData?.totals?.totalTTC ?? 0);
      const amountTotalCents =
        totalTTC > 0 ? toCents(totalTTC) : toCents(capturedValue);

      try {
        await sendOrderEmails({
  order: {
    id: orderData.id || orderDocId,
    amount_total: Math.round(Number(orderData?.totals?.totalTTC || 0) * 100),
    currency: (orderData?.currency || "EUR").toLowerCase(),
    customer_email: orderData.email,
    payment_status: "paid",
    created_at: orderData.createdAt,
    provider: "paypal",
    orderData,          // ✅ AJOUTE ÇA
    locale: orderData?.locale || "fr",
  },
  clientEmail: orderData.email,
});


        emailSent = true;

        // flag anti-doublon
        await orderRef.set(
          { emails: { sent: true, sentAt: new Date(), provider: "paypal" } },
          { merge: true }
        );
      } catch (mailErr) {
        // ✅ IMPORTANT: on log, mais on renvoie quand même ok:true
        console.error("[paypal/capture-order] EMAIL ERROR (non bloquant):", mailErr);

        await orderRef.set(
          {
            emails: {
              sent: false,
              lastErrorAt: new Date(),
              lastError: String((mailErr as any)?.message || mailErr),
              provider: "paypal",
            },
          },
          { merge: true }
        );
      }
    } else if (alreadySent) {
      console.log("[paypal/capture-order] email déjà envoyé, skip", { orderDocId });
    } else {
      console.warn("[paypal/capture-order] Email non envoyé: orderData/email manquant", {
        orderDocId,
        hasOrderData: !!orderData,
      });
    }

    return NextResponse.json({
      ok: true,
      orderId,
      captureId,
      captureStatus,
      capturedValue: capturedValue ?? null,
      capturedCurrency: capturedCurrency ?? null,
      orderDocId,
      emailSent,
    });
  } catch (e: any) {
    console.error("[paypal/capture-order] ERROR:", e);

    return NextResponse.json(
      { ok: false, error: e?.message ?? "Capture failed" },
      { status: 500 }
    );
  }
}
