import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase.admin";
import { FieldValue } from "firebase-admin/firestore";
import { verifyReviewToken } from "@/lib/reviewToken";

function s(v: any, max = 2000) {
  return String(v ?? "")
    .trim()
    .slice(0, max);
}

function normalizeEmail(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toLowerCase();
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
      ? Math.max(
          1,
          Math.min(5, Math.round(ratingNum))
        )
      : NaN;

    // VALIDATIONS

    if (!orderId) {
      return NextResponse.json(
        {
          ok: false,
          error: "order_id_missing",
        },
        {
          status: 400,
        }
      );
    }

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error: "token_missing",
        },
        {
          status: 400,
        }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        {
          ok: false,
          error: "email_invalid",
        },
        {
          status: 400,
        }
      );
    }

    if (!Number.isFinite(rating)) {
      return NextResponse.json(
        {
          ok: false,
          error: "rating_invalid",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !comment ||
      comment.trim().length < 3
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "comment_invalid",
        },
        {
          status: 400,
        }
      );
    }

    // ORDER

    const orderRef =
      db.collection("orders").doc(orderId);

    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        {
          ok: false,
          error: "order_not_found",
        },
        {
          status: 404,
        }
      );
    }

    const order = orderSnap.data() as any;

    const expectedEmail = normalizeEmail(
      order?.email ||
        order?.customerEmail ||
        order?.customer_email ||
        ""
    );

    if (
      !expectedEmail ||
      !expectedEmail.includes("@")
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "order_email_missing",
        },
        {
          status: 400,
        }
      );
    }

    // VERIFY TOKEN

    const tokenCheck = verifyReviewToken(
      token,
      {
        orderId,
      }
    );

    if (!tokenCheck.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "token_invalid",
          reason: tokenCheck.reason,
        },
        {
          status: 403,
        }
      );
    }

    // REVIEW

    const reviewId = `${orderId}__${expectedEmail}`;

    const reviewRef =
      db.collection("reviews").doc(reviewId);

    const existingReviewSnap =
      await reviewRef.get();

    if (existingReviewSnap.exists) {
      return NextResponse.json(
        {
          ok: false,
          error: "review_already_exists",
        },
        {
          status: 409,
        }
      );
    }

    // CREATE REVIEW

    await reviewRef.set(
      {
        orderId,
        email: expectedEmail,
        rating,
        comment,
        locale,
        items: Array.isArray(order?.items)
          ? order.items
          : [],
        status: "pending",
        createdAt:
          FieldValue.serverTimestamp(),
        moderatedAt: null,
        moderatedBy: null,
      },
      {
        merge: false,
      }
    );

    // UPDATE ORDER

    await orderRef.set(
      {
        reviewSubmittedAt:
          FieldValue.serverTimestamp(),

        "reviewEmail.submittedAt":
          FieldValue.serverTimestamp(),

        "reviewEmail.status":
          "submitted",

        "reviewEmail.updatedAt":
          FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    return NextResponse.json({
      ok: true,
      id: reviewId,
    });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        ok: false,
        error: "server_error",
        message: e?.message || String(e),
      },
      {
        status: 500,
      }
    );
  }
}
