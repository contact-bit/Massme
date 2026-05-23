// src/server/reviewEmailSender.ts
import "server-only";
import { dbAdmin } from "@/lib/firebase.admin";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";
import { createReviewToken } from "@/lib/reviewToken";

/* =========================================================
   HELPERS
========================================================= */

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

function buildHtml({ locale, reviewBase, stars, orderNumber }: any) {
  const isFR = locale === "fr";

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f2f4f7;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <!-- CONTAINER -->
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;margin:40px 0;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="padding:28px 36px;border-bottom:1px solid #f1f1f1;">
              <div style="font-size:20px;font-weight:700;letter-spacing:-0.3px;">
                Vitrectomed
              </div>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="padding:40px 36px 20px 36px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:600;letter-spacing:-0.4px;">
                ${
                  isFR
                    ? "Votre expérience compte vraiment"
                    : "Your experience matters"
                }
              </h1>

              <p style="margin:12px 0 0 0;font-size:15px;color:#475569;">
                ${
                  isFR
                    ? "Merci pour votre commande"
                    : "Thank you for your order"
                }
                <strong>${escapeHtml(orderNumber)}</strong>
              </p>
            </td>
          </tr>

          <!-- PREMIUM CARD -->
          <tr>
            <td style="padding:0 36px 36px 36px;">
              <div style="
                background:linear-gradient(180deg,#f8fafc,#ffffff);
                border:1px solid #e2e8f0;
                border-radius:14px;
                padding:28px;
                text-align:center;
              ">

                <p style="margin:0 0 20px 0;font-size:15px;color:#334155;">
                  ${
                    isFR
                      ? "Comment évalueriez-vous votre expérience ?"
                      : "How would you rate your experience?"
                  }
                </p>

                <!-- STARS -->
                <div style="margin:10px 0 24px 0;">
                  ${stars
                    .map(
                      (s: string) => `
                        <a href="${s}" 
                           style="
                             text-decoration:none;
                             font-size:30px;
                             margin:0 6px;
                             color:#fbbf24;
                             display:inline-block;
                             transition:transform 0.15s ease;
                           ">
                          ★
                        </a>
                      `
                    )
                    .join("")}
                </div>

                <!-- CTA -->
                <a href="${reviewBase}"
                   style="
                     display:inline-block;
                     background:#0f172a;
                     color:#ffffff;
                     padding:14px 26px;
                     border-radius:10px;
                     text-decoration:none;
                     font-size:14px;
                     font-weight:600;
                     letter-spacing:0.2px;
                     box-shadow:0 4px 14px rgba(0,0,0,0.15);
                   ">
                  ${
                    isFR
                      ? "Donner mon avis"
                      : "Leave a review"
                  }
                </a>

              </div>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:0 36px;">
              <div style="height:1px;background:#f1f5f9;"></div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px 36px 32px 36px;font-size:12px;color:#94a3b8;line-height:1.6;">

              ${
                isFR
                  ? "Cet email fait suite à votre commande récente."
                  : "This email relates to your recent order."
              }

              <br/><br/>

              Vitrectomed — Tous droits réservés

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`

;
}

/* =========================================================
   MAIN
========================================================= */

export async function sendReviewEmailNow(
  orderId: string,
  opts?: { force?: boolean } // 🔥 permet le renvoi manuel
) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error("missing_resend_api_key");

  const baseUrl =
    (process.env.APP_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_URL ||
      "").replace(/\/+$/, "");

  if (!baseUrl) throw new Error("missing_base_url");

  const from =
    process.env.REVIEW_EMAIL_FROM ||
    "Vitrectomed <onboarding@resend.dev>";

  const resend = new Resend(resendKey);

  const ref = dbAdmin.collection("orders").doc(orderId);
  const snap = await ref.get();

  if (!snap.exists) throw new Error("order_not_found");

  const order = snap.data() as any;

  /* =========================================================
     🔒 ANTI DOUBLE (SAUF SI FORCE)
  ========================================================= */

  const alreadySent = order?.reviewEmail?.status === "sent";

  if (alreadySent && !opts?.force) {
    return { ok: true, alreadySent: true };
  }

  const orderNumber =
    order?.orderNumber ||
    order?.invoiceEmail?.orderNumber ||
    orderId;

  const email = asStr(
    order?.email || order?.customerEmail || order?.customer_email
  )
    .trim()
    .toLowerCase();

  if (!isValidEmail(email)) throw new Error("invalid_email");

  const locale = asStr(order?.locale, "fr");

  /* =========================================================
     🔐 TOKEN (NE PAS REGENERER INUTILEMENT)
  ========================================================= */

  let token = asStr(order?.reviewEmail?.token);

  if (!token) {
    token = createReviewToken({ orderId, email, ttlDays: 30 });

    await ref.update({
      "reviewEmail.token": token,
    });
  }

/* =========================================================
   URL (COMPATIBLE API + FRONT)
========================================================= */

const reviewBase =
  `${baseUrl}/${locale}/review` +
  `?order_id=${encodeURIComponent(orderId)}` +
  `&token=${encodeURIComponent(token)}` +
  `&email=${encodeURIComponent(email)}`;

// ⭐ IMPORTANT: garder "rating" (ton front l'utilise déjà)
const stars = [1, 2, 3, 4, 5].map(
  (n) => `${reviewBase}&rating=${n}`
);


  /* =========================================================
     STATUS SENDING
  ========================================================= */

  await ref.update({
    "reviewEmail.status": "sending",
    "reviewEmail.lastAttemptAt": FieldValue.serverTimestamp(),
  });

  /* =========================================================
     SEND EMAIL
  ========================================================= */

  const res = await resend.emails.send({
    from,
    to: email,
    subject: `Votre avis - Commande ${orderNumber}`,
    html: buildHtml({
      locale,
      reviewBase,
      stars,
      orderNumber,
    }),
  });

  const resendId =
    (res as any)?.data?.id ||
    (res as any)?.id ||
    null;

  if (!resendId) {
    await ref.update({
      "reviewEmail.status": "error",
      "reviewEmail.lastError": JSON.stringify(res),
    });

    throw new Error("resend_failed");
  }

  /* =========================================================
     SUCCESS
  ========================================================= */

  const now = new Date();

  await ref.update({
    "reviewEmail.status": "sent",
    "reviewEmail.sentAt": now,         // date principale
    "reviewEmail.lastSentAt": now,     // 🔥 utile pour renvoi UI
    "reviewEmail.resendId": resendId,
    "reviewEmail.lastError": null,
    "reviewEmail.scheduledAt": null,   // 🔥 bloque le scheduler
    "reviewEmail.resendCount": FieldValue.increment(1), // 🔥 bonus
  });

  return {
    ok: true,
    resendId,
    forced: !!opts?.force,
  };
}
