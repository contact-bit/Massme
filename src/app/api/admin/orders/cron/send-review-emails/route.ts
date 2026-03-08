import { NextResponse } from "next/server";
import { getAdminDb } from "@/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

function assertCron(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") || "";
  if (!secret || auth !== `Bearer ${secret}`) throw new Error("unauthorized_cron");
}

// TODO: branche ton provider email ici (Resend/Sendgrid/SMTP/etc.)
async function sendReviewEmail(opts: { to: string; subject: string; html: string }) {
  // Exemple minimal: mets ton code d’envoi ici.
  // throw new Error("send_email_not_implemented");
  console.log("SEND EMAIL →", opts.to, opts.subject);
  return true;
}

function getBaseUrl() {
  // Mets ton domaine prod dans env, sinon localhost
  return process.env.PUBLIC_BASE_URL || "http://localhost:3000";
}

export async function GET(req: Request) {
  try {
    assertCron(req);

    const db = getAdminDb();
    const now = new Date();
    const baseUrl = getBaseUrl();

    const snap = await db
      .collection("orders")
      .where("reviewEmail.status", "==", "scheduled")
      .where("reviewEmail.scheduledAt", "<=", now)
      .orderBy("reviewEmail.scheduledAt", "asc")
      .limit(50)
      .get();

    let sent = 0;
    let failed = 0;

    for (const doc of snap.docs) {
      const o = doc.data() as any;
      const orderId = doc.id;

      const email = String(o?.email || "").trim().toLowerCase();
      const locale = String(o?.locale || "fr").trim() || "fr";
      const token = String(o?.reviewEmail?.token || "").trim();

      if (!email || !email.includes("@") || !token) {
        failed++;
        await doc.ref.set(
          { reviewEmail: { status: "cancelled", lastError: "missing_email_or_token" } },
          { merge: true }
        );
        continue;
      }

      const reviewUrl =
        `${baseUrl}/${encodeURIComponent(locale)}/review` +
        `?order_id=${encodeURIComponent(orderId)}` +
        `&token=${encodeURIComponent(token)}` +
        `&email=${encodeURIComponent(email)}`;

      const subject = "Donne ton avis sur ta commande";
      const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <p>Merci pour ta commande ❤️</p>
          <p>Tu peux laisser un avis en cliquant ici :</p>
          <p><a href="${reviewUrl}">${reviewUrl}</a></p>
          <p style="font-size:12px;color:#777">Si tu n’es pas à l’origine de cette demande, ignore cet email.</p>
        </div>
      `;

      try {
        await sendReviewEmail({ to: email, subject, html });

        sent++;
        await doc.ref.set(
          {
            reviewEmail: {
              status: "sent",
              sentAt: FieldValue.serverTimestamp(),
              lastError: null,
            },
          },
          { merge: true }
        );
      } catch (e: any) {
        failed++;
        await doc.ref.set(
          { reviewEmail: { lastError: String(e?.message || e) } },
          { merge: true }
        );
      }
    }

    return NextResponse.json({ ok: true, processed: snap.size, sent, failed });
  } catch (e: any) {
    const msg = String(e?.message || e);
    return NextResponse.json({ ok: false, message: msg }, { status: msg === "unauthorized_cron" ? 401 : 500 });
  }
}