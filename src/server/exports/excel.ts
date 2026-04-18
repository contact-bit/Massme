// src/server/exports/excel.ts

import ExcelJS from "exceljs";

export async function buildExcel(data: any[]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Massme Export";
  wb.created = new Date();

  const ws = wb.addWorksheet("Compta", {
    views: [{ state: "frozen", ySplit: 1 }], // 👈 freeze header
  });

  /* ================= COLUMNS ================= */

  ws.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "ID", key: "id", width: 28 },
    { header: "Client", key: "customer", width: 22 },
    { header: "Email", key: "email", width: 28 },
    { header: "Statut", key: "status", width: 16 },
    { header: "Paiement", key: "payment", width: 18 },

    { header: "Qté", key: "qty", width: 8 },

    { header: "Produits HT", key: "productsHT", width: 16 },
    { header: "Livraison HT", key: "shippingHT", width: 16 },
    { header: "TVA", key: "vat", width: 14 },
    { header: "Total HT", key: "totalHT", width: 16 },
    { header: "Total TTC", key: "totalTTC", width: 16 },

    { header: "Commission", key: "commission", width: 16 },
    { header: "Fabrication", key: "fabrication", width: 16 },
    { header: "Gain", key: "gain", width: 16 },
  ];

  /* ================= HEADER STYLE ================= */

  const headerRow = ws.getRow(1);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  headerRow.height = 24;

  /* ================= DATA ================= */

  data.forEach((d) => ws.addRow(d));

  /* ================= FORMAT € ================= */

  const moneyCols = [
    "productsHT",
    "shippingHT",
    "vat",
    "totalHT",
    "totalTTC",
    "commission",
    "fabrication",
    "gain",
  ];

  ws.eachRow((row, i) => {
    if (i === 1) return;

    row.eachCell((cell, col) => {
      const key = ws.columns[col - 1].key as string;

      if (moneyCols.includes(key)) {
        cell.numFmt = '#,##0.00 "€"';
        cell.alignment = { horizontal: "right" };
      } else if (key === "qty") {
        cell.alignment = { horizontal: "center" };
      }
    });
  });

  /* ================= AUTO FILTER ================= */

  ws.autoFilter = {
    from: "A1",
    to: "O1",
  };

  /* ================= TOTALS ================= */

  const lastRow = ws.rowCount + 1;

  ws.getCell(`J${lastRow}`).value = "TOTAL";
  ws.getCell(`J${lastRow}`).font = { bold: true };

  const totalCols = ["H", "I", "J", "K", "L", "O"];

  totalCols.forEach((col) => {
    const cell = ws.getCell(`${col}${lastRow}`);
    cell.value = {
      formula: `SUM(${col}2:${col}${lastRow - 1})`,
    };
    cell.numFmt = '#,##0.00 "€"';
    cell.font = { bold: true };
  });

  /* ================= RETURN ================= */

  return wb.xlsx.writeBuffer();
}