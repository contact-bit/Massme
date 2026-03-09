import { NextResponse } from "next/server";

export type AdminRole = "admin" | "logistics";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const LOGISTICS_PASSWORD = process.env.LOGISTICS_PASSWORD || "";

export function getRoleFromRequest(req: Request): AdminRole | null {
  const pass = req.headers.get("x-admin-password") || "";

  if (ADMIN_PASSWORD && pass === ADMIN_PASSWORD) return "admin";
  if (LOGISTICS_PASSWORD && pass === LOGISTICS_PASSWORD) return "logistics";

  return null;
}

export function assertAdmin(req: Request) {
  const role = getRoleFromRequest(req);

  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export function assertAdminOrLogistics(req: Request) {
  const role = getRoleFromRequest(req);

  if (role !== "admin" && role !== "logistics") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}