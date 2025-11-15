import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generateInvoicePDF(order: any, orderId: string) {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Uint8Array[] = [];

      // --- Capture PDF output ---
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // --- Load custom font ---
      const fontPath = path.join(
        process.cwd(),
        "src",
        "lib",
        "fonts",
        "Poppins-Regular.ttf"
      );

      if (fs.existsSync(fontPath)) {
        doc.font(fontPath);
      } else {
        console.error("❌ Police introuvable :", fontPath);
        doc.font("Times-Roman"); // fallback
      }

      // ============================================================
      // 🧾 HEADER
      // ============================================================
      doc.fontSize(24).text("📄 Facture Massme", { align: "left" });
      doc.moveDown();

      doc.fontSize(12);
      doc.text(`Numéro de commande : ${orderId}`);
      doc.text(`Date : ${new Date().toLocaleDateString()}`);
      doc.moveDown(2);

      // ============================================================
      // 👤 CLIENT
      // ============================================================
      doc.fontSize(16).text("Informations client", { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(12);
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
      doc.fontSize(16).text("Détail de la commande", { underline: true });
      doc.moveDown(1);

      order.items.forEach((item: any) => {
        doc
          .fontSize(12)
          .text(
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
      doc.fontSize(16).text(`Total : ${total} €`, { align: "right" });

      // ============================================================
      // ✔️ FIN
      // ============================================================
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
