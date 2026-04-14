// src/server/reviewEmailSender.ts
import "server-only";
import { dbAdmin } from "@/lib/firebase.admin";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";
import { createReviewToken } from "@/lib/reviewToken";

function asStr(v: any, fallback = "") {
  return typeof v === "string" ? v : fallback;
}

function isValidEmail(email: string) {
  return !!email && email.includes("@");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   HTML
========================================================= */
function buildReviewEmailHtml(params: {
  locale: string;
  reviewBase: string;
  star1: string;
  star2: string;
  star3: string;
  star4: string;
  star5: string;
  orderNumber: string;
}) {
  const { locale, reviewBase, star1, star2, star3, star4, star5, orderNumber } = params;

  if (locale === "fr") {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charSet="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Donnez-nous votre avis</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f6;">
<div style="padding:24px;">
<table style="max-width:560px;margin:auto;background:#fff;border-radius:12px;">
<tr>
<td style="padding:32px;font-family:Arial;color:#111;">

<p>Bonjour,</p>

<h1 style="font-size:24px;margin-bottom:16px;">Votre avis compte</h1>

<p>
Suite à votre commande <strong>#${escapeHtml(orderNumber)}</strong>, 
pourriez-vous prendre quelques secondes pour noter votre expérience ?
</p>

<p style="font-size:14px;color:#666;">Cliquez sur une étoile :</p>

<div style="text-align:center;margin:24px 0;">
<a href="${escapeHtml(star1)}">⭐</a>
<a href="${escapeHtml(star2)}">⭐</a>
<a href="${escapeHtml(star3)}">⭐</a>
<a href="${escapeHtml(star4)}">⭐</a>
<a href="${escapeHtml(star5)}">⭐</a>
</div>

<div style="text-align:center;margin:24px 0;">
<a href="${escapeHtml(reviewBase)}"
style="background:#111;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none;font-weight:bold;">
Laisser un avis
</a>
</div>

<p style="font-size:14px;color:#555;">
Votre retour aide les autres clients et nous permet d'améliorer nos produits.
</p>

<p style="font-size:12px;color:#888;margin-top:24px;">
Email lié à la commande #${escapeHtml(orderNumber)}
</p>

</td>
</tr>
</table>
</div>
</body>
</html>
`;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f6f6f6;">
<div style="padding:24px;">
<table style="max-width:560px;margin:auto;background:#fff;border-radius:12px;">
<tr>
<td style="padding:32px;font-family:Arial;color:#111;">

<p>Hello,</p>

<h1>Your feedback matters</h1>

<p>
Following your order <strong>#${escapeHtml(orderNumber)}</strong>, 
could you rate your experience?
</p>

<div style="text-align:center;margin:24px 0;">
<a href="${escapeHtml(star1)}">⭐</a>
<a href="${escapeHtml(star2)}">⭐</a>
<a href="${escapeHtml(star3)}">⭐</a>
<a href="${escapeHtml(star4)}">⭐</a>
<a href="${escapeHtml(star5)}">⭐</a>
</div>

<div style="text-align:center;margin:24px 0;">
<a href="${escapeHtml(reviewBase)}"
style="background:#111;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none;">
Leave a review
</a>
</div>

<p style="font-size:12px;color:#888;">
Related to order #${escapeHtml(orderNumber)}
</p>

</td>
</tr>
</table>
</div>
</body>
</html>
`;
}

/* =========================================================
   TEXT
========================================================= */
function buildReviewEmailText(params: {
  locale: string;
  reviewBase: string;
  star1: string;
  star2: string;
  star3: string;
  star4: string;
  star5: string;
  orderNumber: string;
}) {
  const { locale, reviewBase, star1, star2, star3, star4, star5, orderNumber } = params;

  if (locale === "fr") {
    return [
      "Bonjour,",
      "",
      `Suite à votre commande #${orderNumber}, pourriez-vous nous donner votre avis ?`,
      "",
      `1⭐ ${star1}`,
      `2⭐ ${star2}`,
      `3⭐ ${star3}`,
      `4⭐ ${star4}`,
      `5⭐ ${star5}`,
      "",
      `Lien : ${reviewBase}`,
    ].join("\n");
  }

  return [
    "Hello,",
    "",
    `Following your order #${orderNumber}, could you share your feedback?`,
    "",
    `1⭐ ${star1}`,
    `2⭐ ${star2}`,
    `3⭐ ${star3}`,
    `4⭐ ${star4}`,
    `5⭐ ${star5}`,
    "",
    `Review: ${reviewBase}`,
  ].join("\n");
}

/* =========================================================
   MAIN
========================================================= */
export async function sendReviewEmailNow(orderId: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error("missing_resend_api_key");

  const baseUrl = (process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  if (!baseUrl) throw new Error("missing_base_url");

  const from = process.env.REVIEW_EMAIL_FROM || "Massme <contact@hdconnects.com>";

  const orderRef = dbAdmin.collection("orders").doc(orderId);
  const snap = await orderRef.get();

  if (!snap.exists) throw new Error(`order_not_found:${orderId}`);

  const order = snap.data() as any;

  // 🔥 IMPORTANT
const orderNumber =
  typeof order?.orderNumber === "string" && order.orderNumber.length > 0
    ? order.orderNumber
    : orderId;

console.log("ORDER DEBUG:", {
  orderId,
  orderNumber: order?.orderNumber,
});

  const status = String(order?.reviewEmail?.status || "").toLowerCase();
  if (status === "sent") return { ok: true, skipped: true };
  if (status === "sending") return { ok: true, skipped: true };

  const email = asStr(order?.email || order?.customerEmail || order?.customer_email)
    .trim()
    .toLowerCase();

  const locale = asStr(order?.locale, "fr").trim() || "fr";

  if (!isValidEmail(email)) {
    await orderRef.set(
      {
        "reviewEmail.status": "skipped",
        "reviewEmail.reason": "missing_email",
        "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return { ok: true, skipped: true };
  }

  const token =
    asStr(order?.reviewEmail?.token) ||
    createReviewToken({ orderId, email, ttlDays: 30 });

  const reviewBase =
    `${baseUrl}/${encodeURIComponent(locale)}/review` +
    `?order_id=${encodeURIComponent(orderId)}` +
    `&token=${encodeURIComponent(token)}` +
    `&email=${encodeURIComponent(email)}`;

  const star1 = `${reviewBase}&rating=1`;
  const star2 = `${reviewBase}&rating=2`;
  const star3 = `${reviewBase}&rating=3`;
  const star4 = `${reviewBase}&rating=4`;
  const star5 = `${reviewBase}&rating=5`;

  const subject = locale === "fr"
    ? `Votre avis - Commande #${orderNumber}`
    : `Your feedback - Order #${orderNumber}`;

  await orderRef.set(
    {
      "reviewEmail.status": "sending",
      "reviewEmail.token": token,
      "reviewEmail.email": email,
      "reviewEmail.locale": locale,
      "reviewEmail.lastAttemptAt": FieldValue.serverTimestamp(),
      "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  const resend = new Resend(resendKey);

  const html = buildReviewEmailHtml({
    locale,
    reviewBase,
    star1,
    star2,
    star3,
    star4,
    star5,
    orderNumber,
  });

  const text = buildReviewEmailText({
    locale,
    reviewBase,
    star1,
    star2,
    star3,
    star4,
    star5,
    orderNumber,
  });

  const result = await resend.emails.send({
    from,
    to: [email],
    subject,
    html,
    text,
  });

  const resendId = (result as any)?.data?.id ?? null;
  const resendError = (result as any)?.error?.message ?? null;

  if (resendError) {
    await orderRef.set(
      {
        "reviewEmail.status": "error",
        "reviewEmail.lastError": resendError,
        "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return { ok: false, error: resendError };
  }

  await orderRef.set(
    {
      "reviewEmail.status": "sent",
      "reviewEmail.sentAt": FieldValue.serverTimestamp(),
      "reviewEmail.resendId": resendId,
      "reviewEmail.lastError": null,
      "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
      reviewEmailSent: true,
      reviewEmailSentAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { ok: true, resendId, reviewBase };
}