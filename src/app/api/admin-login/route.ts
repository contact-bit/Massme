import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const LOGISTICS_PASSWORD = process.env.LOGISTICS_PASSWORD;

// Limites
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

type IpState = {
  count: number;
  blockedUntil: number;
};

const attemptsByIp = new Map<string, IpState>();

type AdminRole = "admin" | "logistics";

function getRoleFromPassword(password: string): AdminRole | null {
  if (ADMIN_PASSWORD && password === ADMIN_PASSWORD) return "admin";
  if (LOGISTICS_PASSWORD && password === LOGISTICS_PASSWORD) return "logistics";
  return null;
}

export async function POST(req: Request) {
  if (!ADMIN_PASSWORD) {
    console.error("❌ ADMIN_PASSWORD manquant dans .env");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const { password } = await req.json().catch(() => ({ password: "" }));

  const ipHeader = req.headers.get("x-forwarded-for") || "";
  const ip = ipHeader.split(",")[0].trim() || "unknown";

  const now = Date.now();
  const state = attemptsByIp.get(ip) || { count: 0, blockedUntil: 0 };

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

  const role = getRoleFromPassword(String(password || ""));

  if (!role) {
    const newCount = state.count + 1;

    if (newCount >= MAX_ATTEMPTS) {
      attemptsByIp.set(ip, {
        count: 0,
        blockedUntil: now + BLOCK_DURATION_MS,
      });

      return NextResponse.json(
        {
          error: "Trop de tentatives. Connexion bloquée pendant 10 minutes.",
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

  attemptsByIp.set(ip, { count: 0, blockedUntil: 0 });

  return NextResponse.json(
    {
      ok: true,
      role,
    },
    { status: 200 }
  );
}