import { NextResponse } from "next/server";

import { dbAdmin } from "@/lib/firebase.admin";
import { assertAdmin } from "@/server/adminAuth";
import {
  normalizeDirectoryPayload,
  serializeDirectoryEntry,
} from "@/server/directory/normalize";
import {
  DIRECTORY_COLLECTION,
  type DirectoryEntryStatus,
} from "@/server/directory/types";
import type { CountryCode } from "@/lib/shipping-i18n";

function isCountryCode(value: unknown): value is CountryCode {
  return (
    value === "FR" ||
    value === "GB" ||
    value === "DE" ||
    value === "ES" ||
    value === "IT" ||
    value === "NL" ||
    value === "CH"
  );
}

export async function GET(req: Request) {
  const unauthorized = await assertAdmin(req);
  if (unauthorized) return unauthorized;

  const url = new URL(req.url);
  const status =
    url.searchParams.get("status") as DirectoryEntryStatus | null;
  const countryParam = url.searchParams.get("country");
  const country = isCountryCode(countryParam)
    ? countryParam
    : null;

  let query: FirebaseFirestore.Query =
    dbAdmin.collection(DIRECTORY_COLLECTION);

  if (
    status === "draft" ||
    status === "published" ||
    status === "archived"
  ) {
    query = query.where("status", "==", status);
  }

  const snap = await query.get();
  const entries = snap.docs
    .map((doc) =>
      serializeDirectoryEntry(
        doc.id,
        doc.data()
      )
    )
    .filter(
      (entry) => !country || entry.country === country
    )
    .sort((a, b) =>
      (b.updatedAt || "").localeCompare(
        a.updatedAt || ""
      )
    );

  return NextResponse.json({
    ok: true,
    entries,
  });
}

export async function POST(req: Request) {
  const unauthorized = await assertAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const payload = normalizeDirectoryPayload(body);

  if (!payload.name || !payload.city) {
    return NextResponse.json(
      {
        ok: false,
        error: "Le nom et la ville sont obligatoires.",
      },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const docRef = await dbAdmin
    .collection(DIRECTORY_COLLECTION)
    .add({
      ...payload,
      createdAt: now,
      updatedAt: now,
    });

  return NextResponse.json(
    {
      ok: true,
      id: docRef.id,
    },
    { status: 201 }
  );
}
