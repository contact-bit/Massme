// src/lib/generateInvoice.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type InvoiceCompany = {
  name: string; // "LazurCo"
  line1?: string;
  line2?: string;
  zipCity?: string;
  country?: string;
  capital?: string;
  siret?: string;
  ape?: string;
  vat?: string;
  contactLabel?: string;
  phone?: string;
  email?: string;
  website?: string;
};

type InvoiceClient = {
  name?: string;
  address1?: string;
  address2?: string;
  zipCity?: string;
  country?: string;
  email?: string;
  phone?: string;
  vat?: string; // TVA intracom
};

type InvoiceItem = {
  ref?: string;
  name: string;
  description?: string;
  qty: number;
  unitHT: number; // prix unitaire HT
};

export type InvoiceData = {
  invoiceNumber: string; // ex: "F250901"
  dateISO?: string; // ex: "2025-09-02" (sinon aujourd’hui)
  orderId?: string; // ex: "12937"
  paidAtISO?: string; // ex: "2025-09-02"
  paymentMethod?: string; // ex: "Carte bancaire"
  vatRate?: number; // ex: 0.2
  shippingHT?: number; // ex: 11.75
  items: InvoiceItem[];
  company: InvoiceCompany;
  client: InvoiceClient;
  paidLabel?: string; // ex: "FACTURE ACQUITTEE"
};

