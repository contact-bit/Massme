import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function assertAdmin(req: Request) {
  const pass = req.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected || pass !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = assertAdmin(req);
  if (auth) return auth;

  try {
    const { id } = await context.params; // ✅ IMPORTANT

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    console.log("[DELETE ORDER]", id);

    // Supprime dans pending_orders
    await dbAdmin.collection("pending_orders").doc(id).delete();

    // Optionnel : supprimer aussi dans orders si elle existe
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
