import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const r = await resend.emails.send({
      from: "Massme <contact@hdconnects.com>",
      to: "devhdconnects@gmail.com",
      subject: "🧪 Test email from PRODUCTION - Massme",
      html: "<p>🚀 Test envoyé depuis hdconnects.com !</p>",
    });

    return NextResponse.json({ success: true, r });
  } catch (error: any) {
    console.error("ERR:", error);
    return NextResponse.json({ success: false, error: error.message || error });
  }
}
