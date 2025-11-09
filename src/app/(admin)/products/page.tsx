import { db } from "@/lib/firebase.client";
import { collection, getDocs } from "firebase/firestore";

export default async function AdminProductsPage() {
  const snap = await getDocs(collection(db, "products"));
  const products: any[] = [];
  snap.forEach((d) => products.push({ id: d.id, ...d.data() }));

  return (
    <main className="max-w-5xl mx-auto py-8 space-y-4">
      <h1 className="text-xl font-semibold">Produits</h1>
      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id} className="border rounded px-3 py-2">
            {p.name?.fr ?? p.name} — {p.price?.EUR} €
          </li>
        ))}
      </ul>
    </main>
  );
}
