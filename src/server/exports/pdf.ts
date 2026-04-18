// src/server/exports/pdf.ts

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function euro(n: number) {
  return Number(n || 0).toFixed(2);
}

export async function buildPDF(data: any[]) {
  const pdf = await PDFDocument.create();

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 842;
  const pageHeight = 595;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = 560;

  const margin = 40;

  /* ================= HEADER ================= */

  const drawHeader = () => {
    page.drawText("Export des commandes", {
      x: margin,
      y,
      size: 14,
      font: fontBold,
    });

    y -= 20;

    const headers = ["Date", "Client", "TTC (€)", "Paiement"];

    const colX = [margin, 180, 520, 650];

    headers.forEach((h, i) => {
      page.drawText(h, {
        x: colX[i],
        y,
        size: 10,
        font: fontBold,
      });
    });

    y -= 10;

    // ligne
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });

    y -= 10;
  };

  drawHeader();

  /* ================= DATA ================= */

  const colX = [margin, 180, 520, 650];

  for (const d of data) {
    if (y < 50) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = 560;
      drawHeader();
    }

    page.drawText(d.date || "-", {
      x: colX[0],
      y,
      size: 9,
      font,
    });

    page.drawText((d.customer || "-").slice(0, 25), {
      x: colX[1],
      y,
      size: 9,
      font,
    });

    page.drawText(euro(d.totalTTC) + " €", {
      x: colX[2],
      y,
      size: 9,
      font,
    });

    page.drawText((d.payment || "-").slice(0, 12), {
      x: colX[3],
      y,
      size: 9,
      font,
    });

    y -= 14;
  }

  /* ================= TOTAL ================= */

  const totalTTC = data.reduce(
    (sum, d) => sum + Number(d.totalTTC || 0),
    0
  );

  y -= 20;

  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
  });

  y -= 15;

  page.drawText(`TOTAL TTC : ${euro(totalTTC)} €`, {
    x: margin,
    y,
    size: 12,
    font: fontBold,
  });

  /* ================= SAVE ================= */

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}