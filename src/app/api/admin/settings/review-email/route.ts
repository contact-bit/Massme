import { NextResponse } from "next/server";
import { getAdminDb } from "@/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const DOC_PATH = "settings/review_email";

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.doc(DOC_PATH).get();
    const data = snap.exists ? snap.data() : null;

    const parsedDelayDays = Number(data?.delayDays);

    return NextResponse.json({
      ok: true,
      settings: {
        enabled: data?.enabled ?? true,
        mode: data?.mode === "immediate" ? "immediate" : "delay",
        delayDays: Number.isFinite(parsedDelayDays) ? parsedDelayDays : 5,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || String(e) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const db = getAdminDb();
    const body = await req.json();

    const enabled = Boolean(body.enabled);
    const mode = body.mode === "immediate" ? "immediate" : "delay";

    const delayDaysNum = Number(body.delayDays);
    const delayDays = Number.isFinite(delayDaysNum)
      ? Math.max(0, Math.min(365, Math.floor(delayDaysNum)))
      : 5;

    await db.doc(DOC_PATH).set(
      {
        enabled,
        mode,
        delayDays,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || String(e) },
      { status: 500 }
    );
  }
}