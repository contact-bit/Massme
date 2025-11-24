import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📦 Webhook Sendcloud reçu :", body);

    // ➜ Ici tu peux enregistrer les événements dans Firestore si besoin

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("❌ Erreur Webhook Sendcloud :", e);
    return NextResponse.json({ error: true }, { status: 500 });
  }
}
