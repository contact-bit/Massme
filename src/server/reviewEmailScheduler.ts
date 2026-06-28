// src/server/reviewEmailScheduler.ts
import "server-only";
import { dbAdmin } from "@/lib/firebase.admin";
import { FieldValue } from "firebase-admin/firestore";
import { createReviewToken } from "@/lib/reviewToken";
import { sendReviewEmailNow } from "@/server/reviewEmailSender";

type ReviewEmailSettings = {
  enabled: boolean;
  mode: "immediate" | "delay";
  delayDays: number;
};

const REVIEW_EMAIL_SETTINGS_DOC = "settings/review_email";

/* =========================================================
   HELPERS
========================================================= */

function clampInt(n: unknown, min: number, max: number, fallback: number) {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(v)));
}

function normalizeEmail(v: unknown): string | null {
  const e = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!e || !e.includes("@")) return null;
  return e;
}

async function readReviewEmailSettings(): Promise<ReviewEmailSettings> {
  const snap = await dbAdmin.doc(REVIEW_EMAIL_SETTINGS_DOC).get();
  const d = snap.exists ? (snap.data() as any) : null;

  const enabled = typeof d?.enabled === "boolean" ? d.enabled : true;
  const mode: "immediate" | "delay" =
    d?.mode === "immediate" ? "immediate" : "delay";

  const rawDelayDays = clampInt(d?.delayDays, 0, 365, 5);
  const delayDays = mode === "immediate" ? 0 : rawDelayDays;

  return { enabled, mode, delayDays };
}

/* =========================================================
   MAIN
========================================================= */

export async function scheduleReviewEmailForOrder(orderId: string) {
  const ref = dbAdmin.collection("orders").doc(orderId);
  const snap = await ref.get();

  if (!snap.exists) {
    await ref.update({
      "reviewEmail.status": "error",
      "reviewEmail.lastError": `Order not found: ${orderId}`,
      "reviewEmail.lastErrorAt": FieldValue.serverTimestamp(),
    });

    throw new Error(`Order not found: ${orderId}`);
  }

  const order = snap.data() as any;
  const review = order?.reviewEmail || {};

  /* =========================================================
     🔒 HARD GUARD (ANTI BUG FINAL)
  ========================================================= */

  // ✅ SI DÉJÀ ENVOYÉ → ON NE TOUCHE PLUS JAMAIS
  if (review?.sentAt) {
    return {
      ok: true,
      skipped: true,
      reason: "already_sent",
    };
  }

  const currentStatus = String(review?.status || "").toLowerCase();

  // ✅ Évite double schedule / race condition
  if (["scheduled", "sending", "submitted"].includes(currentStatus)) {
    return {
      ok: true,
      skipped: true,
      reason: `already_${currentStatus}`,
    };
  }

  /* =========================================================
     EMAIL / LOCALE
  ========================================================= */

  const email =
    normalizeEmail(order?.email) ||
    normalizeEmail(order?.customerEmail) ||
    normalizeEmail(order?.customer_email);

  const locale = String(order?.locale || "fr").trim() || "fr";

  if (!email) {
    await ref.update({
      "reviewEmail.status": "skipped",
      "reviewEmail.reason": "missing_email",
      "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
    });

    return { ok: true, skipped: true };
  }

  /* =========================================================
     SETTINGS
  ========================================================= */

  const settings = await readReviewEmailSettings();

  if (!settings.enabled) {
    await ref.update({
      "reviewEmail.status": "disabled",
      "reviewEmail.settings": settings,
      "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
    });

    return { ok: true, skipped: true };
  }

  const delayDays =
    settings.mode === "immediate"
      ? 0
      : clampInt(settings.delayDays, 0, 365, 5);

  const scheduledAt = new Date(Date.now() + delayDays * 86400000);

  /* =========================================================
     🔐 TOKEN SAFE
  ========================================================= */

  let token = review?.token;

  if (!(typeof token === "string" && token.length > 10)) {
    token = createReviewToken({
      orderId,
      email,
      ttlDays: 30,
    });

    await ref.update({
      "reviewEmail.token": token,
    });
  }

  /* =========================================================
     SAVE (SAFE UPDATE — PAS DE SET GLOBAL)
  ========================================================= */

  await ref.update({
    "reviewEmail.status": "scheduled",
    "reviewEmail.scheduledAt": scheduledAt,
    "reviewEmail.delayDays": delayDays,
    "reviewEmail.email": email,
    "reviewEmail.locale": locale,
    "reviewEmail.settings": settings,
    "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
    "reviewEmail.createdAt":
      review?.createdAt || FieldValue.serverTimestamp(),
  });

  /* =========================================================
     🚀 SEND IMMEDIATE
  ========================================================= */

  if (delayDays === 0) {
    try {
const result = await sendReviewEmailNow(orderId);

return {
  ...result,
  ok: true,
  immediate: true,
};
    } catch (err: any) {
      const msg = String(err?.message || err);

      await ref.update({
        "reviewEmail.status": "error",
        "reviewEmail.lastError": msg,
        "reviewEmail.lastErrorAt": FieldValue.serverTimestamp(),
      });

      return { ok: false, error: msg };
    }
  }

  /* =========================================================
     ⏳ DELAY
  ========================================================= */

  return {
    ok: true,
    scheduledAt: scheduledAt.toISOString(),
    delayDays,
  };
}
