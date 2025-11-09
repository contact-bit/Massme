import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, currency, shippingMethod, customerEmail, locale = "fr" } = body; // ✅ récupère la langue

    const line_items = items.map((item: any) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items,
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: shippingMethod.name?.[locale] ?? "Livraison",
            fixed_amount: {
              amount: Math.round(shippingMethod.price?.[locale] * 100),
              currency,
            },
            type: "fixed_amount",
          },
        },
      ],
      // ✅ dynamique selon la langue et ton .env
      success_url: `${process.env.NEXT_PUBLIC_URL}/${locale}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/${locale}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Stripe error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
