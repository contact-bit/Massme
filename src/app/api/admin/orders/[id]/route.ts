import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { buildManualShippingUpdate } from "@/server/logistics/updates";
import { assertAdmin, assertAdminOrLogistics, getRoleFromRequest } from "@/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await assertAdmin(req);
  if (auth) return auth;

  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    console.log("[DELETE ORDER]", id);

    await dbAdmin.collection("pending_orders").doc(id).delete();

    try {
      await dbAdmin.collection("orders").doc(id).delete();
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[DELETE ORDER ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Delete failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const roleOrResponse = await assertAdminOrLogistics(req);

if (roleOrResponse instanceof Response) {
  return roleOrResponse;
}

  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const role = await getRoleFromRequest(req);

    const body = await req.json().catch(() => ({} as any));
    const addressUpdates = {
      ...(body?.shippingAddress &&
      typeof body.shippingAddress === "object"
        ? { shippingAddress: body.shippingAddress }
        : {}),
      ...(body?.billingAddress &&
      typeof body.billingAddress === "object"
        ? { billingAddress: body.billingAddress }
        : {}),
    };

    if (Object.keys(addressUpdates).length > 0) {
      if (
        role !== "admin" &&
        role !== "logistics"
      ) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      await dbAdmin.collection("pending_orders").doc(id).set(addressUpdates, {
        merge: true,
      });

      try {
        await dbAdmin.collection("orders").doc(id).set(addressUpdates, {
          merge: true,
        });
      } catch {}

      return NextResponse.json({
        ok: true,
        ...addressUpdates,
      });
    }

    if (
      body?.contact &&
      typeof body.contact === "object"
    ) {
      if (role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      const email =
        typeof body.contact.email === "string"
          ? body.contact.email.trim()
          : "";

      const phone =
        typeof body.contact.phone === "string"
          ? body.contact.phone.trim()
          : "";

      const updates = {
        email,
        customerEmail: email,
        customer_email: email,
        "shippingAddress.phone": phone,
        "billingAddress.phone": phone,
      };

      await dbAdmin.collection("pending_orders").doc(id).set(updates, {
        merge: true,
      });

      try {
        await dbAdmin.collection("orders").doc(id).set(updates, {
          merge: true,
        });
      } catch {}

      return NextResponse.json({
        ok: true,
        contact: {
          email,
          phone,
        },
      });
    }

    if (
      body?.paymentFee &&
      typeof body.paymentFee === "object"
    ) {
      if (role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      const rawFee = Number(body.paymentFee.amount);

      if (!Number.isFinite(rawFee) || rawFee < 0) {
        return NextResponse.json(
          { error: "Invalid payment fee" },
          { status: 400 }
        );
      }

      const fee = Math.round(rawFee * 100) / 100;
      const feeProvider =
        typeof body.paymentFee.provider === "string"
          ? body.paymentFee.provider
              .trim()
              .toLowerCase()
          : "";
      const feeLabel =
        typeof body.paymentFee.label === "string"
          ? body.paymentFee.label.trim()
          : "";
      const feeMethodId =
        typeof body.paymentFee.methodId === "string"
          ? body.paymentFee.methodId.trim()
          : "";

      const updates: Record<string, any> = {
        "payment.fee": fee,
        "payment.feeCurrency": "EUR",
        "payment.feeSource": "manual_admin",
        "payment.feeDetectedAt": new Date(),
      };

      if (feeProvider) {
        updates["payment.feeProvider"] =
          feeProvider;
      }

      if (feeLabel) {
        updates["payment.feeLabel"] = feeLabel;
      }

      if (feeMethodId) {
        updates["payment.feeMethodId"] =
          feeMethodId;
      }

      await dbAdmin.collection("pending_orders").doc(id).set(updates, {
        merge: true,
      });

      try {
        await dbAdmin.collection("orders").doc(id).set(updates, {
          merge: true,
        });
      } catch {}

      return NextResponse.json({
        ok: true,
        paymentFee: {
          amount: fee,
          currency: "EUR",
          source: "manual_admin",
          provider: feeProvider,
          label: feeLabel,
          methodId: feeMethodId,
        },
      });
    }

    if (
      body?.deliveryNote &&
      typeof body.deliveryNote === "object"
    ) {
      const packageCountRaw =
        body.deliveryNote.packageCount;

      const packageCount =
        packageCountRaw === "" ||
        packageCountRaw == null
          ? null
          : Math.max(
              0,
              Math.round(
                Number(packageCountRaw)
              )
            );

      if (
        packageCountRaw !== "" &&
        packageCountRaw != null &&
        !Number.isFinite(
          Number(packageCountRaw)
        )
      ) {
        return NextResponse.json(
          { error: "Invalid package count" },
          { status: 400 }
        );
      }

      const deliveryNote = {
        packageCount,
        weight:
          typeof body.deliveryNote.weight ===
          "string"
            ? body.deliveryNote.weight
                .trim()
                .slice(0, 80)
            : "",
        instructions:
          typeof body.deliveryNote.instructions ===
          "string"
            ? body.deliveryNote.instructions
                .trim()
                .slice(0, 800)
            : "",
        updatedAt: new Date(),
        updatedBy:
          role === "logistics"
            ? "logistics_manual"
            : "admin_manual",
      };

      await dbAdmin.collection("pending_orders").doc(id).set(
        { deliveryNote },
        { merge: true }
      );

      try {
        await dbAdmin.collection("orders").doc(id).set(
          { deliveryNote },
          { merge: true }
        );
      } catch {}

      return NextResponse.json({
        ok: true,
        deliveryNote,
      });
    }

    const { shippingStatus, trackingNumber, carrier } = body as {
      shippingStatus?: "pending" | "preparing" | "shipped" | "delivered" | "cancelled";
      trackingNumber?: string | null;
      carrier?: string | null;
    };

    if (!shippingStatus) {
      return NextResponse.json(
        { error: "Missing shippingStatus" },
        { status: 400 }
      );
    }

    const orderSnap = await dbAdmin.collection("orders").doc(id).get();
    const order = orderSnap.exists ? (orderSnap.data() as any) : null;

    const existingShipDate =
      order?.shippingTracking?.shipDate ||
      order?.fulfillment?.tracking?.shipDate ||
      order?.shippedAt ||
      null;

    const effectiveTrackingNumber =
      trackingNumber !== undefined
        ? trackingNumber
        : order?.trackingNumber ||
          order?.shippingTracking?.trackingNumber ||
          order?.fulfillment?.tracking?.trackingNumber ||
          null;

    const effectiveCarrier =
      carrier !== undefined
        ? carrier
        : order?.carrier ||
          order?.shippingTracking?.carrier ||
          order?.fulfillment?.tracking?.carrier ||
          null;

    const updates = buildManualShippingUpdate({
      shippingStatus,
      trackingNumber: effectiveTrackingNumber,
      carrier: effectiveCarrier,
      actor: role === "logistics" ? "logistics_manual" : "admin_manual",
      existingShipDate,
    });

    console.log("[PATCH ORDER SHIPPING]", id, updates);

    await dbAdmin.collection("pending_orders").doc(id).set(updates, {
      merge: true,
    });

    try {
      await dbAdmin.collection("orders").doc(id).set(updates, { merge: true });
    } catch {}

    return NextResponse.json({
      ok: true,
      shippingMode: "manual",
      shippingStatus,
    });
  } catch (err: any) {
    console.error("[PATCH ORDER SHIPPING ERROR]", err);

    if (err?.message === "invalid_shipping_status") {
      return NextResponse.json(
        { error: "Invalid shippingStatus" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Update failed" },
      { status: 500 }
    );
  }
}
