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

async function safeSample(colId: string) {
  try {
    const snap = await dbAdmin.collection(colId).limit(5).get();
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return {
      colId,
      sampleCount: docs.length,
      sample: docs.map((o: any) => ({
        id: o.id,
        email: o.email ?? o.shippingAddress?.email ?? null,
        status: o.status ?? null,
        createdAt: o.createdAt ?? null,
        hasItems: Array.isArray(o.items) ? o.items.length : 0,
      })),
    };
  } catch (e: any) {
    return { colId, error: e?.message || String(e) };
  }
}

export async function GET(req: Request) {
  const auth = assertAdmin(req);
  if (auth) return auth;

  try {
    // Project ID (très utile pour vérifier Vercel vs local)
    const projectId =
      (dbAdmin as any)?._settings?.projectId ||
      (dbAdmin as any)?.app?.options?.projectId ||
      process.env.FIREBASE_PROJECT_ID ||
      null;

    const cols = await dbAdmin.listCollections();
    const colIds = cols.map((c) => c.id);

    // Sample de chaque collection existante
    const samples = [];
    for (const colId of colIds) {
      samples.push(await safeSample(colId));
    }

    return NextResponse.json({
      ok: true,
      projectId,
      collections: colIds,
      samples,
      envHints: {
        hasAdminPassword: !!process.env.ADMIN_PASSWORD,
        hasProjectIdEnv: !!process.env.FIREBASE_PROJECT_ID,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "debug failed", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
