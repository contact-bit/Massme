import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================
   AUTH ADMIN
========================= */
function assertAdmin(req: Request) {
  const pass = req.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  console.log("[orders] admin check", {
    hasExpected: !!expected,
    passLen: pass.length,
  });

  if (!expected || pass !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/* =========================
   GET — LISTE COMMANDES
========================= */
export async function GET(req: Request) {
  const auth = assertAdmin(req);
  if (auth) return auth;

  try {
    let docs: any[] = [];

    try {
      const snap = await dbAdmin
        .collection("pending_orders")
        .orderBy("createdAt", "desc")
        .limit(200)
        .get();

      docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e: any) {
      console.log("[orders] orderBy failed, fallback");
      const snap = await dbAdmin
        .collection("pending_orders")
        .limit(200)
        .get();

      docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }

    return NextResponse.json({ orders: docs }, { status: 200 });
  } catch (err: any) {
    console.error("[orders] GET error:", err);
    return NextResponse.json(
      { error: "Orders failed", message: err?.message },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE — SUPPRIMER COMMANDE
========================= */
export async function DELETE(req: Request) {
  const auth = assertAdmin(req);
  if (auth) return auth;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing order id" },
      { status: 400 }
    );
  }

  try {
    await dbAdmin.collection("pending_orders").doc(id).delete();

    console.log("[orders] deleted:", id);

    return NextResponse.json(
      { success: true, id },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[orders] DELETE error:", err);
    return NextResponse.json(
      { error: "Delete failed", message: err?.message },
      { status: 500 }
    );
  }
}
