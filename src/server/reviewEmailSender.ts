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

function buildReviewEmailHtml(params: {
  locale: string;
  reviewBase: string;
  star1: string;
  star2: string;
  star3: string;
  star4: string;
  star5: string;
}) {
  const { locale, reviewBase, star1, star2, star3, star4, star5 } = params;

  if (locale === "fr") {
    return `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Donnez-nous votre avis</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f6f6f6;">
    <div style="width:100%;background-color:#f6f6f6;padding:24px 12px;">
      <table
        role="presentation"
        cellpadding="0"
        cellspacing="0"
        border="0"
        width="100%"
        style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;"
      >
        <tr>
          <td style="padding:32px 24px 16px 24px;font-family:Arial,Helvetica,sans-serif;color:#111111;">
            <p style="margin:0 0 16px 0;font-size:16px;line-height:24px;">
              Bonjour,
            </p>

            <h1 style="margin:0 0 16px 0;font-size:24px;line-height:32px;font-weight:700;color:#111111;">
              Votre avis compte
            </h1>

            <p style="margin:0 0 20px 0;font-size:15px;line-height:24px;color:#333333;">
              Suite à votre commande, pourriez-vous prendre quelques secondes pour noter votre expérience ?
            </p>

            <p style="margin:0 0 10px 0;font-size:14px;line-height:22px;color:#666666;">
              Cliquez sur une étoile :
            </p>

            <div style="text-align:center;margin:24px 0 28px 0;">
              <a href="${escapeHtml(star1)}" style="text-decoration:none;font-size:34px;line-height:34px;margin:0 4px;" aria-label="1 étoile">⭐</a>
              <a href="${escapeHtml(star2)}" style="text-decoration:none;font-size:34px;line-height:34px;margin:0 4px;" aria-label="2 étoiles">⭐</a>
              <a href="${escapeHtml(star3)}" style="text-decoration:none;font-size:34px;line-height:34px;margin:0 4px;" aria-label="3 étoiles">⭐</a>
              <a href="${escapeHtml(star4)}" style="text-decoration:none;font-size:34px;line-height:34px;margin:0 4px;" aria-label="4 étoiles">⭐</a>
              <a href="${escapeHtml(star5)}" style="text-decoration:none;font-size:34px;line-height:34px;margin:0 4px;" aria-label="5 étoiles">⭐</a>
            </div>

            <div style="text-align:center;margin:0 0 28px 0;">
              <a
                href="${escapeHtml(reviewBase)}"
                style="
                  display:inline-block;
                  background-color:#111111;
                  color:#ffffff;
                  text-decoration:none;
                  font-size:14px;
                  font-weight:700;
                  line-height:14px;
                  padding:14px 22px;
                  border-radius:8px;
                "
              >
                Laisser un avis
              </a>
            </div>

            <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#555555;">
              Votre retour aide les autres clients et nous permet d'améliorer nos produits et notre service.
            </p>

            <p style="margin:24px 0 0 0;font-size:12px;line-height:20px;color:#888888;">
              Vous recevez cet email suite à votre commande.
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
  <head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Share your feedback</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f6f6f6;">
    <div style="width:100%;background-color:#f6f6f6;padding:24px 12px;">
      <table
        role="presentation"
        cellpadding="0"
        cellspacing="0"
        border="0"
        width="100%"
        style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;"
      >
        <tr>
          <td style="padding:32px 24px 16px 24px;font-family:Arial,Helvetica,sans-serif;color:#111111;">
            <p style="margin:0 0 16px 0;font-size:16px;line-height:24px;">
              Hello,
            </p>

            <h1 style="margin:0 0 16px 0;font-size:24px;line-height:32px;font-weight:700;color:#111111;">
              Your feedback matters
            </h1>

            <p style="margin:0 0 20px 0;font-size:15px;line-height:24px;color:#333333;">
              Following your purchase, could you take a few seconds to rate your experience?
            </p>

            <p style="margin:0 0 10px 0;font-size:14px;line-height:22px;color:#666666;">
              Click on a star:
            </p>

            <div style="text-align:center;margin:24px 0 28px 0;">
              <a href="${escapeHtml(star1)}" style="text-decoration:none;font-size:34px;line-height:34px;margin:0 4px;" aria-label="1 star">⭐</a>
              <a href="${escapeHtml(star2)}" style="text-decoration:none;font-size:34px;line-height:34px;margin:0 4px;" aria-label="2 stars">⭐</a>
              <a href="${escapeHtml(star3)}" style="text-decoration:none;font-size:34px;line-height:34px;margin:0 4px;" aria-label="3 stars">⭐</a>
              <a href="${escapeHtml(star4)}" style="text-decoration:none;font-size:34px;line-height:34px;margin:0 4px;" aria-label="4 stars">⭐</a>
              <a href="${escapeHtml(star5)}" style="text-decoration:none;font-size:34px;line-height:34px;margin:0 4px;" aria-label="5 stars">⭐</a>
            </div>

            <div style="text-align:center;margin:0 0 28px 0;">
              <a
                href="${escapeHtml(reviewBase)}"
                style="
                  display:inline-block;
                  background-color:#111111;
                  color:#ffffff;
                  text-decoration:none;
                  font-size:14px;
                  font-weight:700;
                  line-height:14px;
                  padding:14px 22px;
                  border-radius:8px;
                "
              >
                Leave a review
              </a>
            </div>

            <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#555555;">
              Your feedback helps other customers and helps us improve our products and service.
            </p>

            <p style="margin:24px 0 0 0;font-size:12px;line-height:20px;color:#888888;">
              You received this email following your purchase.
            </p>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>
`;
}

function buildReviewEmailText(params: {
  locale: string;
  reviewBase: string;
  star1: string;
  star2: string;
  star3: string;
  star4: string;
  star5: string;
}) {
  const { locale, reviewBase, star1, star2, star3, star4, star5 } = params;

  if (locale === "fr") {
    return [
      "Bonjour,",
      "",
      "Suite à votre commande, pourriez-vous nous donner votre avis ?",
      "",
      `1 étoile : ${star1}`,
      `2 étoiles : ${star2}`,
      `3 étoiles : ${star3}`,
      `4 étoiles : ${star4}`,
      `5 étoiles : ${star5}`,
      "",
      `Laisser un avis : ${reviewBase}`,
      "",
      "Vous recevez cet email suite à votre commande.",
    ].join("\n");
  }

  return [
    "Hello,",
    "",
    "Following your purchase, could you share your feedback?",
    "",
    `1 star: ${star1}`,
    `2 stars: ${star2}`,
    `3 stars: ${star3}`,
    `4 stars: ${star4}`,
    `5 stars: ${star5}`,
    "",
    `Leave a review: ${reviewBase}`,
    "",
    "You received this email following your purchase.",
  ].join("\n");
}

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

  const status = String(order?.reviewEmail?.status || "").toLowerCase();
  if (status === "sent") return { ok: true, skipped: true, reason: "already_sent" };
  if (status === "sending") return { ok: true, skipped: true, reason: "already_sending" };

  const email = asStr(order?.email || order?.customerEmail || order?.customer_email, "").trim().toLowerCase();
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
    return { ok: true, skipped: true, reason: "missing_email" };
  }

  const token =
    asStr(order?.reviewEmail?.token, "").trim() ||
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

  const subject = locale === "fr" ? "Donnez-nous votre avis" : "Share your feedback";

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
  });

  const text = buildReviewEmailText({
    locale,
    reviewBase,
    star1,
    star2,
    star3,
    star4,
    star5,
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
        "reviewEmail.token": token,
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
      "reviewEmail.token": token,
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