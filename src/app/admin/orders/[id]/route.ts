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
  { params }: { params: { id: string } }
) {
  const auth = assertAdmin(req);
  if (auth) return auth;

  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  try {
    // 🔥 suppression réelle
    await dbAdmin.collection("pending_orders").doc(id).delete();

    // (optionnel) si tu as aussi une collection orders
    await dbAdmin.collection("orders").doc(id).delete().catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[DELETE order]", err);
    return NextResponse.json(
      { error: err.message || "Delete failed" },
      { status: 500 }
    );
  }
}
