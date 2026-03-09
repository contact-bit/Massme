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

function normalizeProvider(value: unknown): "internal" | "shipstation" {
  return value === "shipstation" ? "shipstation" : "internal";
}

export async function GET(req: Request) {
  const auth = assertAdmin(req);
  if (auth) return auth;

  try {
    const snap = await dbAdmin.collection("settings").doc("logistics").get();
    const data = snap.exists ? (snap.data() as any) : null;

    return NextResponse.json({
      ok: true,
      provider: normalizeProvider(data?.provider),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const auth = assertAdmin(req);
  if (auth) return auth;

  try {
    const body = await req.json().catch(() => ({}));
    const provider = normalizeProvider((body as any)?.provider);

    await dbAdmin.collection("settings").doc("logistics").set(
      {
        provider,
        updatedAt: new Date().toISOString(),
        updatedBy: "admin",
      },
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      provider,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}