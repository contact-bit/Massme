import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2456d5ba-af23-4219-7115-f54286a7c600/public";

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

type DeliveryNote = {
  packageCount?: number | string | null;
  weight?: string | null;
  instructions?: string | null;
};

type Order = {
  email?: string;
  orderNumber?: string;
  items?: Array<{
    id?: string;
    name?: any;
    quantity?: number;
    weightKg?: number | string;
    deliveryPackageCount?: number | string;
    deliveryNoteInstructions?: string;
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
  deliveryNote?: DeliveryNote | null;
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

function getItemWeight(item: Order["items"][number]) {
  return Math.max(0, Number(item?.weightKg || 0) || 0);
}

function getItemPackageCount(item: Order["items"][number]) {
  if (item?.deliveryPackageCount == null) return 1;

  return Math.max(
    0,
    Number(item.deliveryPackageCount) || 0
  );
}

function formatWeightKg(value: number) {
  if (!value) return "";

  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(value)} kg`;
}

async function loadLogo(pdfDoc: PDFDocument) {
  try {
    const res = await fetch(LOGO_URL);
    if (!res.ok) return null;
    const bytes = await res.arrayBuffer();
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

  const BLUE = rgb(0.14, 0.35, 0.86);
  const INK = rgb(0.06, 0.07, 0.1);
  const MUTED = rgb(0.4, 0.45, 0.55);
  const BORDER = rgb(0.86, 0.89, 0.93);
  const LIGHT = rgb(0.94, 0.97, 1);

  const M = 42;
  const orderNumber = order.orderNumber || orderId;
  const issueDate = opts.issueDate || new Date();
  const delivery = order.deliveryNote || {};
  const shipping = order.shippingAddress || {};
  const relay = order.relayPoint || null;
  const items = Array.isArray(order.items) ? order.items : [];
  const totalQuantity = items.reduce(
    (sum, item) =>
      sum + getItemPackageCount(item) * getQuantity(item),
    0
  );
  const totalWeightKg = items.reduce(
    (sum, item) => sum + getItemWeight(item) * getQuantity(item),
    0
  );
  const itemInstructions = items
    .map((item) => safeString(item?.deliveryNoteInstructions))
    .filter(Boolean);
  const deliveryInstructions =
    itemInstructions.length > 0
      ? [...new Set(itemInstructions)].join("\n")
      : safeString(delivery.instructions);
  const deliveryPackageCount =
    totalQuantity > 0
      ? String(totalQuantity)
      : safeString(delivery.packageCount);
  const deliveryWeight =
    totalWeightKg > 0
      ? formatWeightKg(totalWeightKg)
      : safeString(delivery.weight);

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
      "contact@hdconnects.com",
      "www.vitrectomed.com",
    ],
  });

  const cardY = H - 250;
  page.drawRectangle({
    x: M,
    y: cardY,
    width: W - M * 2,
    height: 116,
    borderColor: BORDER,
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });

  page.drawRectangle({
    x: M,
    y: cardY + 92,
    width: W - M * 2,
    height: 24,
    color: LIGHT,
  });

  page.drawText("Adresse de livraison", {
    x: M + 12,
    y: cardY + 100,
    size: 9,
    font: bold,
    color: INK,
  });

  const addressLines = relay
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

  drawTextLines({
    page,
    x: M + 12,
    y: cardY + 76,
    size: 9,
    font: regular,
    color: INK,
    lineHeight: 13,
    lines: addressLines.filter(Boolean),
  });

  const infoX = 330;
  const info = [
    ["Transport", safeString(order.shippingMethod?.name) || "—"],
    ["Délai", safeString(order.shippingMethod?.delay) || "—"],
    ["Colis", deliveryPackageCount || "—"],
    ["Poids", deliveryWeight || "—"],
  ];

  let infoY = cardY + 76;
  for (const [label, value] of info) {
    page.drawText(`${label} :`, {
      x: infoX,
      y: infoY,
      size: 8,
      font: bold,
      color: MUTED,
    });
    page.drawText(value, {
      x: infoX + 72,
      y: infoY,
      size: 8,
      font: regular,
      color: INK,
    });
    infoY -= 14;
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
  page.drawText("Poids", {
    x: W - M - 92,
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
    const itemWeight = getItemWeight(item);

    page.drawText(safeString(item?.id).slice(0, 24) || "—", {
      x: M + 10,
      y,
      size: 8,
      font: regular,
      color: MUTED,
    });

    page.drawText(getItemName(item).slice(0, 46), {
      x: M + 120,
      y,
      size: 8.5,
      font: bold,
      color: INK,
    });

    page.drawText(itemWeight ? formatWeightKg(itemWeight) : "—", {
      x: W - M - 92,
      y,
      size: 8.5,
      font: regular,
      color: INK,
    });

    page.drawText(String(quantity), {
      x: W - M - 30,
      y,
      size: 8.5,
      font: bold,
      color: INK,
    });

    y -= 20;
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

  const instructions = deliveryInstructions;
  if (instructions) {
    y -= 18;
    page.drawRectangle({
      x: M,
      y: y - 58,
      width: W - M * 2,
      height: 76,
      borderColor: BORDER,
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });
    page.drawText("Consignes logistiques", {
      x: M + 12,
      y: y,
      size: 9,
      font: bold,
      color: INK,
    });
    drawTextLines({
      page,
      x: M + 12,
      y: y - 18,
      size: 8,
      font: regular,
      color: MUTED,
      lineHeight: 12,
      lines: instructions.match(/.{1,86}/g) || [],
    });
  }

  page.drawText("Document à joindre au colis. Ne pas utiliser comme facture.", {
    x: M,
    y: 36,
    size: 8,
    font: regular,
    color: MUTED,
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
