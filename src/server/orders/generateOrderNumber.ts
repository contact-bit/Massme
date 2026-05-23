import { dbAdmin } from "@/lib/firebase.admin";

export async function generateOrderNumber() {
  const ref = dbAdmin.collection("counters").doc("orders");

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

  const formatted = String(count).padStart(5, "0");

  return `ID${formatted}`;
}
