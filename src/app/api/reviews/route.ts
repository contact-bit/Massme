import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/server/firebaseAdmin";
import { verifyReviewToken } from "@/lib/reviewToken";

type ReviewStatus = "pending" | "approved" | "rejected";

function s(v: unknown, max = 2000) {
  return String(v ?? "").trim().slice(0, max);
}

function normalizeEmail(v: unknown): string {
  return String(v ?? "").trim().toLowerCase();
}

function parseStatus(v: unknown): ReviewStatus | null {
  const value = String(v ?? "").trim().toLowerCase();
  if (value === "pending" || value === "approved" || value === "rejected") {
    return value;
  }
  return null;
}

function parseLimit(v: unknown, fallback = 4, max = 20) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(n)));
}

function toIsoDate(value: any): string | null {
  if (!value) return null;

  try {
    if (typeof value?.toDate === "function") {
      return value.toDate().toISOString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString();
    }

    return null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);

    const requestedStatus = parseStatus(searchParams.get("status")) || "approved";
    const limit = parseLimit(searchParams.get("limit"), 4, 20);

    const snap = await db
      .collection("reviews")
      .where("status", "==", requestedStatus)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const rows = snap.docs.map((doc) => {
      const data = doc.data() as any;

      return {
        id: doc.id,
        rating: Number.isFinite(Number(data?.rating)) ? Number(data.rating) : 0,
        comment: s(data?.comment, 2000),
        locale: s(data?.locale || "fr", 20),
        createdAt: toIsoDate(data?.createdAt),
      };
    });

    return NextResponse.json({
      ok: true,
      rows,
    });
  } catch (e: any) {
    console.error("GET /api/reviews error:", e);

    return NextResponse.json(
      {
        ok: false,
        error: "server_error",
        message: e?.message || String(e),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const db = getAdminDb();
    const body = await req.json();

    const orderId = s(body.orderId, 120);
    const token = s(body.token, 2000);
    const email = normalizeEmail(body.email);
    const comment = s(body.comment, 2000);
    const locale = s(body.locale || "fr", 20);

    const ratingNum = Number(body.rating);
    const rating = Number.isFinite(ratingNum)
      ? Math.max(1, Math.min(5, Math.round(ratingNum)))
      : NaN;

    if (!orderId) {
      return NextResponse.json({ ok: false, error: "order_id_missing" }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ ok: false, error: "token_missing" }, { status: 400 });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "email_invalid" }, { status: 400 });
    }

    if (!Number.isFinite(rating)) {
      return NextResponse.json({ ok: false, error: "rating_invalid" }, { status: 400 });
    }

    if (!comment || comment.trim().length < 3) {
      return NextResponse.json({ ok: false, error: "comment_invalid" }, { status: 400 });
    }

    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ ok: false, error: "order_not_found" }, { status: 404 });
    }

    const order = orderSnap.data() as any;

    const expectedEmail = normalizeEmail(
      order?.email || order?.customerEmail || order?.customer_email || ""
    );

    if (!expectedEmail || !expectedEmail.includes("@")) {
      return NextResponse.json({ ok: false, error: "order_email_missing" }, { status: 400 });
    }

    if (expectedEmail !== email) {
      return NextResponse.json({ ok: false, error: "email_mismatch" }, { status: 403 });
    }

    const tokenCheck = verifyReviewToken(token, {
      orderId,
      email: expectedEmail,
    });

    if (!tokenCheck.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "token_invalid",
          reason: tokenCheck.reason,
        },
        { status: 403 }
      );
    }

    const reviewId = `${orderId}__${expectedEmail}`;
    const reviewRef = db.collection("reviews").doc(reviewId);
    const existingReviewSnap = await reviewRef.get();

    if (existingReviewSnap.exists) {
      return NextResponse.json(
        {
          ok: false,
          error: "review_already_exists",
        },
        { status: 409 }
      );
    }

    await reviewRef.set(
      {
        orderId,
        email: expectedEmail,
        rating,
        comment,
        locale,
        items: Array.isArray(order?.items) ? order.items : [],
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
        moderatedAt: null,
        moderatedBy: null,
      },
      { merge: false }
    );

    await orderRef.set(
      {
        reviewSubmittedAt: FieldValue.serverTimestamp(),
        "reviewEmail.submittedAt": FieldValue.serverTimestamp(),
        "reviewEmail.status": "submitted",
        "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, id: reviewId });
  } catch (e: any) {
    console.error("POST /api/reviews error:", e);

    return NextResponse.json(
      {
        ok: false,
        error: "server_error",
        message: e?.message || String(e),
      },
      { status: 500 }
    );
  }
}