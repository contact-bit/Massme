// src/lib/reviewToken.ts
import crypto from "crypto";

type Payload = {
  orderId: string;
  email: string;
  exp: number; // unix seconds
};

/* =========================================================
   HELPERS
========================================================= */

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function b64urlJson(obj: any) {
  return b64url(JSON.stringify(obj));
}

function sign(data: string, secret: string) {
  return b64url(
    crypto.createHmac("sha256", secret).update(data).digest()
  );
}

function unb64urlToString(input: string) {
  let s = input.replaceAll("-", "+").replaceAll("_", "/");
  const mod = s.length % 4;
  if (mod) s += "=".repeat(4 - mod);
  return Buffer.from(s, "base64").toString("utf8");
}

function normalizeEmail(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

/* =========================================================
   CREATE
========================================================= */

export function createReviewToken(params: {
  orderId: string;
  email: string;
  ttlDays?: number;
}) {
  const secret = process.env.REVIEW_TOKEN_SECRET;
  if (!secret) throw new Error("Missing env REVIEW_TOKEN_SECRET");

  const ttlDays = params.ttlDays ?? 30;
  const exp = Math.floor(Date.now() / 1000) + ttlDays * 24 * 3600;

  const payload: Payload = {
    orderId: String(params.orderId),
    email: normalizeEmail(params.email),
    exp,
  };

  const body = b64urlJson(payload);
  const sig = sign(body, secret);

  return `${body}.${sig}`;
}

/* =========================================================
   VERIFY
========================================================= */

export function verifyReviewToken(
  token: string,
  expected: { orderId: string; email: string }
) {
  const secret = process.env.REVIEW_TOKEN_SECRET;
  if (!secret) throw new Error("Missing env REVIEW_TOKEN_SECRET");

  try {
    const [body, sig] = token.split(".");

    if (!body || !sig) {
      return { ok: false as const, reason: "bad_format" as const };
    }

    const goodSig = sign(body, secret);

    const a = Buffer.from(sig);
    const b = Buffer.from(goodSig);

    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { ok: false as const, reason: "bad_signature" as const };
    }

    let payload: Payload;

    try {
      payload = JSON.parse(unb64urlToString(body)) as Payload;
    } catch {
      return { ok: false as const, reason: "bad_payload" as const };
    }

    if (!payload?.orderId || !payload?.email || !payload?.exp) {
      return { ok: false as const, reason: "bad_payload" as const };
    }

    const expectedOrderId = String(expected.orderId);
    const expectedEmail = normalizeEmail(expected.email);
    const tokenEmail = normalizeEmail(payload.email);

    // ✅ check order (strict)
    if (payload.orderId !== expectedOrderId) {
      return { ok: false as const, reason: "order_mismatch" as const };
    }

    // ✅ check email (safe)
    if (tokenEmail !== expectedEmail) {
      return { ok: false as const, reason: "email_mismatch" as const };
    }

    // ✅ expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { ok: false as const, reason: "expired" as const };
    }

    return {
      ok: true as const,
      payload,
    };
  } catch (err: any) {
    return {
      ok: false as const,
      reason: err?.message || "verify_failed",
    };
  }
}