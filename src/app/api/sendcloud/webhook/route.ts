import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    console.log("📦 Webhook Sendcloud reçu :", payload);

    // Exemple : vérifier un type d'événement
    if (payload.event === "parcel_status_changed") {
      console.log("📦 Nouveau statut colis :", payload.parcel?.status?.message);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Erreur webhook Sendcloud :", err);
    return new NextResponse("Invalid payload", { status: 400 });
  }
}

// Empêche GET
export function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
