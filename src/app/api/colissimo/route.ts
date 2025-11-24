import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postal = searchParams.get("postal");

  if (!postal) {
    return NextResponse.json({ error: "Missing postal code" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.laposte.fr/geolocalisation/v1/point_retrait?codePostal=${postal}&type=RDV`,
      {
        headers: {
          "X-Okapi-Key": process.env.COLISSIMO_API_KEY!, // mettre dans .env
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("API Colissimo ERROR", e);
    return NextResponse.json({ error: "API error" }, { status: 500 });
  }
}
