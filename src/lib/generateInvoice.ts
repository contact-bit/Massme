import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generateInvoicePDF(order: any, orderId: string) {
  // Création du document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;

  // Title
  page.drawText("Facture Massme", {
    x: 50,
    y,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  y -= 40;

  page.drawText(`Commande : ${orderId}`, { x: 50, y, size: 12, font: regularFont });
  y -= 20;

  page.drawText(`Date : ${new Date().toLocaleDateString()}`, {
    x: 50,
    y,
    size: 12,
    font: regularFont,
  });

  y -= 40;

  // ------------------------------
  // 🧾 Informations client
  // ------------------------------
  page.drawText("Informations client :", {
    x: 50,
    y,
    size: 16,
    font: boldFont,
  });

  y -= 25;

  const a = order.shippingAddress;

  const info = [
    `Nom : ${a.name}`,
    `Email : ${a.email}`,
    `Adresse : ${a.address}`,
    `${a.postalCode} ${a.city}`,
    a.country ? `Pays : ${a.country}` : null, // ✅ AJOUT DU PAYS
    `Téléphone : ${a.phone}`,
  ].filter(Boolean); // supprime les null

  info.forEach((line) => {
    page.drawText(line, { x: 50, y, size: 12, font: regularFont });
    y -= 18;
  });

  y -= 30;

  // ------------------------------
  // 🛒 Produits
  // ------------------------------
  page.drawText("Produits :", {
    x: 50,
    y,
    size: 16,
    font: boldFont,
  });

  y -= 25;

  let total = 0;

  order.items.forEach((item: any) => {
    const price = Number(item.price);
    const qty = Number(item.quantity);
    total += price * qty;

    const line = `• ${item.name} — ${price.toFixed(2)} € × ${qty}`;

    page.drawText(line, { x: 50, y, size: 12, font: regularFont });
    y -= 18;
  });

  y -= 25;

  // ------------------------------
  // 📦 Livraison
  // ------------------------------
  const shipping = Number(order.shippingMethod?.price || 0);
  total += shipping;

  page.drawText(`Livraison : ${shipping.toFixed(2)} €`, {
    x: 50,
    y,
    size: 12,
    font: regularFont,
  });

  y -= 40;

  // ------------------------------
  // 💰 TOTAL
  // ------------------------------
  page.drawText(`TOTAL : ${total.toFixed(2)} €`, {
    x: 50,
    y,
    size: 18,
    font: boldFont,
  });

  // Return buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}