import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { assertAdmin } from "@/server/adminAuth";
import { finalizePaidOrder } from "@/server/orders/finalizePaidOrder";
import { sendOrderEmails } from "@/lib/mailer";
import { ensureInvoiceNumberForOrder } from "@/server/orders/generateInvoiceNumber";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(v: unknown): string | null {
  const e = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!e || !e.includes("@")) return null;
  return e;
}

function toCentsFromTotals(orderData: any): number {
  const totalTTC = Number(
    orderData?.totals?.totalTTC ??
      orderData?.total ??
      orderData?.amount_total ??
      0
  );
  if (!Number.isFinite(totalTTC)) return 0;
  return Math.round(totalTTC * 100);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await assertAdmin(req);
  if (auth) return auth;

  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    }

    const orderRef = dbAdmin.collection("orders").doc(id);
    const snap = await orderRef.get();

    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    const order = snap.data() as any;

    const alreadyPaid =
      order?.paymentStatus === "paid" ||
      order?.payment?.status === "paid" ||
      order?.payment?.status === "validated" ||
      order?.status === "paid";

    if (alreadyPaid) {
      return NextResponse.json({
        ok: true,
        alreadyPaid: true,
        orderId: id,
      });
    }

    const customerEmail =
      normalizeEmail(order?.email) ||
      normalizeEmail(order?.customerEmail) ||
      normalizeEmail(order?.customer_email) ||
      normalizeEmail(order?.billingCustomer?.email) ||
      normalizeEmail(order?.shippingCustomer?.email) ||
      null;

    await orderRef.set(
      {
        updatedAt: new Date(),
        status: "paid",
        paidAt: new Date(),
        paymentStatus: "paid",
        provider: order?.provider || order?.paymentProvider || "bank_transfer",
        paymentProvider: order?.paymentProvider || "bank_transfer",
        payment: {
          ...(order?.payment || {}),
          provider: "bank_transfer",
          status: "paid",
          validationMode: "manual",
          validatedAt: new Date(),
          validatedBy: "admin",
        },
        bankTransfer: {
          ...(order?.bankTransfer || {}),
          paymentConfirmedByAdmin: true,
          paymentConfirmedAt: new Date(),
        },
      },
      { merge: true }
    );

    let finalizeResult: any = null;
    try {
      finalizeResult = await finalizePaidOrder({
        orderId: id,
        provider: "bank_transfer",
        email: customerEmail,
        locale: order?.locale || "fr",
        payment: {
          providerOrderId: order?.reference || order?.orderNumber || id,
          providerRef: order?.reference || order?.orderNumber || id,
          manuallyValidated: true,
        },
      });

      await orderRef.set(
        {
          "debug.bankTransferFinalizeAt": new Date(),
          "debug.bankTransferFinalizeResult": finalizeResult ?? null,
        },
        { merge: true }
      );
    } catch (err: any) {
      await orderRef.set(
        {
          "debug.bankTransferFinalizeErrorAt": new Date(),
          "debug.bankTransferFinalizeError": String(err?.message || err),
        },
        { merge: true }
      );
    }

    const refreshedSnap = await orderRef.get();
    const refreshedOrder = refreshedSnap.data() as any;

    let emailSent = false;
    if (!refreshedOrder?.emails?.sent && customerEmail) {
      try {
        const amountTotalCents = toCentsFromTotals(refreshedOrder);
        const invoiceNumber =
          refreshedOrder?.invoiceNumber ||
          (await ensureInvoiceNumberForOrder(
            orderRef
          ));

        const mailResult = await sendOrderEmails({
          order: {
            id,
            amount_total: amountTotalCents,
            currency: (refreshedOrder?.currency || "EUR").toLowerCase(),
            customer_email: customerEmail,
            payment_status: "paid",
            provider: "bank_transfer",
            created_at: refreshedOrder?.createdAt || new Date(),
            orderData: {
              ...refreshedOrder,
              invoiceNumber,
            },
            locale: refreshedOrder?.locale || "fr",
            orderNumber:
              refreshedOrder?.orderNumber || refreshedOrder?.reference || id,
            invoiceNumber,
          },
          clientEmail: customerEmail,
        });

        emailSent = true;

        await orderRef.set(
          {
            emails: {
              sent: true,
              sentAt: new Date(),
              provider: "bank_transfer",
              client: mailResult?.client ?? null,
              admin: mailResult?.admin ?? null,
              logistics: mailResult?.logistics ?? [],
            },
            invoiceEmail: {
              status: "sent",
              sentAt: new Date(),
              provider: "bank_transfer",
              orderNumber:
                mailResult?.orderNumber ?? refreshedOrder?.orderNumber ?? id,
              invoiceNumber:
                mailResult?.invoiceNumber ?? invoiceNumber,
            },
          },
          { merge: true }
        );
      } catch (err: any) {
        await orderRef.set(
          {
            emails: {
              sent: false,
              lastErrorAt: new Date(),
              lastError: String(err?.message || err),
              provider: "bank_transfer",
            },
            invoiceEmail: {
              status: "error",
              lastErrorAt: new Date(),
              lastError: String(err?.message || err),
              provider: "bank_transfer",
            },
          },
          { merge: true }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      orderId: id,
      emailSent,
      finalizeResult: finalizeResult ?? null,
    });
  } catch (err: any) {
    console.error("[validate-bank-transfer] error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Validation failed" },
      { status: 500 }
    );
  }
}
