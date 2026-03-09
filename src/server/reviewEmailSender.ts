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

export async function sendReviewEmailNow(orderId: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error("missing_resend_api_key");

  const rawBaseUrl =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  if (!baseUrl) throw new Error("missing_base_url");

  const from = process.env.REVIEW_EMAIL_FROM || "Massme Support <contact@hdconnects.com>";

  const orderRef = dbAdmin.collection("orders").doc(orderId);

  const snap = await orderRef.get();
  if (!snap.exists) throw new Error(`order_not_found:${orderId}`);

  const order = snap.data() as any;

  const status = String(order?.reviewEmail?.status || "").toLowerCase();
  if (status === "sent") return { ok: true, skipped: true, reason: "already_sent" };
  if (status === "sending") return { ok: true, skipped: true, reason: "already_sending" };

  const email = asStr(order?.email || order?.customerEmail || order?.customer_email, "")
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
    return { ok: true, skipped: true, reason: "missing_email" };
  }

  const token =
    asStr(order?.reviewEmail?.token, "").trim() ||
    createReviewToken({ orderId, email, ttlDays: 30 });

  const url =
    `${baseUrl}/${encodeURIComponent(locale)}/review` +
    `?order_id=${encodeURIComponent(orderId)}` +
    `&token=${encodeURIComponent(token)}` +
    `&email=${encodeURIComponent(email)}`;

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

  const result = await resend.emails.send({
    from,
    to: [email],
    subject,
    html:
      locale === "fr"
        ? `<p>Bonjour,</p>
           <p>Suite à votre commande, pouvez-vous laisser une note et un commentaire ?</p>
           <p><a href="${url}">Laisser un avis</a></p>
           <p style="font-size:12px;color:#666">Vous recevez cet email suite à votre commande.</p>`
        : `<p>Hello,</p>
           <p>Following your purchase, could you leave a rating and a comment?</p>
           <p><a href="${url}">Leave a review</a></p>
           <p style="font-size:12px;color:#666">You received this email following your purchase.</p>`,
    text: locale === "fr" ? `Laisser un avis: ${url}` : `Leave a review: ${url}`,
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

  return { ok: true, resendId, url };
}