function fmtDateFR(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function money(n: number) {
  const v = Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
  return v.toFixed(2);
}

function splitLinesByWidth(text: string, font: any, fontSize: number, maxWidth: number) {
  const words = (text || "").replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let cur = "";

  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    const width = font.widthOfTextAtSize(test, fontSize);
    if (width <= maxWidth) cur = test;
    else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

export async function generateInvoicePDF(data: InvoiceData) {
  const pdfDoc = await PDFDocument.create();

  // A4 portrait
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Palette proche screenshot
  const ink = rgb(0.07, 0.07, 0.07);
  const muted = rgb(0.35, 0.35, 0.35);
  const line = rgb(0.75, 0.75, 0.75);
  const bar = rgb(0.33, 0.29, 0.23); // bande brune
  const bgSoft = rgb(0.96, 0.96, 0.96);
  const danger = rgb(0.78, 0.12, 0.12);

  const M = 42;

  const drawText = (t: string, x: number, y: number, size: number, bold = false, color = ink) => {
    page.drawText(t ?? "", {
      x,
      y,
      size,
      font: bold ? fontBold : fontRegular,
      color,
    });
  };

  const drawBox = (
    x: number,
    y: number,
    w: number,
    h: number,
    opts?: { fill?: any; stroke?: any; strokeWidth?: number; r?: number }
  ) => {
    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      color: opts?.fill,
      borderColor: opts?.stroke ?? line,
      borderWidth: opts?.strokeWidth ?? 1,
      borderRadius: opts?.r ?? 6,
    });
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 1,
      color: line,
    });
  };

  // ----------------------------
  // Header left : "LazurCo" + infos
  // ----------------------------
  const c = data.company;

  // "Logo" texte
  drawText(c.name || "LazurCo", M, height - M - 16, 30, false, rgb(0.98, 0.72, 0.30));
  let yL = height - M - 44;

  const leftLines = [
    c.line1,
    c.line2,
    c.zipCity,
    c.country,
    "",
    c.capital,
    c.siret,
    c.ape,
    c.vat,
    "",
    c.contactLabel,
    c.phone,
    c.email,
  ].filter((x) => x !== undefined);

  leftLines.forEach((ln) => {
    if (ln === "") {
      yL -= 8;
      return;
    }
    drawText(String(ln), M, yL, 8.5, false, ink);
    yL -= 12;
  });

  // (QR code supprimé) -> on laisse juste un espace vide comme sur ton modèle à gauche
  const blankX = M;
  const blankY = height - 330;
  const blankW = 110;
  const blankH = 110;
  drawBox(blankX, blankY, blankW, blankH, { stroke: line, r: 0 });

  // ----------------------------
  // Header right : "FACTURE" + Client
  // ----------------------------
  const titleBoxW = 300;
  const titleBoxH = 46;
  const titleX = width - M - titleBoxW;
  const titleY = height - M - titleBoxH;

  drawBox(titleX, titleY, titleBoxW, titleBoxH, { stroke: muted, r: 8 });
  drawText("FACTURE", titleX + 105, titleY + 16, 12, true, ink);

  const clientBoxW = 320;
  const clientBoxH = 110;
  const clientX = width - M - clientBoxW;
  const clientY = titleY - 22 - clientBoxH;

  drawBox(clientX, clientY, clientBoxW, clientBoxH, { stroke: line, r: 0 });
  page.drawRectangle({
    x: clientX,
    y: clientY + clientBoxH - 20,
    width: clientBoxW,
    height: 20,
    color: bar,
  });
  drawText("Client", clientX + clientBoxW / 2 - 18, clientY + clientBoxH - 14, 9, true, rgb(1, 1, 1));

  const cl = data.client || {};
  const clientLines = [
    (cl.name || "").toUpperCase(),
    (cl.address1 || "").toUpperCase(),
    (cl.address2 || "").toUpperCase(),
    (cl.zipCity || "").toUpperCase(),
    (cl.country || "").toUpperCase(),
  ].filter((x) => x && x.trim().length);

  let yC = clientY + clientBoxH - 34;
  clientLines.forEach((ln) => {
    drawText(ln, clientX + 12, yC, 9, true, ink);
    yC -= 14;
  });

  // ----------------------------
  // Bloc "Date / N° facture / commande / TVA"
  // ----------------------------
  const infoY = clientY - 34;
  const infoX = M;
  const infoW = width - M * 2;

  drawLine(infoX, infoY, infoX + infoW, infoY);

  const dateLabelY = infoY - 20;
  drawText("Date :", infoX, dateLabelY, 9, true, ink);
  drawText(fmtDateFR(data.dateISO), infoX + 110, dateLabelY, 9, false, ink);

  drawText("N° Facture :", infoX + 290, dateLabelY, 9, true, ink);
  drawText(data.invoiceNumber, infoX + 390, dateLabelY, 9, true, ink);

  // zone grisée
  const greyBoxY = dateLabelY - 76;
  const greyBoxH = 72;
  drawBox(infoX, greyBoxY, infoW, greyBoxH, { fill: rgb(0.97, 0.97, 0.97), stroke: line, r: 0 });

  const orderId = data.orderId || "";
  const website = c.website || "www.massme.fr";

  drawText("Votre commande", infoX + 10, greyBoxY + greyBoxH - 22, 8, false, muted);
  drawText(website, infoX + 10, greyBoxY + greyBoxH - 34, 8, true, ink);
  drawText(orderId ? String(orderId) : "-", infoX + 160, greyBoxY + greyBoxH - 34, 8, false, ink);

  drawText("Votre numero de TVA", infoX + 10, greyBoxY + greyBoxH - 54, 8, false, muted);
  drawText("intracommunautaire :", infoX + 10, greyBoxY + greyBoxH - 66, 8, false, muted);
  drawText(cl.vat ? String(cl.vat) : "-", infoX + 160, greyBoxY + greyBoxH - 66, 8, false, ink);

  // ----------------------------
  // Table items
  // ----------------------------
  const tableX = M;
  const tableYTop = greyBoxY - 20;
  const tableW = width - M * 2;

  const col = {
    ref: 70,
    des: tableW - (70 + 60 + 90 + 90),
    qty: 60,
    unit: 90,
    total: 90,
  };

  const headH = 18;
  const rowH = 18;

  page.drawRectangle({ x: tableX, y: tableYTop - headH, width: tableW, height: headH, color: bar });
  drawText("Reference", tableX + 6, tableYTop - 12, 8, true, rgb(1, 1, 1));
  drawText("Designation", tableX + col.ref + 6, tableYTop - 12, 8, true, rgb(1, 1, 1));
  drawText("Quantite", tableX + col.ref + col.des + 6, tableYTop - 12, 8, true, rgb(1, 1, 1));
  drawText("Prix unitaire HT", tableX + col.ref + col.des + col.qty + 6, tableYTop - 12, 8, true, rgb(1, 1, 1));
  drawText("Prix Total HT", tableX + col.ref + col.des + col.qty + col.unit + 6, tableYTop - 12, 8, true, rgb(1, 1, 1));

  const xRef = tableX + col.ref;
  const xDes = xRef + col.des;
  const xQty = xDes + col.qty;
  const xUnit = xQty + col.unit;

  const vatRate = typeof data.vatRate === "number" ? data.vatRate : 0.2;
  const items = Array.isArray(data.items) ? data.items : [];
  const shippingHT = Number(data.shippingHT || 0);

  const lines = [...items];
  if (shippingHT > 0) {
    lines.push({ ref: "", name: "Livraison a domicile", qty: 1, unitHT: shippingHT });
  }

  const totalHT = lines.reduce((s, it) => s + (Number(it.unitHT) || 0) * (Number(it.qty) || 0), 0);
  const tva = totalHT * vatRate;
  const totalTTC = totalHT + tva;

  let y = tableYTop - headH;
  const maxRows = Math.max(6, lines.length);

  for (let i = 0; i < maxRows; i++) {
    const isEven = i % 2 === 1;
    const rowY = y - rowH;

    if (isEven) page.drawRectangle({ x: tableX, y: rowY, width: tableW, height: rowH, color: bgSoft });

    drawLine(tableX, rowY, tableX + tableW, rowY);
    drawLine(xRef, y, xRef, rowY);
    drawLine(xDes, y, xDes, rowY);
    drawLine(xQty, y, xQty, rowY);
    drawLine(xUnit, y, xUnit, rowY);
    drawLine(tableX, y, tableX, rowY);
    drawLine(tableX + tableW, y, tableX + tableW, rowY);

    const it = lines[i];
    if (it) {
      const ref = it.ref || "";
      const qty = Number(it.qty || 0);
      const unit = Number(it.unitHT || 0);
      const rowTotal = qty * unit;

      const designation = `${it.name || ""}${it.description ? ` - ${it.description}` : ""}`.trim();

      drawText(ref, tableX + 6, rowY + 5, 8, false, ink);

      const desLines = splitLinesByWidth(designation, fontRegular, 8, col.des - 12).slice(0, 2);
      drawText(desLines[0] || "", tableX + col.ref + 6, rowY + 5, 8, false, ink);
      if (desLines[1]) drawText(desLines[1], tableX + col.ref + 6, rowY - 6, 8, false, ink);

      drawText(String(qty || 0), tableX + col.ref + col.des + 6, rowY + 5, 8, false, ink);
      drawText(`${money(unit)} €`, tableX + col.ref + col.des + col.qty + 6, rowY + 5, 8, false, ink);
      drawText(`${money(rowTotal)} €`, tableX + col.ref + col.des + col.qty + col.unit + 6, rowY + 5, 8, false, ink);
    }

    y = rowY;
  }

  drawLine(tableX, y, tableX + tableW, y);

  // Totals block (droite)
  const totalsW = 240;
  const totalsX = tableX + tableW - totalsW;
  const totalsY = y - 60;

  drawLine(totalsX, y, totalsX, totalsY + 60);

  drawText("Total HT", totalsX + 10, totalsY + 40, 9, false, muted);
  drawText(`${money(totalHT)} €`, totalsX + 140, totalsY + 40, 9, true, ink);

  drawText(`TVA ${Math.round(vatRate * 100)}%`, totalsX + 10, totalsY + 24, 9, false, muted);
  drawText(`${money(tva)} €`, totalsX + 140, totalsY + 24, 9, true, ink);

  drawText("Total TTC", totalsX + 10, totalsY + 8, 9, true, ink);
  drawText(`${money(totalTTC)} €`, totalsX + 140, totalsY + 8, 9, true, ink);

  // ----------------------------
  // Conditions + acquittée
  // ----------------------------
  const payY = totalsY - 70;
  drawText("Conditions de paiement :", M, payY + 44, 9, true, ink);

  const payLines = [
    `Mode de paiement : ${data.paymentMethod || "Carte bancaire"}`,
    `Paiement recu le : ${fmtDateFR(data.paidAtISO || data.dateISO)}`,
    `Escompte pour paiement anticipe : neant`,
    `Penalite de retard : 3 fois le taux legal`,
    `Indemnite forfaitaire de 40 € pour frais de recouvrement (art. L441-5 du code de commerce) en cas de retard de paiement.`,
  ];

  let yP = payY + 28;
  for (const l of payLines) {
    const lines2 = splitLinesByWidth(l, fontRegular, 8, 320);
    for (const ll of lines2) {
      drawText(ll, M, yP, 8, false, ink);
      yP -= 12;
    }
  }

  drawText(data.paidLabel || "FACTURE ACQUITTEE", width / 2 + 40, payY + 10, 10, true, danger);

  // ----------------------------
  // Footer
  // ----------------------------
  const footerBarY = 56;
  page.drawRectangle({ x: M, y: footerBarY, width: width - M * 2, height: 10, color: bar });

  drawText("Reserve de propriete", width / 2 - 56, footerBarY - 18, 8, true, ink);
  const footerTxt =
    "LazurCo SASU conserve l'entière propriete des biens jusqu'au paiement complet de la commande (loi 80335 du 12 mai 1980)";
  const footerLines = splitLinesByWidth(footerTxt, fontRegular, 7.6, width - M * 2);
  let yF = footerBarY - 32;
  for (const ll of footerLines.slice(0, 2)) {
    drawText(ll, M + 30, yF, 7.6, false, muted);
    yF -= 10;
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
