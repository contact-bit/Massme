import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generateInvoicePDF(order: any, orderId: string) {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Uint8Array[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // --- Load custom fonts ---
      const fontRegular = path.join(
        process.cwd(),
        "src",
        "lib",
        "fonts",
        "Poppins-Regular.ttf"
      );
      const fontBold = path.join(
        process.cwd(),
        "src",
        "lib",
        "fonts",
        "Poppins-Bold.ttf"
      );

      if (fs.existsSync(fontRegular)) doc.font(fontRegular);
      else doc.font("Times-Roman");

      // ============================================================
      // 🧾 HEADER
      // ============================================================
      doc.fontSize(24).text("📄 Facture Massme");
      doc.moveDown();

      doc.fontSize(12);
      doc.text(`Numéro de commande : ${orderId}`);
      doc.text(`Date : ${new Date().toLocaleDateString()}`);
      doc.moveDown(2);

      // ============================================================
      // 👤 CLIENT
      // ============================================================
      if (fs.existsSync(fontBold)) doc.font(fontBold);
      doc.fontSize(16).text("Informations client");
      doc.moveDown(1);

      doc.font(fontRegular).fontSize(12);
      doc.text(`Nom : ${order.shippingAddress.name}`);
      doc.text(`Email : ${order.shippingAddress.email}`);
      doc.text(`Adresse : ${order.shippingAddress.address}`);
      doc.text(
        `${order.shippingAddress.postalCode} ${order.shippingAddress.city}`
      );
      doc.moveDown(2);

      // ============================================================
      // 📦 PRODUITS
      // ============================================================
      if (fs.existsSync(fontBold)) doc.font(fontBold);
      doc.fontSize(16).text("Détail de la commande");
      doc.moveDown(1);

      doc.font(fontRegular).fontSize(12);

      order.items.forEach((item: any) => {
        doc.text(
          `• ${item.name?.fr || "Produit"} — ${item.price.eur} € x ${
            item.quantity || 1
          }`
        );
      });

      // ============================================================
      // 💰 TOTAL
      // ============================================================
      const total = order.items.reduce(
        (sum: number, item: any) =>
          sum + item.price.eur * (item.quantity || 1),
        0
      );

      doc.moveDown(2);
      if (fs.existsSync(fontBold)) doc.font(fontBold);
      doc.fontSize(16).text(`Total : ${total} €`, { align: "right" });

      // Finish PDF
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
