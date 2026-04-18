// src/server/adminAuth.ts

import { NextResponse } from "next/server";

/* ================= TYPES ================= */

export type AdminRole = "admin" | "logistics" | null;

/* ================= GET ROLE ================= */

export function getRoleFromRequest(req: Request): AdminRole {
  const pass = req.headers.get("x-admin-password") || "";

  const adminPass = process.env.ADMIN_PASSWORD;
  const logisticsPass = process.env.LOGISTICS_PASSWORD;

  if (adminPass && pass === adminPass) return "admin";
  if (logisticsPass && pass === logisticsPass) return "logistics";

  return null;
}

/* ================= ASSERT ADMIN ================= */

export function assertAdmin(req: Request): Response | null {
  const role = getRoleFromRequest(req);

  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

/* ================= ASSERT ADMIN OR LOGISTICS ================= */

export function assertAdminOrLogistics(req: Request): Response | null {
  const role = getRoleFromRequest(req);

  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null; // ✅ NE JAMAIS retourner role ici
}