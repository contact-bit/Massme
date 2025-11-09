import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get("session_id");

  if (!session_id) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);
  const orderId = session.metadata?.order_id;

  if (!orderId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const docRef = doc(db, "pending_orders", orderId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return NextResponse.json({ error: "No order found" }, { status: 404 });
  }

  return NextResponse.json({ order: { id: snap.id, ...snap.data() } });
}
