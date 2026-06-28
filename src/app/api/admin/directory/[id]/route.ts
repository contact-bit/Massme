import { NextResponse } from "next/server";

import { dbAdmin } from "@/lib/firebase.admin";
import { assertAdmin } from "@/server/adminAuth";
import {
  normalizeDirectoryPayload,
  serializeDirectoryEntry,
} from "@/server/directory/normalize";
import { DIRECTORY_COLLECTION } from "@/server/directory/types";

function getIdFromUrl(req: Request) {
  const url = new URL(req.url);
  const segments = url.pathname
    .split("/")
    .filter(Boolean);

  return segments.at(-1) || "";
}

export async function PATCH(req: Request) {
  const unauthorized = await assertAdmin(req);
  if (unauthorized) return unauthorized;

  const id = getIdFromUrl(req);

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "ID manquant." },
      { status: 400 }
    );
  }

  const ref = dbAdmin
    .collection(DIRECTORY_COLLECTION)
    .doc(id);
  const snap = await ref.get();

  if (!snap.exists) {
    return NextResponse.json(
      { ok: false, error: "Fiche introuvable." },
      { status: 404 }
    );
  }

  const current = serializeDirectoryEntry(
    snap.id,
    snap.data() || {}
  );
  const body = await req.json().catch(() => null);
  const payload = normalizeDirectoryPayload(
    body?.data || body,
    current
  );

  if (!payload.name || !payload.city) {
    return NextResponse.json(
      {
        ok: false,
        error: "Le nom et la ville sont obligatoires.",
      },
      { status: 400 }
    );
  }

  await ref.set(payload, { merge: true });

  return NextResponse.json({
    ok: true,
  });
}

export async function DELETE(req: Request) {
  const unauthorized = await assertAdmin(req);
  if (unauthorized) return unauthorized;

  const id = getIdFromUrl(req);

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "ID manquant." },
      { status: 400 }
    );
  }

  await dbAdmin
    .collection(DIRECTORY_COLLECTION)
    .doc(id)
    .delete();

  return NextResponse.json({
    ok: true,
  });
}
