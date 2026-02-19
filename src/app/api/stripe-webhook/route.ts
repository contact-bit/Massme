import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { dbAdmin } from "@/lib/firebase.admin";
import { Resend } from "resend";
import { generateInvoicePDF } from "@/lib/generateInvoice";
import { computePrice } from "@/lib/pricing";
import { createOrUpdateOrder } from "@/server/shipstation/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY!);

/* =====================================================
   EMAIL I18N
===================================================== */

type EmailLocale = "fr" | "en" | "it" | "es" | "de" | "nl";

const EMAIL_I18N: Record<
  EmailLocale,
  {
    subject: string;
    title: (name: string) => string;
    intro: string;
    orderLabel: string;
  }
> = {
  fr: {
    subject: "🎉 Merci pour votre commande — Facture jointe",
    title: (name) => `Merci ${name} pour votre commande 🎉`,
    intro: "Votre facture est jointe à cet email.",
    orderLabel: "Commande",
  },
  en: {
    subject: "🎉 Thank you for your order — Invoice attached",
    title: (name) => `Thank you ${name} for your order 🎉`,
    intro: "Your invoice is attached to this email.",
    orderLabel: "Order",
  },
  it: {
    subject: "🎉 Grazie per il tuo ordine — Fattura allegata",
    title: (name) => `Grazie ${name} pour il tuo ordine 🎉`,
    intro: "La tua fattura è allegata a questa email.",
    orderLabel: "Ordine",
  },
  es: {
    subject: "🎉 Gracias por tu pedido — Factura adjunta",
    title: (name) => `Gracias ${name} por tu pedido 🎉`,
    intro: "Tu factura está adjunta a este correo.",
    orderLabel: "Pedido",
  },
  de: {
    subject: "🎉 Vielen Dank für Ihre Bestellung — Rechnung beigefügt",
    title: (name) => `Vielen Dank ${name} für Ihre Bestellung 🎉`,
    intro: "Ihre Rechnung est dieser E-Mail beigefügt.",
    orderLabel: "Bestellung",
  },
  nl: {
    subject: "🎉 Bedankt voor je bestelling — Factuur bijgevoegd",
    title: (name) => `Bedankt ${name} voor je bestelling 🎉`,
    intro: "Je factuur est bijgevoegd bij deze e-mail.",
    orderLabel: "Bestelling",
  },
};

/* =====================================================
   RAW BODY → BUFFER (Stripe requirement)
===================================================== */

