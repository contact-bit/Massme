// src/app/api/dev/review-link/route.ts

import { NextResponse } from "next/server";
import { createReviewToken } from "@/lib/reviewToken";

function getBaseUrl() {
  const url = process.env.PUBLIC_BASE_URL;

  if (!url) {
    throw new Error("PUBLIC_BASE_URL is missing");
  }

  return url.replace(/\/+$/, "");
}

export async function GET(req: Request) {
  // Dev only
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      {
        ok: false,
        error: "not_available",
      },
      {
        status: 404,
      }
    );
  }

  const { searchParams } = new URL(req.url);

  const orderId = String(
    searchParams.get("order_id") || ""
  ).trim();

  const email = String(
    searchParams.get("email") || ""
  )
    .trim()
    .toLowerCase();

  const locale =
    String(searchParams.get("locale") || "fr").trim() ||
    "fr";

  if (!orderId || !email) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing_params",
        hint: "Use ?order_id=XXX&email=YYY&locale=fr",
      },
      {
        status: 400,
      }
    );
  }

  const token = createReviewToken({
    orderId,
    email,
    ttlDays: 30,
  });

  const baseUrl = getBaseUrl();

  const url =
    `${baseUrl}/${encodeURIComponent(locale)}/review` +
    `?order_id=${encodeURIComponent(orderId)}` +
    `&email=${encodeURIComponent(email)}` +
    `&token=${encodeURIComponent(token)}`;

  // Redirection directe
  return NextResponse.redirect(url, 302);
}