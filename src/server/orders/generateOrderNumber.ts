import { dbAdmin } from "@/lib/firebase.admin";

function getTodayParts() {
  const now = new Date();

  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");

  return { y, m, d };
}

export async function generateOrderNumber() {
  const { y, m, d } = getTodayParts();

  const dateKey = `${y}${m}${d}`;        // pour Firestore
  const displayDate = `${y}-${m}-${d}`;  // pour affichage

  const ref = dbAdmin.collection("counters_daily").doc(dateKey);

  const count = await dbAdmin.runTransaction(async (tx) => {
    const doc = await tx.get(ref);

    if (!doc.exists) {
      tx.set(ref, { count: 1, createdAt: new Date() });
      return 1;
    }

    const next = (doc.data()?.count || 0) + 1;
    tx.update(ref, { count: next });
    return next;
  });

  const formatted = String(count).padStart(3, "0");

  // 🔥 PLUS DE "OC"
  return `${displayDate}-${formatted}`;
}