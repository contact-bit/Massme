import PDFDocument from "pdfkit";
import fs from "fs";
import { resolve } from "path";

export async function generateInvoicePDF(order: any, orderId: string) {
  return new Promise<Buffer>((resolvePdf, reject) => {
    try {
      // 🔥 Chemin ABSOLU basé sur import.meta.url → fonctionne en dev ET en prod
      const fontRegular = fs.readFileSync(
        new URL("./fonts/Poppins-Regular.ttf", import.meta.url)
      );
      const fontBold = fs.readFileSync(
        new URL("./fonts/Poppins-Bold.ttf", import.meta.url)
      );

      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const chunks: Uint8Array[] = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolvePdf(Buffer.concat(chunks)));
      doc.on("error", reject);

      // HEADER
      doc.registerFont("PoppinsRegular", fontRegular);
      doc.registerFont("PoppinsBold", fontBold);

      doc.font("PoppinsBold").fontSize(24).text("📄 Facture Massme").moveDown();
      doc.font("PoppinsRegular").fontSize(12)
        .text(`Numéro de commande : ${orderId}`)
        .text(`Date : ${new Date().toLocaleDateString()}`)
        .moveDown(2);

      // CLIENT
      const a = order.shippingAddress;
      doc.font("PoppinsBold").fontSize(16).text("Informations client").moveDown();
      doc.font("PoppinsRegular").fontSize(12);

      doc.text(`Nom : ${a.name}`);
      doc.text(`Email : ${a.email}`);
      doc.text(`Adresse : ${a.address}`);
      doc.text(`${a.postalCode} ${a.city}`);
      doc.text(`Téléphone : ${a.phone}`);
      doc.moveDown(2);

      // PRODUITS
      doc.font("PoppinsBold").fontSize(16).text("Détail de la commande").moveDown();
      doc.font("PoppinsRegular").fontSize(12);

      let itemsTotal = 0;

      order.items.forEach((item: any) => {
        const name = item.name || "Produit";
        const price = Number(item.price) || 0;
        const qty = Number(item.quantity) || 1;

        itemsTotal += price * qty;

        doc.text(`• ${name} — ${price.toFixed(2)} € × ${qty}`);
      });

      const shippingPrice = Number(order.shippingMethod?.price || 0);
      doc.moveDown(1);
      doc.text(`Livraison : ${shippingPrice.toFixed(2)} €`);

      const total = itemsTotal + shippingPrice;

      doc.moveDown(2);
      doc.font("PoppinsBold").fontSize(16).text(`Total : ${total.toFixed(2)} €`, {
        align: "right",
      });

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
}
