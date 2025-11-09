import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, currency, shippingMethod, customerEmail, shippingAddress } = body;

    const line_items = items.map((item: any) => ({
      price_data: {
        currency,
        product_data: { name: item.name?.fr || item.name?.en || "Produit" },
        unit_amount: Math.round(item.price?.eur * 100),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items,
      shipping_address_collection: { allowed_countries: ["FR", "BE", "CH"] },
      metadata: {
        name: shippingAddress.name,
        email: shippingAddress.email,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        phone: shippingAddress.phone,
        shippingMethod: shippingMethod.name.fr,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/${currency === "eur" ? "fr" : "en"}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/${currency === "eur" ? "fr" : "en"}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Stripe error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
