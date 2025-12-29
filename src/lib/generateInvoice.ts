// src/lib/generateInvoice.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Facture OculaRest (par Lazurco) — style bleu + logo
 * - Sans QR code
 * - "OculaRest / par Lazurco" placé dans le rectangle FACTURE sans chevauchement
 * - TVA 20% (modifiable)
 */
export async function generateInvoicePDF(
  order: any,
  orderId: string,
  opts?: {
    invoiceNumber?: string; // ex: F20251229
    vatRate?: number; // ex: 0.2
    paidLabel?: string; // ex: "FACTURE ACQUITTEE"
    issueDate?: Date; // par défaut: now
    logoUrl?: string; // (optionnel, si tu passes un embedImage déjà ailleurs)
  }
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 portrait
  const { width: W, height: H } = page.getSize();

  // Fonts
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Theme (bleus DA)
  const blue = rgb(0.14, 0.35, 0.86);
  const blue2 = rgb(0.05, 0.18, 0.55);
  const ink = rgb(0.06, 0.07, 0.10);
  const muted = rgb(0.35, 0.40, 0.48);
  const border = rgb(0.86, 0.89, 0.93);
  const soft = rgb(0.96, 0.98, 1);

  // Layout
  const M = 42; // margin
  const colLeftW = 170;
  const gap = 18;
  const rightX = M + colLeftW + gap;
  const rightW = W - M - rightX;

  const VAT_RATE = typeof opts?.vatRate === "number" ? opts.vatRate : 0.2;
  const issueDate = opts?.issueDate ?? new Date();

  // -------------------------
  // Helpers
  // -------------------------
  const fmtMoney = (n: number) => `${(Math.round((n || 0) * 100) / 100).toFixed(2)} €`;
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const fmtDate = (d: Date) => `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
  const safe = (v: any) => (v == null ? "" : String(v));
  const widthOf = (font: any, text: string, size: number) => font.widthOfTextAtSize(text || "", size);

  const drawText = (
    x: number,
    y: number,
    text: string,
    size: number,
    font = regularFont,
    color = ink
  ) => {
    page.drawText(safe(text), { x, y, size, font, color });
  };

  const drawHr = (y: number) => {
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: border });
  };

  const drawBox = (
    x: number,
    y: number,
    w: number,
    h: number,
    cfg?: { fill?: any; stroke?: any; strokeWidth?: number; r?: number }
  ) => {
    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      color: cfg?.fill,
      borderColor: cfg?.stroke,
      borderWidth: cfg?.strokeWidth ?? 0,
      // pdf-lib n'a pas le radius natif sur drawRectangle, on garde rect "sharp"
    });
  };

  const ellipsize = (font: any, text: string, size: number, maxW: number) => {
    const t = safe(text);
    if (widthOf(font, t, size) <= maxW) return t;
    const dots = "…";
    let out = t;
    while (out.length > 0 && widthOf(font, out + dots, size) > maxW) {
      out = out.slice(0, -1);
    }
    return out.length ? out + dots : dots;
  };

  // -------------------------
  // Normalize order data
  // -------------------------
  const a = order?.shippingAddress ?? {};
  const customerName = safe(a.name) || safe(order?.customerName) || safe(order?.name) || "—";
  const customerAddr1 = safe(a.address);
  const customerCity = safe(a.city);
  const customerZip = safe(a.postalCode);
  const customerCountry = safe(a.country);
  const customerEmail = safe(a.email) || safe(order?.email) || "—";

  const itemsRaw = Array.isArray(order?.items) ? order.items : [];
  const itemsNorm: { label: string; qty: number; unit: number; ref?: string }[] = itemsRaw.map((it: any) => {
    const label =
      typeof it?.name === "string"
        ? it.name
        : it?.name?.fr || it?.name?.en || it?.title || "Produit";
    const qty = Number(it?.quantity ?? 1) || 1;
    const unit = Number(it?.price ?? it?.unitPrice ?? 0) || 0;
    return { label: safe(label), qty, unit, ref: safe(it?.ref || it?.sku || "") };
  });

  const shipping = Number(order?.shippingMethod?.price ?? order?.shippingPrice ?? 0) || 0;

  const totalHT_items = itemsNorm.reduce((s: number, it) => s + it.unit * it.qty, 0);
  const totalHT = totalHT_items + shipping;
  const tva = totalHT * VAT_RATE;
  const totalTTC = totalHT + tva;

  const status = safe(order?.status);
  const isPaid = status === "paid" || safe(order?.paid) === "true" || safe(order?.paymentStatus) === "paid";

  const invoiceNumber =
    opts?.invoiceNumber ||
    `F${issueDate.getFullYear()}${pad2(issueDate.getMonth() + 1)}${pad2(issueDate.getDate())}`;

  // -------------------------
  // HEADER (top)
  // -------------------------
  let yTop = H - M;

  // Logo (on l'affiche comme un "badge" bleu si tu ne veux pas fetcher l'image côté serveur)
  // 👉 Pour mettre TON logo image, je te donne la version "embed" juste après si tu veux.
  // Ici on fait un logo placeholder propre, stable.
  const logoX = M;
  const logoY = yTop - 44;

  // Badge rond (place-holder)
  page.drawRectangle({
    x: logoX,
    y: logoY,
    width: 42,
    height: 42,
    color: blue,
    borderColor: rgb(1, 1, 1),
    borderWidth: 0,
  });
  drawText(logoX + 52, logoY + 26, "OculaRest", 14, boldFont, ink);
  drawText(logoX + 52, logoY + 10, "par Lazurco", 9, regularFont, muted);

  // Col left company block
  const leftInfoY = logoY - 10;
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
  let ly = leftInfoY - 10;
  for (const line of companyLines) {
    if (!line) {
      ly -= 10;
      continue;
    }
    drawText(M, ly, line, 8.5, regularFont, line === "LAZURCO" ? ink : muted);
    ly -= 12;
  }

  // Right: FACTURE rectangle with safe zones
  const titleBoxW = rightW;
  const titleBoxH = 44;
  const titleX = rightX;
  const titleY = yTop - titleBoxH;

  // Box border
  page.drawRectangle({
    x: titleX,
    y: titleY,
    width: titleBoxW,
    height: titleBoxH,
    borderColor: border,
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });
  // Top blue bar
  page.drawRectangle({
    x: titleX,
    y: titleY + titleBoxH - 9,
    width: titleBoxW,
    height: 9,
    color: blue,
  });

  // Zones (no overlap)
  const pad = 14;
  const rightZoneW = 110; // zone pour FACTURE
  const gapZones = 10;
  const leftZoneX = titleX + pad;
  const leftZoneW = titleBoxW - pad * 2 - rightZoneW - gapZones;
  const rightZoneX = titleX + titleBoxW - pad - rightZoneW;

  const brandTxt = ellipsize(boldFont, "OculaRest", 12, leftZoneW);
  const bylineTxt = ellipsize(regularFont, "par Lazurco", 8.5, leftZoneW);

  drawText(leftZoneX, titleY + 20, brandTxt, 12, boldFont, ink);
  drawText(leftZoneX, titleY + 8, bylineTxt, 8.5, regularFont, muted);

  const factureTxt = "FACTURE";
  const factureSize = 11;
  const factureW = widthOf(boldFont, factureTxt, factureSize);
  const fx = rightZoneX + Math.max(0, (rightZoneW - factureW) / 2);
  drawText(fx, titleY + 17, factureTxt, factureSize, boldFont, ink);

  // Client box
  const clientBoxY = titleY - 110;
  const clientBoxH = 98;

  page.drawRectangle({
    x: rightX,
    y: clientBoxY,
    width: rightW,
    height: clientBoxH,
    borderColor: border,
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });
  page.drawRectangle({
    x: rightX,
    y: clientBoxY + clientBoxH - 18,
    width: rightW,
    height: 18,
    color: blue2,
  });
  const clientTitle = "Client";
  const clientTitleW = widthOf(boldFont, clientTitle, 10);
  drawText(rightX + (rightW - clientTitleW) / 2, clientBoxY + clientBoxH - 13, clientTitle, 10, boldFont, rgb(1, 1, 1));

  let cy = clientBoxY + clientBoxH - 34;
  drawText(rightX + 12, cy, safe(customerName).toUpperCase() || "—", 10, boldFont, ink);
  cy -= 14;
  drawText(rightX + 12, cy, customerAddr1 || "—", 9, regularFont, ink);
  cy -= 12;
  drawText(rightX + 12, cy, `${customerZip} ${customerCity}`.trim() || "—", 9, regularFont, ink);
  cy -= 12;
  drawText(rightX + 12, cy, customerCountry || "FR", 9, regularFont, muted);

  // Separator line under header zone
  const sepY = clientBoxY - 16;
  drawHr(sepY);

  // -------------------------
  // Meta row (Date / N° facture)
  // -------------------------
  let y = sepY - 26;
  drawText(M, y, "Date :", 9, boldFont, muted);
  drawText(M + 46, y, fmtDate(issueDate), 9, regularFont, ink);

  const nfLabel = "N° Facture :";
  const nfLabelW = widthOf(boldFont, nfLabel, 9);
  const nfValW = widthOf(boldFont, invoiceNumber, 9);

  const nfX = W - M - (nfLabelW + 10 + nfValW);
  drawText(nfX, y, nfLabel, 9, boldFont, muted);
  drawText(nfX + nfLabelW + 10, y, invoiceNumber, 9, boldFont, ink);

  y -= 14;
  drawHr(y);

  // -------------------------
  // Info light box (commande / email / TVA intracom)
  // -------------------------
  y -= 12;

  const infoBoxH = 58;
  page.drawRectangle({
    x: M,
    y: y - infoBoxH,
    width: W - 2 * M,
    height: infoBoxH,
    borderColor: border,
    borderWidth: 1,
    color: soft,
  });

  const boxPad = 12;
  const bx = M + boxPad;
  let by = y - 18;

  drawText(bx, by, "Votre commande", 8, boldFont, muted);
  drawText(bx + 92, by, "www.ocularest.fr", 8, boldFont, blue2);

  by -= 14;
  drawText(bx, by, "ID commande :", 8, boldFont, muted);
  drawText(bx + 92, by, safe(orderId), 8, regularFont, ink);

  by -= 14;
  drawText(bx, by, "Email client :", 8, boldFont, muted);
  drawText(bx + 92, by, customerEmail || "—", 8, regularFont, ink);

  y = y - infoBoxH - 22;

  // -------------------------
  // TABLE (Référence / Désignation / Qté / PU HT / Total HT)
  // -------------------------
  const tableX = M;
  const tableW = W - 2 * M;

  const cRef = 86;
  const cDes = tableW - (cRef + 60 + 92 + 92);
  const cQty = 60;
  const cPU = 92;
  const cTot = 92;

  const headerH = 18;
  const rowH = 18;

  // table header background
  page.drawRectangle({ x: tableX, y: y - headerH, width: tableW, height: headerH, color: blue2 });
  const headY = y - 13;

  const head = [
    { t: "Référence", x: tableX + 8, w: cRef - 16 },
    { t: "Désignation", x: tableX + cRef + 8, w: cDes - 16 },
    { t: "Quantité", x: tableX + cRef + cDes + 8, w: cQty - 16 },
    { t: "Prix unitaire HT", x: tableX + cRef + cDes + cQty + 8, w: cPU - 16 },
    { t: "Prix Total HT", x: tableX + cRef + cDes + cQty + cPU + 8, w: cTot - 16 },
  ];

  for (const h of head) drawText(h.x, headY, h.t, 8, boldFont, rgb(1, 1, 1));

  y -= headerH;

  const drawRow = (cells: { ref: string; des: string; qty: string; pu: string; tot: string }, idx: number) => {
    // row bg
    page.drawRectangle({
      x: tableX,
      y: y - rowH,
      width: tableW,
      height: rowH,
      color: idx % 2 === 0 ? rgb(1, 1, 1) : rgb(0.985, 0.99, 1),
    });

    // borders
    page.drawLine({ start: { x: tableX, y }, end: { x: tableX + tableW, y }, thickness: 1, color: border });

    // vertical lines
    const xs = [
      tableX + cRef,
      tableX + cRef + cDes,
      tableX + cRef + cDes + cQty,
      tableX + cRef + cDes + cQty + cPU,
    ];
    for (const vx of xs) {
      page.drawLine({ start: { x: vx, y }, end: { x: vx, y: y - rowH }, thickness: 1, color: border });
    }

    const ty = y - 13;

    const refTxt = ellipsize(regularFont, cells.ref, 8, cRef - 16);
    const desTxt = ellipsize(regularFont, cells.des, 8, cDes - 16);

    drawText(tableX + 8, ty, refTxt, 8, regularFont, ink);
    drawText(tableX + cRef + 8, ty, desTxt, 8, regularFont, ink);
    drawText(tableX + cRef + cDes + 8, ty, cells.qty, 8, regularFont, ink);
    drawText(tableX + cRef + cDes + cQty + 8, ty, cells.pu, 8, regularFont, ink);
    drawText(tableX + cRef + cDes + cQty + cPU + 8, ty, cells.tot, 8, regularFont, ink);

    y -= rowH;
  };

  const rows = [...itemsNorm].map((it) => ({
    ref: it.ref || "",
    des: it.label,
    qty: String(it.qty),
    pu: fmtMoney(it.unit),
    tot: fmtMoney(it.unit * it.qty),
  }));

  // shipping as row
  rows.push({
    ref: "",
    des: "Livraison",
    qty: "1",
    pu: fmtMoney(shipping),
    tot: fmtMoney(shipping),
  });

  // draw rows
  for (let i = 0; i < rows.length; i++) drawRow(rows[i], i);

  // bottom border line
  page.drawLine({ start: { x: tableX, y }, end: { x: tableX + tableW, y }, thickness: 1, color: border });

  // table outer border
  page.drawRectangle({
    x: tableX,
    y,
    width: tableW,
    height: headerH + rows.length * rowH,
    borderColor: border,
    borderWidth: 1,
  });

  // -------------------------
  // Totals block (right)
  // -------------------------
  y -= 18;

  const totalsW = 210;
  const totalsX = W - M - totalsW;
  const lineGap = 14;

  const labelSize = 8.5;
  const valueSize = 9;

  const t1 = "Total HT";
  const t2 = `TVA ${Math.round(VAT_RATE * 100)}%`;
  const t3 = "Total TTC";

  const drawTotalLine = (label: string, value: string, bold = false, yLine = 0) => {
    drawText(totalsX, yLine, label, labelSize, bold ? boldFont : regularFont, muted);
    const valW = widthOf(bold ? boldFont : boldFont, value, valueSize);
    drawText(totalsX + totalsW - valW, yLine, value, valueSize, bold ? boldFont : boldFont, ink);
  };

  let ty = y - 4;
  drawTotalLine(t1, fmtMoney(totalHT), false, ty);
  ty -= lineGap;
  drawTotalLine(t2, fmtMoney(tva), false, ty);
  ty -= lineGap;
  drawTotalLine(t3, fmtMoney(totalTTC), true, ty);

  // Paid label
  const paidLabel = opts?.paidLabel ?? "FACTURE ACQUITTEE";
  if (isPaid) {
    const paidY = ty - 26;
    const paidW = widthOf(boldFont, paidLabel, 10);
    drawText(totalsX + totalsW - paidW, paidY, paidLabel, 10, boldFont, rgb(0.10, 0.60, 0.30));
    y = paidY - 18;
  } else {
    y = ty - 22;
  }

  // -------------------------
  // Payment conditions (bottom-left)
  // -------------------------
  const condX = M;
  let cy2 = y;

  drawText(condX, cy2, "Conditions de paiement :", 8.5, boldFont, ink);
  cy2 -= 12;

  const lines = [
    `Mode de paiement : ${safe(order?.paymentMethod) || "Carte bancaire"}`,
    `Paiement reçu le : ${fmtDate(issueDate)}`,
    `Escompte pour paiement anticipé : néant`,
    `Pénalité de retard : 3 fois le taux légal`,
    `Indemnité forfaitaire de 40 € pour frais de recouvrement (art. L441-5 du code de commerce) en cas de retard.`,
  ];

  for (const line of lines) {
    drawText(condX, cy2, line, 7.4, regularFont, muted);
    cy2 -= 10;
  }

  // -------------------------
  // Footer bar + mention
  // -------------------------
  const footerBarH = 8;
  page.drawRectangle({ x: M, y: 36, width: W - 2 * M, height: footerBarH, color: blue2 });

  const foot1 = "Réserve de propriété";
  const foot2 =
    "Lazurco conserve l'entière propriété des biens jusqu'au paiement complet de la commande (loi 80335 du 12 mai 1980).";

  const footY = 26;
  const foot1W = widthOf(boldFont, foot1, 7.5);
  drawText((W - foot1W) / 2, footY, foot1, 7.5, boldFont, muted);

  const foot2W = widthOf(regularFont, foot2, 6.8);
  drawText((W - foot2W) / 2, footY - 10, foot2, 6.8, regularFont, muted);

  // Save
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
