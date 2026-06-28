import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const LOGO_PATH = path.join(
  process.cwd(),
  "public",
  "brand",
  "logo-officiel.png"
);

type Address = {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};

type Order = {
  email?: string;
  orderNumber?: string;
  items?: Array<{
    id?: string;
    sku?: string;
    productCode?: string;
    name?: any;
    quantity?: number;
    description?: string;
  }>;
  shippingAddress?: Address | null;
  billingAddress?: Address | null;
  shippingMethod?: {
    name?: string;
    delay?: string;
    type?: string;
  } | null;
  relayPoint?: any;
};

function safeString(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : value == null
    ? ""
    : String(value).trim();
}

function getName(address?: Address | null) {
  return (
    safeString(address?.name) ||
    [address?.firstName, address?.lastName]
      .map(safeString)
      .filter(Boolean)
      .join(" ")
  );
}

function getItemName(item: Order["items"][number]) {
  if (typeof item?.name === "string") return item.name;
  return item?.name?.fr || item?.name?.en || "Produit";
}

function getItemReference(item: Order["items"][number]) {
  return safeString(item?.sku || item?.productCode || item?.id);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getQuantity(item: Order["items"][number]) {
  return Math.max(1, Number(item?.quantity || 1));
}

function wrapText(
  text: string,
  font: { widthOfTextAtSize: (value: string, size: number) => number },
  size: number,
  maxWidth: number
) {
  const value = safeString(text);
  if (!value) return [];

  const lines: string[] = [];
  let current = "";

  for (const word of value.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = "";

    let fragment = "";
    for (const character of word) {
      const next = fragment + character;
      if (fragment && font.widthOfTextAtSize(next, size) > maxWidth) {
        lines.push(fragment);
        fragment = character;
      } else {
        fragment = next;
      }
    }
    current = fragment;
  }

  if (current) lines.push(current);
  return lines;
}

async function loadLogo(pdfDoc: PDFDocument) {
  try {
    const bytes = await readFile(LOGO_PATH);
    return await pdfDoc.embedPng(bytes);
  } catch {
    return null;
  }
}

function drawTextLines({
  page,
  lines,
  x,
  y,
  size,
  font,
  color,
  lineHeight = size + 4,
}: {
  page: any;
  lines: string[];
  x: number;
  y: number;
  size: number;
  font: any;
  color: any;
  lineHeight?: number;
}) {
  let currentY = y;

  for (const line of lines) {
    if (!line) {
      currentY -= lineHeight;
      continue;
    }

    page.drawText(line, {
      x,
      y: currentY,
      size,
      font,
      color,
    });

    currentY -= lineHeight;
  }

  return currentY;
}

export async function generateDeliveryNotePDF(
  order: Order,
  orderId: string,
  opts: {
    issueDate?: Date;
  } = {}
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width: W, height: H } = page.getSize();

  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Palette officielle VitrectoMed
  const BLUE = rgb(21 / 255, 166 / 255, 187 / 255); // #15A6BB
  const INK = rgb(10 / 255, 36 / 255, 107 / 255); // #0A246B
  const MUTED = rgb(54 / 255, 81 / 255, 127 / 255); // teinte lisible dérivée
  const BORDER = rgb(214 / 255, 236 / 255, 244 / 255); // #D6ECF4
  const LIGHT = rgb(244 / 255, 247 / 255, 251 / 255); // #F4F7FB

  const M = 42;
  const orderNumber = order.orderNumber || orderId;
  const issueDate = opts.issueDate || new Date();
  const shipping = order.shippingAddress || {};
  const relay = order.relayPoint || null;
  const items = Array.isArray(order.items) ? order.items : [];

  const logo = await loadLogo(pdfDoc);
  if (logo) {
    const maxW = 110;
    const scale = maxW / logo.width;
    page.drawImage(logo, {
      x: M,
      y: H - M - logo.height * scale,
      width: logo.width * scale,
      height: logo.height * scale,
    });
  }

  page.drawText("BON DE LIVRAISON", {
    x: 332,
    y: H - M - 8,
    size: 20,
    font: bold,
    color: INK,
  });

  page.drawText(`Commande : ${orderNumber}`, {
    x: 332,
    y: H - M - 34,
    size: 10,
    font: bold,
    color: BLUE,
  });

  page.drawText(`Date : ${formatDate(issueDate)}`, {
    x: 332,
    y: H - M - 50,
    size: 9,
    font: regular,
    color: MUTED,
  });

  drawTextLines({
    page,
    x: M,
    y: H - M - 85,
    size: 8.5,
    font: regular,
    color: MUTED,
    lines: [
      "LAZURCO",
      "189 avenue de Fabron",
      "06200 Nice, FRANCE",
      "contact@vitrectomed.com",
      "www.vitrectomed.com",
    ],
  });

  const addressSourceLines = relay
    ? [
        "Point relais",
        safeString(relay.name),
        safeString(relay.address),
        [relay.postalCode, relay.city].map(safeString).filter(Boolean).join(" "),
        safeString(relay.country),
      ]
    : [
        getName(shipping),
        safeString(shipping.address),
        [shipping.postalCode, shipping.city]
          .map(safeString)
          .filter(Boolean)
          .join(" "),
        safeString(shipping.country),
        safeString(shipping.phone),
      ];

  const separatorX = 312;
  const infoX = 330;
  const addressTextWidth = separatorX - (M + 12) - 14;
  const addressLines = addressSourceLines.flatMap((line) =>
    wrapText(line, regular, 9, addressTextWidth)
  );
  const info = [
    ["Transport", safeString(order.shippingMethod?.name) || "—"],
    ["Délai", safeString(order.shippingMethod?.delay) || "—"],
  ];
  const infoValueWidth = W - M - (infoX + 72);
  const wrappedInfo = info.map(([label, value]) => ({
    label,
    lines: wrapText(value, regular, 8, infoValueWidth),
  }));
  const addressContentHeight = Math.max(1, addressLines.length) * 13;
  const infoContentHeight = wrappedInfo.reduce(
    (height, row) => height + Math.max(14, row.lines.length * 11 + 4),
    0
  );
  const cardTop = H - 210;
  const cardHeaderH = 24;
  const cardContentHeight = Math.max(addressContentHeight, infoContentHeight);
  const cardH = Math.max(116, cardHeaderH + 20 + cardContentHeight + 12);
  const cardY = cardTop - cardH;
  page.drawRectangle({
    x: M,
    y: cardY,
    width: W - M * 2,
    height: cardH,
    borderColor: BORDER,
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });

  page.drawRectangle({
    x: M,
    y: cardTop - cardHeaderH,
    width: W - M * 2,
    height: cardHeaderH,
    color: LIGHT,
  });

  page.drawText("Adresse de livraison", {
    x: M + 12,
    y: cardTop - 16,
    size: 9,
    font: bold,
    color: INK,
  });

  drawTextLines({
    page,
    x: M + 12,
    y: cardTop - cardHeaderH - 20,
    size: 9,
    font: regular,
    color: INK,
    lineHeight: 13,
    lines: addressLines,
  });

  page.drawLine({
    start: { x: separatorX, y: cardY + 12 },
    end: { x: separatorX, y: cardTop - cardHeaderH - 12 },
    thickness: 1,
    color: BORDER,
  });

  let infoY = cardTop - cardHeaderH - 20;
  for (const row of wrappedInfo) {
    page.drawText(`${row.label} :`, {
      x: infoX,
      y: infoY,
      size: 8,
      font: bold,
      color: MUTED,
    });
    let valueY = infoY;
    for (const line of row.lines) {
      page.drawText(line, {
        x: infoX + 72,
        y: valueY,
        size: 8,
        font: regular,
        color: INK,
      });
      valueY -= 11;
    }
    infoY -= Math.max(14, row.lines.length * 11 + 4);
  }

  let y = cardY - 38;
  page.drawRectangle({
    x: M,
    y,
    width: W - M * 2,
    height: 24,
    color: BLUE,
  });

  page.drawText("Référence", {
    x: M + 10,
    y: y + 8,
    size: 8,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Désignation", {
    x: M + 120,
    y: y + 8,
    size: 8,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Qté", {
    x: W - M - 36,
    y: y + 8,
    size: 8,
    font: bold,
    color: rgb(1, 1, 1),
  });

  y -= 26;

  for (const item of items) {
    const quantity = getQuantity(item);
    const referenceLines = wrapText(
      getItemReference(item) || "—",
      regular,
      8,
      98
    );
    const designationLines = wrapText(
      getItemName(item),
      bold,
      8.5,
      W - M - 52 - (M + 120) - 12
    );
    const rowLineCount = Math.max(
      referenceLines.length,
      designationLines.length,
      1
    );
    const rowHeight = Math.max(24, rowLineCount * 11 + 6);
    const rowTop = y;

    let lineY = rowTop;
    for (const line of referenceLines) {
      page.drawText(line, {
        x: M + 10,
        y: lineY,
        size: 8,
        font: regular,
        color: MUTED,
      });
      lineY -= 11;
    }

    lineY = rowTop;
    for (const line of designationLines) {
      page.drawText(line, {
        x: M + 120,
        y: lineY,
        size: 8.5,
        font: bold,
        color: INK,
      });
      lineY -= 11;
    }

    page.drawText(String(quantity), {
      x: W - M - 30,
      y: rowTop,
      size: 8.5,
      font: bold,
      color: INK,
    });

    y -= rowHeight;
  }

  if (items.length === 0) {
    page.drawText("Aucun article", {
      x: M + 10,
      y,
      size: 8.5,
      font: regular,
      color: MUTED,
    });
    y -= 20;
  }

  page.drawText("Document à joindre à l’expédition. Ne pas utiliser comme facture.", {
    x: M,
    y: 36,
    size: 8,
    font: regular,
    color: MUTED,
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
