import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function assertAdmin(req: Request) {
  const pass = req.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  // logs utiles sur Vercel
  console.log("[orders] hasExpected?", !!expected, "passLen:", pass.length);

  if (!expected || pass !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(req: Request) {
  const auth = assertAdmin(req);
  if (auth) return auth;

  try {
    // IMPORTANT: si createdAt manque sur certains docs, orderBy peut planter.
    // On fait un fallback sans orderBy.
    let docs: any[] = [];

    try {
      const snap = await dbAdmin
        .collection("pending_orders")
        .orderBy("createdAt", "desc")
        .limit(200)
        .get();

      docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e: any) {
      console.log("[orders] orderBy createdAt failed, fallback:", e?.message || String(e));
      const snap = await dbAdmin.collection("pending_orders").limit(200).get();
      docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }

    console.log("[orders] returned:", docs.length);

    return NextResponse.json({ orders: docs }, { status: 200 });
  } catch (err: any) {
    console.error("[orders] ERROR:", err);
    return NextResponse.json(
      { error: "Orders failed", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
