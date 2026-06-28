import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase.admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const db = getAdminDb();
    const body = await req.json();

    const reviewId = String(body.reviewId || "").trim();
    const action = String(body.action || "").trim();
    const moderatedBy = String(body.moderatedBy || "admin").trim().slice(0, 80);

    if (!reviewId) return NextResponse.json({ ok: false, message: "reviewId manquant" }, { status: 400 });
    if (action !== "approve" && action !== "reject")
      return NextResponse.json({ ok: false, message: "action invalide" }, { status: 400 });

    const status = action === "approve" ? "approved" : "rejected";

    await db.collection("reviews").doc(reviewId).set(
      {
        status,
        moderatedAt: FieldValue.serverTimestamp(),
        moderatedBy,
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, message: e?.message || String(e) }, { status: 500 });
  }
}
