import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// petit store en mémoire pour limiter les tentatives par IP
type IpState = {
  count: number;
  blockedUntil: number; // timestamp ms
};

const attemptsByIp = new Map<string, IpState>();

export async function POST(req: Request) {
  if (!ADMIN_PASSWORD) {
    console.error("❌ ADMIN_PASSWORD manquant dans .env");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const { password } = await req.json();

  const ipHeader = req.headers.get("x-forwarded-for") || "";
  const ip = ipHeader.split(",")[0].trim() || "unknown";

  const now = Date.now();
  const state = attemptsByIp.get(ip) || { count: 0, blockedUntil: 0 };

  // 🔒 IP bloquée temporairement
  if (state.blockedUntil && now < state.blockedUntil) {
    return NextResponse.json(
      {
        error: "Trop de tentatives. Réessayez dans quelques minutes.",
      },
      { status: 429 }
    );
  }

  // ❌ Mauvais mot de passe
  if (password !== ADMIN_PASSWORD) {
    const newCount = state.count + 1;

    if (newCount >= 5) {
      // blocage 10 minutes
      attemptsByIp.set(ip, {
        count: 0,
        blockedUntil: now + 10 * 60 * 1000,
      });
    } else {
      attemptsByIp.set(ip, {
        count: newCount,
        blockedUntil: 0,
      });
    }

    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  }

  // ✅ OK → reset compteur
  attemptsByIp.set(ip, { count: 0, blockedUntil: 0 });

  return NextResponse.json({ ok: true }, { status: 200 });
}
