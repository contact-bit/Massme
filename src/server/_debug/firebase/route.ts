import { NextResponse } from "next/server";
import { getAdminApp, getAdminDb } from "@/server/firebaseAdmin";

export async function GET() {
  const app = getAdminApp();
  const db = getAdminDb();

  // tentative d’accès (permission + projet)
  const ping = await db.collection("_debug").limit(1).get();

  return NextResponse.json({
    ok: true,
    projectId: app.options?.projectId || null,
    firestoreHost: (db as any)?._settings?.host || null,
    debugDocsInCollection: ping.size,
  });
}