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
  const mode: "immediate" | "delay" = d?.mode === "immediate" ? "immediate" : "delay";

  const rawDelayDays = clampInt(d?.delayDays, 0, 365, 5);
  const delayDays = mode === "immediate" ? 0 : rawDelayDays;

  return {
    enabled,
    mode,
    delayDays,
  };
}

export async function scheduleReviewEmailForOrder(orderId: string) {
  const ref = dbAdmin.collection("orders").doc(orderId);

  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set(
      {
        "reviewEmail.status": "error",
        "reviewEmail.lastErrorAt": FieldValue.serverTimestamp(),
        "reviewEmail.lastError": `Order not found: ${orderId}`,
      },
      { merge: true }
    );
    throw new Error(`Order not found: ${orderId}`);
  }

  const order = snap.data() as any;

  const curStatus = String(order?.reviewEmail?.status || "").toLowerCase();
  if (curStatus === "scheduled" || curStatus === "sent" || curStatus === "sending") {
    return { ok: true, skipped: true, reason: `already_${curStatus}` };
  }

  await ref.set(
    {
      "reviewEmail.status": "starting",
      "reviewEmail.startedAt": FieldValue.serverTimestamp(),
      "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  const email =
    normalizeEmail(order?.email) ||
    normalizeEmail(order?.customerEmail) ||
    normalizeEmail(order?.customer_email);

  const locale = String(order?.locale || "fr").trim() || "fr";

  if (!email) {
    await ref.set(
      {
        "reviewEmail.status": "skipped",
        "reviewEmail.reason": "missing_email",
        "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return { ok: true, skipped: true, reason: "missing_email" };
  }

  const settings = await readReviewEmailSettings();

  if (!settings.enabled) {
    await ref.set(
      {
        "reviewEmail.status": "disabled",
        "reviewEmail.reason": "settings_disabled",
        "reviewEmail.settings": settings,
        "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return { ok: true, skipped: true, reason: "settings_disabled" };
  }

  const delayDays = settings.mode === "immediate" ? 0 : clampInt(settings.delayDays, 0, 365, 5);
  const scheduledAt = new Date(Date.now() + delayDays * 24 * 3600 * 1000);

  const token = createReviewToken({
    orderId,
    email,
    ttlDays: 30,
  });

  await ref.set(
    {
      "reviewEmail.status": "scheduled",
      "reviewEmail.scheduledAt": scheduledAt,
      "reviewEmail.token": token,
      "reviewEmail.locale": locale,
      "reviewEmail.email": email,
      "reviewEmail.settings": {
        enabled: settings.enabled,
        mode: settings.mode,
        delayDays,
      },
      "reviewEmail.createdAt": FieldValue.serverTimestamp(),
      "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  if (settings.mode === "immediate" || delayDays === 0) {
    try {
      await ref.set(
        {
          "reviewEmail.status": "sending",
          "reviewEmail.sendingAt": FieldValue.serverTimestamp(),
          "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      const sent = await sendReviewEmailNow(orderId);

      await ref.set(
        {
          "reviewEmail.status": "sent",
          "reviewEmail.sentAt": FieldValue.serverTimestamp(),
          "reviewEmail.sendResult": sent ?? null,
          "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return {
        ...(sent ?? {}),
        ok: true,
        immediate: true,
        delayDays: 0,
      };
    } catch (err: any) {
      const msg = String(err?.message || err);

      await ref.set(
        {
          "reviewEmail.status": "error",
          "reviewEmail.lastErrorAt": FieldValue.serverTimestamp(),
          "reviewEmail.lastError": msg,
          "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return { ok: false, immediate: true, error: msg };
    }
  }

  return {
    ok: true,
    scheduledAt: scheduledAt.toISOString(),
    delayDays,
  };
}