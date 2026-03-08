import { NextResponse } from "next/server";
import { getAdminDb } from "@/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const DOC_PATH = "settings/review_email";

type ReviewEmailSettings = {
  enabled: boolean;
  mode: "immediate" | "delay";
  delayDays: number;
};

function normalizeSettings(data: any): ReviewEmailSettings {
  const mode = data?.mode === "immediate" ? "immediate" : "delay";

  const rawDelayDays = Number(data?.delayDays);
  const delayDays = Number.isFinite(rawDelayDays)
    ? Math.max(0, Math.min(365, Math.floor(rawDelayDays)))
    : 5;

  return {
    enabled: typeof data?.enabled === "boolean" ? data.enabled : true,
    mode,
    delayDays: mode === "immediate" ? 0 : delayDays,
  };
}

function parseBody(body: any): ReviewEmailSettings {
  if (!body || typeof body !== "object") {
    throw new Error("Payload invalide.");
  }

  if (typeof body.enabled !== "boolean") {
    throw new Error("Le champ 'enabled' doit être un booléen.");
  }

  if (body.mode !== "immediate" && body.mode !== "delay") {
    throw new Error("Le champ 'mode' doit être 'immediate' ou 'delay'.");
  }

  const delayDaysNum = Number(body.delayDays);

  if (!Number.isFinite(delayDaysNum)) {
    throw new Error("Le champ 'delayDays' doit être un nombre valide.");
  }

  const delayDays = Math.max(0, Math.min(365, Math.floor(delayDaysNum)));

  return {
    enabled: body.enabled,
    mode: body.mode,
    delayDays: body.mode === "immediate" ? 0 : delayDays,
  };
}

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.doc(DOC_PATH).get();
    const settings = normalizeSettings(snap.exists ? snap.data() : null);

    return NextResponse.json({
      ok: true,
      settings,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        message: e?.message || "Impossible de charger les réglages.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const db = getAdminDb();
    const body = await req.json();
    const settings = parseBody(body);

    await db.doc(DOC_PATH).set(
      {
        ...settings,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      settings,
    });
  } catch (e: any) {
    const message = e?.message || "Impossible d'enregistrer les réglages.";

    return NextResponse.json(
      { ok: false, message },
      {
        status:
          message.includes("invalide") || message.includes("doit être")
            ? 400
            : 500,
      }
    );
  }
}