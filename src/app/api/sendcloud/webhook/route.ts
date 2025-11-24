import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📦 Webhook Sendcloud reçu :", body);

    // toujours répondre 200 / 204
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Erreur webhook Sendcloud:", e);
    return new NextResponse("Bad Request", { status: 400 });
  }
}

export function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
