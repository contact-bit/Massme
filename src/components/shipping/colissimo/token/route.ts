import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await fetch(
      "https://ws.colissimo.fr/widget-colissimo/rest/authenticate.rest",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apikey: process.env.COLISSIMO_API_KEY,
          partnerClientCode: process.env.COLISSIMO_PARTNER_CODE || "",
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "Colissimo Authentication Error", details: e },
      { status: 500 }
    );
  }
}
