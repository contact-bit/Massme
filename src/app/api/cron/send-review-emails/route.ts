// src/app/api/cron/send-review-emails/route.ts
import { NextResponse } from "next/server";
import { getAdminDb } from "@/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sécurité cron: tu appelles /api/cron/send-review-emails?secret=XXXX
 * (tu utilises déjà ce pattern)
 */
function requireCronAuth(req: Request) {
  const key = process.env.CRON_SECRET;
  if (!key) return true; // dev
  const { searchParams } = new URL(req.url);
  return searchParams.get("secret") === key;
}

function getBaseUrl() {
  const baseUrl = (process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  return baseUrl;
}

function getFrom() {
  return process.env.REVIEW_EMAIL_FROM || "Massme <contact@hdconnects.com>";
}

function safeLocale(v: any) {
  const s = String(v || "fr").trim().toLowerCase();
  return s || "fr";
}

function isValidEmail(s: string) {
  return !!s && s.includes("@");
}

export async function GET(req: Request) {
  try {
    if (!requireCronAuth(req)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const debug = searchParams.get("debug") === "1";

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ ok: false, error: "missing_resend_api_key" }, { status: 500 });
    }

    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return NextResponse.json({ ok: false, error: "missing_base_url" }, { status: 500 });
    }

    const from = getFrom();
    const resend = new Resend(resendKey);
    const db = getAdminDb();

    const now = new Date();

    // ✅ Requête planifiée (nécessite index composite)
    // orders: reviewEmail.status == scheduled AND reviewEmail.scheduledAt <= now ORDER BY reviewEmail.scheduledAt
    const snap = await db
      .collection("orders")
      .where("reviewEmail.status", "==", "scheduled")
      .where("reviewEmail.scheduledAt", "<=", now)
      .orderBy("reviewEmail.scheduledAt", "asc")
      .limit(50)
      .get();

    let sent = 0;
    let skipped = 0;

    const debugSends: Array<{
      orderId: string;
      to: string;
      resendId: string | null;
      resendError: string | null;
      reviewUrl: string;
    }> = [];

    for (const doc of snap.docs) {
      const order = doc.data() || {};
      const orderId = doc.id;

      const email = String(order.email || order.customerEmail || order.customer_email || "").trim().toLowerCase();
      const locale = safeLocale(order.locale);

      if (!isValidEmail(email)) {
        skipped++;
        await doc.ref.set(
          { reviewEmail: { status: "cancelled", lastError: "missing_email" } },
          { merge: true }
        );
        continue;
      }

      // ✅ token: on utilise celui stocké dans la commande (préféré)
      // fallback: si absent, on en génère un et on le stocke (utile si tu as des anciennes commandes)
      let token = String(order?.reviewEmail?.token || "").trim();
      if (!token) {
        token = crypto.randomBytes(24).toString("hex");
        await doc.ref.set(
          { reviewEmail: { token } },
          { merge: true }
        );
      }

      const reviewUrl =
        `${baseUrl}/${encodeURIComponent(locale)}/review` +
        `?order_id=${encodeURIComponent(orderId)}` +
        `&token=${encodeURIComponent(token)}` +
        `&email=${encodeURIComponent(email)}`;

      const subject = locale === "fr" ? "Donnez-nous votre avis" : "Share your feedback";
      const html =
        locale === "fr"
          ? `<p>Bonjour,</p>
             <p>Suite à votre commande, pouvez-vous laisser une note et un commentaire ?</p>
             <p><a href="${reviewUrl}">Laisser un avis</a></p>
             <p style="font-size:12px;color:#666">Vous recevez cet email suite à votre commande.</p>`
          : `<p>Hello,</p>
             <p>Following your purchase, could you leave a rating and a comment?</p>
             <p><a href="${reviewUrl}">Leave a review</a></p>
             <p style="font-size:12px;color:#666">You received this email following your purchase.</p>`;

      const result = await resend.emails.send({
        from,
        to: [email],
        subject,
        html,
        text: locale === "fr" ? `Laisser un avis: ${reviewUrl}` : `Leave a review: ${reviewUrl}`,
      });

      const resendId = (result as any)?.data?.id ?? null;
      const resendError = (result as any)?.error?.message ?? null;

      if (debug) {
        debugSends.push({ orderId, to: email, resendId, resendError, reviewUrl });
      }

      // si erreur Resend => on garde status scheduled et on log l’erreur
      if (resendError) {
        await doc.ref.set(
          { reviewEmail: { lastError: resendError } },
          { merge: true }
        );
        continue;
      }

      // ✅ Marquer comme envoyé (nouveau système)
      await doc.ref.set(
        {
          reviewEmail: {
            status: "sent",
            sentAt: FieldValue.serverTimestamp(),
            lastError: null,
          },

          // ✅ compat legacy (ton ancien code)
          reviewEmailSent: true,
          reviewEmailSentAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      sent++;
    }

    return NextResponse.json({
      ok: true,
      checked: snap.size,
      sent,
      skipped,
      note:
        "Ce cron envoie les emails où orders.reviewEmail.status='scheduled' et scheduledAt<=now. Ajoute ?debug=1 pour voir resendId + URLs.",
      ...(debug ? { debugSends } : {}),
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      {
        ok: false,
        error: "server_error",
        message: e?.message || String(e),
        code: e?.code ?? null,
      },
      { status: 500 }
    );
  }
}