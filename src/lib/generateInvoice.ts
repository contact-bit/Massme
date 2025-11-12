import PDFDocument from "pdfkit";

export function generateInvoicePDF(order: any, orderId: string) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ---------- HEADER ----------
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("Massme - Facture", { align: "left" })
      .moveDown();

    doc.font("Helvetica").fontSize(12);
    doc.text(`Numéro de commande : ${orderId}`);
    doc.text(`Date : ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // ---------- CLIENT ----------
    doc.font("Helvetica-Bold").fontSize(14).text("Informations client");
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(12);
    doc.text(`Nom : ${order.shippingAddress.name}`);
    doc.text(`Email : ${order.shippingAddress.email}`);
    doc.text(`Adresse : ${order.shippingAddress.address}`);
    doc.text(
      `${order.shippingAddress.postalCode} ${order.shippingAddress.city}`
    );
    doc.moveDown();

    // ---------- PRODUITS ----------
    doc.font("Helvetica-Bold").fontSize(14).text("Détail de la commande");
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(12);

    order.items.forEach((item: any) => {
      doc.text(
        `${item.name?.fr || "Produit"} - ${item.price.eur} € x ${
          item.quantity || 1
        }`
      );
    });

    // ---------- TOTAL ----------
    const total = order.items.reduce(
      (sum: number, item: any) =>
        sum + item.price.eur * (item.quantity || 1),
      0
    );

    doc.moveDown();
    doc.font("Helvetica-Bold").fontSize(14).text(`Total : ${total} €`);

    doc.end();
  });
}
