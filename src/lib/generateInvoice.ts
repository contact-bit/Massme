// src/lib/generateInvoice.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2456d5ba-af23-4219-7115-f54286a7c600/public";

export async function generateInvoicePDF(
  order: any,
  orderId: string,
  opts?: {
    invoiceNumber?: string;
    vatRate?: number;
    issueDate?: Date;
  }
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width: W, height: H } = page.getSize();

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 🎨 DA OculaRest (bleus)
  const blue = rgb(0.14, 0.35, 0.86);
  const blueDark = rgb(0.05, 0.18, 0.55);
  const ink = rgb(0.06, 0.07, 0.1);
  const muted = rgb(0.4, 0.45, 0.55);
  const border = rgb(0.86, 0.89, 0.93);

  const M = 42;
  let y = H - M;

  /* =========================================================
     🖼️ LOGO OCULAREST (EMBED)
  ========================================================= */
  let logoDims = { w: 0, h: 0 };

  try {
    const logoRes = await fetch(LOGO_URL);
    const logoBytes = await logoRes.arrayBuffer();
    const logoImage = await pdfDoc.embedPng(logoBytes);

    // Taille contrôlée (safe)
    const maxW = 110;
    const scale = maxW / logoImage.width;

    logoDims = {
      w: logoImage.width * scale,
      h: logoImage.height * scale,
    };

    page.drawImage(logoImage, {
      x: M,
      y: y - logoDims.h,
      width: logoDims.w,
      height: logoDims.h,
    });
  } catch (e) {
    console.error("Logo OculaRest non chargé", e);
  }

  /* =========================================================
     🏢 BLOC ENTREPRISE (GAUCHE)
  ========================================================= */
  let leftY = y - logoDims.h - 10;

  const companyLines = [
    "LAZURCO",
    "189 avenue de Fabron",
    "06200 Nice, FRANCE",
    "",
    "SIRET : 831 588 926 00012",
    "TVA : FR52831588926",
    "",
    "Email : contact@hdconnects.com",
    "Site : www.ocularest.fr",
  ];

  for (const line of companyLines) {
    if (!line) {
      leftY -= 10;
      continue;
    }
    page.drawText(line, {
      x: M,
      y: leftY,
      size: 8.5,
      font: regularFont,
      color: line === "LAZURCO" ? ink : muted,
    });
    leftY -= 12;
  }

  /* =========================================================
     🧾 BLOC FACTURE (DROITE)
  ========================================================= */
  const rightX = 260;
  const rightW = W - rightX - M;

  page.drawRectangle({
    x: rightX,
    y: y - 44,
    width: rightW,
    height: 44,
    borderColor: border,
    borderWidth: 1,
  });

  // bande bleue
  page.drawRectangle({
    x: rightX,
    y: y - 9,
    width: rightW,
    height: 9,
    color: blue,
  });

  page.drawText("OculaRest", {
    x: rightX + 14,
    y: y - 26,
    size: 13,
    font: boldFont,
    color: ink,
  });

  page.drawText("par Lazurco", {
    x: rightX + 14,
    y: y - 38,
    size: 8.5,
    font: regularFont,
    color: muted,
  });

  const factTxt = "FACTURE";
  const factW = boldFont.widthOfTextAtSize(factTxt, 11);
  page.drawText(factTxt, {
    x: rightX + rightW - factW - 14,
    y: y - 30,
    size: 11,
    font: boldFont,
    color: ink,
  });

  y -= 70;

  /* =========================================================
     👤 CLIENT
  ========================================================= */
  const a = order.shippingAddress || {};

  page.drawRectangle({
    x: rightX,
    y: y - 95,
    width: rightW,
    height: 95,
    borderColor: border,
    borderWidth: 1,
  });

  page.drawRectangle({
    x: rightX,
    y: y - 18,
    width: rightW,
    height: 18,
    color: blueDark,
  });

  page.drawText("Client", {
    x: rightX + rightW / 2 - 18,
    y: y - 14,
    size: 10,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  let cy = y - 38;
  const clientLines = [
    (a.name || "").toUpperCase(),
    a.address,
    `${a.postalCode || ""} ${a.city || ""}`,
    a.country || "FR",
  ].filter(Boolean);

  for (const line of clientLines) {
    page.drawText(line, {
      x: rightX + 12,
      y: cy,
      size: 9,
      font: regularFont,
      color: ink,
    });
    cy -= 13;
  }

  /* =========================================================
     🧮 TOTAL (EXTRAIT)
  ========================================================= */
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsTotal = items.reduce(
    (s: number, it: any) => s + Number(it.price || 0) * Number(it.quantity || 1),
    0
  );
  const shipping = Number(order?.shippingMethod?.price || 0);
  const totalHT = itemsTotal + shipping;
  const tva = totalHT * 0.2;
  const totalTTC = totalHT + tva;

  page.drawText(`TOTAL TTC : ${totalTTC.toFixed(2)} €`, {
    x: rightX,
    y: y - 140,
    size: 14,
    font: boldFont,
    color: blueDark,
  });

  /* ========================================================= */
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
