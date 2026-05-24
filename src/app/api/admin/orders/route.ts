import { NextResponse } from "next/server";

import { dbAdmin } from "@/lib/firebase.admin";

import {
  assertAdminOrLogistics,
} from "@/server/adminAuth";

export const runtime = "nodejs";

export const dynamic =
  "force-dynamic";

/* =========================================================
   HELPERS
========================================================= */

function getDateValue(
  v: any
): number {
  if (!v) return 0;

  if (
    typeof v?.toDate ===
    "function"
  ) {
    try {
      return v
        .toDate()
        .getTime();
    } catch {}
  }

  const d = new Date(v);

  return isNaN(
    d.getTime()
  )
    ? 0
    : d.getTime();
}

/* =========================================================
   GET ORDERS
========================================================= */

export async function GET(
  req: Request
) {
  const roleOrResponse =
    assertAdminOrLogistics(req);

  if (
    roleOrResponse instanceof
    Response
  ) {
    return roleOrResponse;
  }

  try {
    const snap =
      await dbAdmin
        .collection("orders")
        .limit(300)
        .get();

    const orders =
      snap.docs
        .map((d) => {
          const o =
            d.data() as any;

          /* =============================================
             TOTAL ULTRA ROBUSTE
          ============================================= */

          const total =
            typeof o?.totals
              ?.totalTTC ===
            "number"
              ? o.totals
                  .totalTTC
              : typeof o
                    ?.totals
                    ?.totalHT ===
                  "number"
              ? o.totals
                  .totalHT
              : typeof o?.total ===
                "number"
              ? o.total
              : typeof o
                    ?.amount_total ===
                  "number"
              ? o.amount_total /
                100
              : Array.isArray(
                  o?.items
                )
              ? o.items.reduce(
                  (
                    sum: number,
                    it: any
                  ) =>
                    sum +
                    (typeof it?.priceHT ===
                    "number"
                      ? it.priceHT
                      : typeof it?.price ===
                        "number"
                      ? it.price
                      : 0) *
                      (it?.quantity ??
                        1),
                  0
                )
              : 0;

          /* =============================================
             RETURN CLEAN
          ============================================= */

          return {
            id: d.id,

            /* =========================================
               ORDER NUMBER
            ========================================= */

            orderNumber:
              typeof o?.orderNumber ===
              "string"
                ? o.orderNumber
                : null,

            /* =========================================
               STATUS / EMAIL
            ========================================= */

            status:
              o?.status ??
              "unknown",

            email:
              o?.email ?? "",

            /* =========================================
               ITEMS
            ========================================= */

            items:
              Array.isArray(
                o?.items
              )
                ? o.items
                : [],

            /* =========================================
               SHIPPING
            ========================================= */

            shippingMethod:
              o?.shippingMethod ??
              null,

            shippingAddress:
              o?.shippingAddress ??
              null,

            billingAddress:
              o?.billingAddress ??
              null,

            /* =========================================
               🔥 MEDIA / ACQUISITION
            ========================================= */

            heardFrom:
              o?.heardFrom ??
              null,

            heardFromOther:
              o?.heardFromOther ??
              null,

            /* =========================================
               RELAY / PAYMENT
            ========================================= */

            relayPoint:
              o?.relayPoint ??
              null,

            payment:
              o?.payment ??
              null,

            paymentMethod:
              o?.paymentMethod ??
              null,

            fees:
              o?.fees ??
              null,

            commission:
              o?.commission ??
              null,

            /* =========================================
               DATES
            ========================================= */

            createdAt:
              o?.createdAt ??
              null,

            paidAt:
              o?.paidAt ??
              null,

            /* =========================================
               SHIPPING STATUS
            ========================================= */

            shippingStatus:
              o?.shippingStatus ??
              null,

            trackingNumber:
              o?.trackingNumber ??
              null,

            carrier:
              o?.carrier ??
              null,

            /* =========================================
               REVIEW EMAIL
            ========================================= */

            reviewEmail:
              o?.reviewEmail ??
              null,

            invoiceEmail:
              o?.invoiceEmail ??
              null,

            emails:
              o?.emails ??
              null,

            /* =========================================
               TOTALS
            ========================================= */

            totals: {
              totalTTC: total,
            },

            total,
            __total: total,
          };
        })

        /* =============================================
           SORT
        ============================================= */

        .sort((a, b) => {
          const da =
            getDateValue(
              a.createdAt
            );

          const db =
            getDateValue(
              b.createdAt
            );

          return db - da;
        });

    return NextResponse.json(
      { orders },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(
      "[admin/orders] GET error:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Orders failed",

        message:
          err?.message ??
          "Unknown error",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE ORDER
========================================================= */

export async function DELETE(
  req: Request
) {
  const roleOrResponse =
    assertAdminOrLogistics(req);

  if (
    roleOrResponse instanceof
    Response
  ) {
    return roleOrResponse;
  }

  const role =
    roleOrResponse;

  if (role !== "admin") {
    return NextResponse.json(
      {
        error:
          "Unauthorized",
      },
      { status: 401 }
    );
  }

  const {
    searchParams,
  } = new URL(req.url);

  const id =
    searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      {
        error:
          "Missing order id",
      },
      { status: 400 }
    );
  }

  try {
    await dbAdmin
      .collection("orders")
      .doc(id)
      .delete();

    return NextResponse.json(
      {
        success: true,
        id,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(
      "[admin/orders] DELETE error:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Delete failed",

        message:
          err?.message ??
          "Unknown error",
      },
      { status: 500 }
    );
  }
}
