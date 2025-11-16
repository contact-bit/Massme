import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generateInvoicePDF(order: any, orderId: string) {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const fontRegular = path.join(process.cwd(), "src", "lib", "fonts", "Poppins-Regular.ttf");
      const fontBold = path.join(process.cwd(), "src", "lib", "fonts", "Poppins-Bold.ttf");

      // --- PDF INIT ---
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      const chunks: Buffer[] = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // ============================
      // 🧾 HEADER
      // ============================
      if (fs.existsSync(fontBold)) doc.font(fontBold);
      doc.fontSize(24).text("📄 Facture Massme").moveDown();

      if (fs.existsSync(fontRegular)) doc.font(fontRegular);
      doc.fontSize(12)
        .text(`Numéro de commande : ${orderId}`)
        .text(`Date : ${new Date().toLocaleDateString()}`)
        .moveDown(2);

      // ============================
      // 👤 CLIENT
      // ============================
      const a = order.shippingAddress;

      if (fs.existsSync(fontBold)) doc.font(fontBold);
      doc.fontSize(16).text("Informations client").moveDown(1);

      if (fs.existsSync(fontRegular)) doc.font(fontRegular);
      doc.fontSize(12);

      doc.text(`Nom : ${a.name}`);
      doc.text(`Email : ${a.email}`);
      doc.text(`Adresse : ${a.address}`);
      doc.text(`${a.postalCode} ${a.city}`);
      doc.text(`Téléphone : ${a.phone}`);
      doc.moveDown(2);

      // ============================
      // 📦 PRODUITS — FIXÉ
      // ============================
      if (fs.existsSync(fontBold)) doc.font(fontBold);
      doc.fontSize(16).text("Détail de la commande").moveDown(1);

      if (fs.existsSync(fontRegular)) doc.font(fontRegular);
      doc.fontSize(12);

      let itemsTotal = 0;

      order.items.forEach((item: any) => {
        const name = item.name || "Produit";
        const price = Number(item.price || 0); // 🔥 Prix normalisé
        const qty = Number(item.quantity || 1);

        itemsTotal += price * qty;

        doc.text(`• ${name} — ${price.toFixed(2)} € × ${qty}`);
      });

      // ============================
      // 🚚 LIVRAISON — FIXÉ
      // ============================
      const shippingPrice = Number(order.shippingMethod?.price || 0);

      doc.moveDown(1);
      doc.text(`Livraison : ${shippingPrice.toFixed(2)} €`);

      // ============================
      // 💰 TOTAL — FIXÉ
      // ============================
      const total = itemsTotal + shippingPrice;

      if (fs.existsSync(fontBold)) doc.font(fontBold);
      doc.moveDown(2);
      doc.fontSize(16).text(`Total : ${total.toFixed(2)} €`, { align: "right" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
