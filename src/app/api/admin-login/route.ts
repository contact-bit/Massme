import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Limites
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

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
    const remainingMs = state.blockedUntil - now;
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

    return NextResponse.json(
      {
        error: "Trop de tentatives. Réessayez dans quelques minutes.",
        blocked: true,
        retryAfterMinutes: remainingMinutes,
      },
      { status: 429 }
    );
  }

  // ❌ Mauvais mot de passe
  if (password !== ADMIN_PASSWORD) {
    const newCount = state.count + 1;

    if (newCount >= MAX_ATTEMPTS) {
      // blocage 10 minutes
      attemptsByIp.set(ip, {
        count: 0,
        blockedUntil: now + BLOCK_DURATION_MS,
      });

      return NextResponse.json(
        {
          error:
            "Trop de tentatives. Connexion bloquée pendant 10 minutes.",
          blocked: true,
          retryAfterMinutes: Math.ceil(BLOCK_DURATION_MS / (60 * 1000)),
        },
        { status: 429 }
      );
    } else {
      attemptsByIp.set(ip, {
        count: newCount,
        blockedUntil: 0,
      });

      return NextResponse.json(
        {
          error: "Mot de passe incorrect",
          blocked: false,
          remainingAttempts: Math.max(MAX_ATTEMPTS - newCount, 0),
        },
        { status: 401 }
      );
    }
  }

  // ✅ OK → reset compteur
  attemptsByIp.set(ip, { count: 0, blockedUntil: 0 });

  return NextResponse.json({ ok: true }, { status: 200 });
}