async function buffer(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

/* =====================================================
   HELPERS (ShipStation)
===================================================== */

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function pickFirst<T>(...values: T[]): T | undefined {
  for (const v of values) if (v !== undefined && v !== null) return v;
  return undefined;
}

function buildShipStationBody(orderData: any, orderId: string) {
  // orderNumber lisible
  const orderNumber =
    asString(pickFirst(orderData?.orderNumber, orderData?.number, orderData?.id), orderId) || orderId;

  const orderDate = (() => {
    const d = pickFirst(orderData?.createdAt, orderData?.created_at, orderData?.created);
    if (d?.toDate) return d.toDate().toISOString(); // Firestore Timestamp
    if (typeof d === "string") return d;
    if (d instanceof Date) return d.toISOString();
    return new Date().toISOString();
  })();

  const customerEmail = isNonEmptyString(orderData?.email)
    ? orderData.email
    : isNonEmptyString(orderData?.customer_email)
    ? orderData.customer_email
    : undefined;

  const ship = orderData?.shippingAddress || orderData?.shipTo || {};
  const bill = orderData?.billingAddress || orderData?.billTo || ship || {};

  const billTo = {
    name:
      asString(
        pickFirst(
          bill?.name,
          bill?.fullName,
          bill?.firstName && bill?.lastName ? `${bill.firstName} ${bill.lastName}` : undefined
        ),
        ""
      ).trim() || "Customer",
    street1: asString(pickFirst(bill?.street1, bill?.address1, bill?.line1, bill?.address), "").trim(),
    city: asString(pickFirst(bill?.city, bill?.town), "").trim(),
    postalCode: asString(pickFirst(bill?.postalCode, bill?.zip, bill?.postcode), "").trim(),
    country: asString(pickFirst(bill?.country, bill?.countryCode), "FR").trim(),
    phone: asString(pickFirst(bill?.phone, bill?.phoneNumber), "").trim(),
  };

  const shipTo = {
    name:
      asString(
        pickFirst(
          ship?.name,
          ship?.fullName,
          ship?.firstName && ship?.lastName ? `${ship.firstName} ${ship.lastName}` : undefined
        ),
        ""
      ).trim() || billTo.name || "Customer",
    street1:
      asString(pickFirst(ship?.street1, ship?.address1, ship?.line1, ship?.address), "").trim() || billTo.street1,
    city: asString(pickFirst(ship?.city, ship?.town), "").trim() || billTo.city,
    postalCode:
      asString(pickFirst(ship?.postalCode, ship?.zip, ship?.postcode), "").trim() || billTo.postalCode,
    country: asString(pickFirst(ship?.country, ship?.countryCode), billTo.country || "FR").trim(),
    phone: asString(pickFirst(ship?.phone, ship?.phoneNumber), "").trim() || billTo.phone,
  };

  // garde-fou sinon ShipStation 400
  if (!shipTo.street1 || !shipTo.city || !shipTo.postalCode || !shipTo.country) {
    throw new Error(
      `ShipTo incomplete: street1=${!!shipTo.street1}, city=${!!shipTo.city}, postalCode=${!!shipTo.postalCode}, country=${!!shipTo.country}`
    );
  }

  // Items
  const rawItems = Array.isArray(orderData?.items) ? orderData.items : [];
  const items = rawItems
    .map((it: any) => {
      const q = Math.max(1, Math.floor(Number(it?.quantity ?? 1) || 1));

      // ✅ chez toi: priceHT est souvent la bonne source (HT)
      const candidate =
        it?.unitPrice ??
        it?.unit_price ??
        it?.priceHT ??
        it?.price_ht ??
        it?.price ??
        it?.amount ??
        it?.total ??
        0;

      let unit = Number(candidate ?? 0) || 0;
      // si centimes (ex: 8250)
      if (Number.isInteger(unit) && unit >= 1000) unit = unit / 100;

      // ✅ image: ShipStation attend une URL publique https
      const imageUrl =
        (isNonEmptyString(it?.imageUrl) && it.imageUrl) ||
        (isNonEmptyString(it?.image_url) && it.image_url) ||
        (isNonEmptyString(it?.image) && it.image) ||
        (isNonEmptyString(it?.thumbnail) && it.thumbnail) ||
        (isNonEmptyString(it?.photoUrl) && it.photoUrl) ||
        (Array.isArray(it?.images) && isNonEmptyString(it.images?.[0]) ? it.images[0] : undefined) ||
        (Array.isArray(it?.images) && isNonEmptyString(it.images?.[0]?.url) ? it.images[0].url : undefined) ||
        undefined;

      return {
        sku: isNonEmptyString(it?.sku) ? it.sku : isNonEmptyString(it?.id) ? String(it.id) : undefined,
        name: asString(pickFirst(it?.name, it?.title, it?.productName), "Produit").trim(),
        quantity: q,
        unitPrice: Math.max(0, unit),

        // ✅ ShipStation item image
        ...(imageUrl ? { imageUrl } : {}),
      };
    })
    .filter((x: any) => x.name && x.quantity > 0);

  if (items.length === 0) {
    throw new Error("ShipStation payload has no items (check orderData.items mapping).");
  }

  // Montants (si dispo)
  const amountPaidTTC = Number(orderData?.totals?.totalTTC ?? orderData?.totalTTC ?? orderData?.amount_total ?? 0);
  const shippingAmount = Number(orderData?.totals?.shipping ?? orderData?.shippingMethod?.priceTTC ?? 0);
  const taxAmount = Number(orderData?.totals?.tax ?? orderData?.totals?.vat ?? 0);

  const orderStatus: "awaiting_shipment" = "awaiting_shipment";

  return {
    orderNumber,
    orderDate,
    orderStatus,
    customerEmail,
    billTo,
    shipTo,
    items,
    ...(Number.isFinite(amountPaidTTC) && amountPaidTTC > 0 ? { amountPaid: amountPaidTTC } : {}),
    ...(Number.isFinite(shippingAmount) && shippingAmount > 0 ? { shippingAmount } : {}),
    ...(Number.isFinite(taxAmount) && taxAmount > 0 ? { taxAmount } : {}),
  };
}

/* =====================================================
   STRIPE WEBHOOK
===================================================== */

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req.body!);
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("❌ Stripe signature error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  console.log("[stripe/webhook] event", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // ✅ Fallback orderId : metadata OU client_reference_id
    const orderId = session.metadata?.order_id || session.client_reference_id || null;

    // Email Stripe (parfois vide selon config Checkout)
    const stripeEmail = session.customer_details?.email || session.customer_email || null;

    if (!orderId) {
      console.error("⚠️ order_id manquant (metadata/client_reference_id)", {
        stripeSessionId: session.id,
        client_reference_id: session.client_reference_id,
        metadata: session.metadata,
      });
      return NextResponse.json({ received: true });
    }

    const ref = dbAdmin.collection("orders").doc(orderId);
    const snap = await ref.get();

    if (!snap.exists) {
      console.error("❌ Commande introuvable:", orderId);
      return NextResponse.json({ received: true });
    }

    const savedOrder = snap.data() as any;

    // ✅ Fallback email depuis Firestore si Stripe ne l'a pas
    const customerEmail = stripeEmail || savedOrder?.email || savedOrder?.customer_email || null;

    if (!customerEmail) {
      console.error("⚠️ email manquant (Stripe + Firestore)", {
        orderId,
        stripeSessionId: session.id,
        stripeEmail,
      });
      return NextResponse.json({ received: true });
    }

    // Langue client
    const locale: EmailLocale = EMAIL_I18N[savedOrder.locale as EmailLocale] ? savedOrder.locale : "fr";
    const mail = EMAIL_I18N[locale];

    // Client
    const firstName =
      savedOrder.shippingAddress?.firstName ||
      savedOrder.customerFirstName ||
      savedOrder.shippingAddress?.name?.split(" ")[0] ||
      "";

    const lastName = savedOrder.shippingAddress?.lastName || savedOrder.customerLastName || "";

    // Items pour facture
    const items = (savedOrder.items || []).map((it: any) => {
      const priceHT = Number(it.priceHT ?? it.price ?? 0);
      return {
        name: it.name || "Produit",
        description: it.description || "",
        quantity: Number(it.quantity || 1),
        price: priceHT,
        priceHT,
      };
    });

    // Shipping (HT/TTC) pour facture
    const sm = savedOrder.shippingMethod || {};
    const shippingHT = Number(sm.priceHT ?? sm.price ?? 0);
    const vatRate = Number(sm.vatRate ?? 0);

    const shippingCalc = computePrice({
      priceHT: shippingHT,
      vatRate,
    });

    const shippingMethod = {
      ...sm,
      price: shippingCalc.ttc,
      priceHT: shippingHT,
      vatRate,
      priceTTC: shippingCalc.ttc,
      type: sm.type || "home",
      relayProvider: sm.relayProvider || null,
    };

    const normalizedOrder = {
      ...savedOrder,
      items,
      shippingMethod,
      shippingPrice: shippingHT,
      customerFirstName: firstName,
      customerLastName: lastName,
    };

    // Update paid
    await ref.update({
      status: "paid",
      paidAt: new Date(),
      stripeSessionId: session.id,
      customerFirstName: firstName,
      customerLastName: lastName,
    });

    // --- ShipStation push (non bloquant) + repush si images arrivent après
    try {
      const snapAfter = await ref.get();
      const orderDataAfter = snapAfter.exists ? (snapAfter.data() as any) : savedOrder;

      const pushedAt = Boolean(orderDataAfter?.shipstation?.pushedAt);
      const pushedWithImages = Boolean(orderDataAfter?.shipstation?.pushedWithImages);

      const hasAnyImage =
        Array.isArray(orderDataAfter?.items) &&
        orderDataAfter.items.some((it: any) => {
          const url =
            it?.imageUrl ||
            it?.image_url ||
            it?.image ||
            it?.thumbnail ||
            it?.photoUrl ||
            (Array.isArray(it?.images) ? it.images?.[0] : null) ||
            (Array.isArray(it?.images) ? it.images?.[0]?.url : null);
          return typeof url === "string" && url.trim().length > 0;
        });

      // ✅ push si jamais poussé, ou si déjà poussé mais pas "avec images" et on a des images maintenant
      const shouldPush = !pushedAt || (!pushedWithImages && hasAnyImage);

      if (shouldPush) {
        const ssBody = buildShipStationBody(orderDataAfter, orderId);

        const ssOrder = await createOrUpdateOrder(ssBody);

        const bodyHasImages =
          Array.isArray((ssBody as any)?.items) &&
          (ssBody as any).items.some((x: any) => typeof x?.imageUrl === "string" && x.imageUrl.trim().length > 0);

        await ref.set(
          {
            shipstation: {
              pushedAt: new Date(),
              pushedWithImages: bodyHasImages,
              orderNumber: ssBody.orderNumber,
              response: ssOrder ?? null,
            },
          },
          { merge: true }
        );

        console.log("[stripe/webhook] shipstation push OK", {
          orderId,
          ssOrderId: (ssOrder as any)?.orderId,
          bodyHasImages,
          repush: pushedAt && !pushedWithImages,
        });
      } else {
        console.log("[stripe/webhook] shipstation already pushed (no update needed), skip", {
          orderId,
          pushedAt,
          pushedWithImages,
          hasAnyImage,
        });
      }
    } catch (err: any) {
      const msg = String(err?.message || err);
      console.error("[stripe/webhook] shipstation push ERROR (non bloquant):", msg);

      await ref.set(
        {
          shipstation: {
            pushedAt: null,
            lastErrorAt: new Date(),
            lastError: msg,
          },
        },
        { merge: true }
      );
    }

    // --- PDF + EMAIL (non bloquant)
    try {
      const pdfBuffer = await generateInvoicePDF(normalizedOrder, orderId, { locale });

      await resend.emails.send({
        from: "Massme • Support <contact@hdconnects.com>",
        to: customerEmail,
        subject: mail.subject,
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px">
            <h2>${mail.title(firstName)}</h2>
            <p>${mail.intro}</p>
            <p><b>${mail.orderLabel} :</b> ${orderId}</p>
          </div>
        `,
        attachments: [
          {
            filename: `invoice-${orderId}.pdf`,
            content: pdfBuffer.toString("base64"),
            contentType: "application/pdf",
          },
        ],
      });

      console.log("📧 Email client envoyé");
    } catch (err) {
      console.error("❌ PDF / email client:", err);
    }
  }

  return NextResponse.json({ received: true });
}
