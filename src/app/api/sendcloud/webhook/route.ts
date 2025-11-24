import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📦 Webhook Sendcloud reçu :", body);

    // tu pourras traiter ici les notifications Sendcloud
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Erreur webhook Sendcloud :", err);
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
}

// Facultatif mais propre : bloquer les GET
export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
