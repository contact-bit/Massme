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

export async function GET(req: Request) {
  const auth = assertAdmin(req);
  if (auth) return auth;

  // Exemple simple: renvoie les 200 dernières commandes
  const snap = await dbAdmin
    .collection("pending_orders")
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();

  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ orders });
}
