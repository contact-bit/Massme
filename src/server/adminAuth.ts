// src/server/adminAuth.ts

import { NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/server/adminSession";

/* ================= TYPES ================= */

export type AdminRole = "admin" | "logistics" | null;

/* ================= GET ROLE ================= */

export async function getRoleFromRequest(req: Request): Promise<AdminRole> {
  const session = await getAdminSessionFromRequest(req);
  return session?.role || null;
}

/* ================= ASSERT ADMIN ================= */

export async function assertAdmin(req: Request): Promise<Response | null> {
  const role = await getRoleFromRequest(req);

  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

/* ================= ASSERT ADMIN OR LOGISTICS ================= */

export async function assertAdminOrLogistics(
  req: Request
): Promise<Response | null> {
  const role = await getRoleFromRequest(req);

  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null; // ✅ NE JAMAIS retourner role ici
}
