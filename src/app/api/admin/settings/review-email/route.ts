import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase.admin";
import { FieldValue } from "firebase-admin/firestore";

const DOC_PATH = "settings/review_email";

type ReviewEmailSettings = {
  enabled: boolean;
  mode: "immediate" | "delay";
  delayDays: number;
};

function normalizeSettings(data: unknown): ReviewEmailSettings {
  const value = data && typeof data === "object"
    ? data as Record<string, unknown>
    : {};
  const mode = value.mode === "immediate" ? "immediate" : "delay";
  const rawDelayDays = Number(value.delayDays);
  const delayDays = Number.isFinite(rawDelayDays)
    ? Math.max(0, Math.min(365, Math.floor(rawDelayDays)))
    : 5;

  return {
    enabled: typeof value.enabled === "boolean" ? value.enabled : true,
    mode,
    delayDays: mode === "immediate" ? 0 : delayDays,
  };
}

function parseBody(body: unknown): ReviewEmailSettings {
  if (!body || typeof body !== "object") {
    throw new Error("Payload invalide.");
  }

  const value = body as Record<string, unknown>;

  if (typeof value.enabled !== "boolean") {
    throw new Error("Le champ 'enabled' doit être un booléen.");
  }

  if (value.mode !== "immediate" && value.mode !== "delay") {
    throw new Error("Le champ 'mode' doit être 'immediate' ou 'delay'.");
  }

  const rawDelayDays = Number(value.delayDays);
  if (!Number.isFinite(rawDelayDays)) {
    throw new Error("Le champ 'delayDays' doit être un nombre valide.");
  }

  return {
    enabled: value.enabled,
    mode: value.mode,
    delayDays: value.mode === "immediate"
      ? 0
      : Math.max(0, Math.min(365, Math.floor(rawDelayDays))),
  };
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
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
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, message: errorMessage(error, "Impossible de charger les réglages.") },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const db = getAdminDb();
    const settings = parseBody(await req.json());

    await db.doc(DOC_PATH).set(
      {
        ...settings,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, settings });
  } catch (error: unknown) {
    const message = errorMessage(error, "Impossible d'enregistrer les réglages.");
    return NextResponse.json(
      { ok: false, message },
      {
        status: message.includes("invalide") || message.includes("doit être")
          ? 400
          : 500,
      }
    );
  }
}
