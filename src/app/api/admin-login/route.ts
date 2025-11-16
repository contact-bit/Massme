import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  return NextResponse.json(
    { error: "Invalid password" },
    { status: 401 }
  );
}
