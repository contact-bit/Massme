import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const data = await resend.emails.send({
      from: 'Massme <contact@hdconnects.com>',
      to: 'dazz.services@gmail.com',
      subject: 'Test Resend depuis API',
      html: `<p>✅ Test réussi - ton domaine fonctionne parfaitement !</p>`,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error });
  }
}
