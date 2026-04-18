// src/server/exports/csv.ts

function formatNumber(n: any) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0,00";

  return num.toFixed(2).replace(".", ",");
}

export function buildCSV(data: any[]) {
  const headers = [
    "Date",
    "ID",
    "Client",
    "Email",
    "Statut",
    "Paiement",
    "Quantité",
    "Produits HT (€)",
    "Livraison HT (€)",
    "TVA (€)",
    "Total HT (€)",
    "Total TTC (€)",
    "Commission (€)",
    "Fabrication (€)",
    "Gain (€)",
  ];

  const sep = ";";

  const esc = (v: any) => {
    const s = String(v ?? "");
    if (/[;"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const rows = data.map((d) => [
    d.date,
    d.id,
    d.customer,
    d.email,
    d.status,
    d.payment,
    d.qty,

    formatNumber(d.productsHT),
    formatNumber(d.shippingHT),
    formatNumber(d.vat),
    formatNumber(d.totalHT),
    formatNumber(d.totalTTC),
    formatNumber(d.commission),
    formatNumber(d.fabrication),
    formatNumber(d.gain),
  ]);

  return (
    "\uFEFF" +
    [
      headers.map(esc).join(sep),
      ...rows.map((r) => r.map(esc).join(sep)),
    ].join("\n")
  );
}