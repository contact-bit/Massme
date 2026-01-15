"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type TaxConfig = {
  rate: number;
  enabled: boolean;
};

const COUNTRIES = [
  { code: "FR", label: "France" },
  { code: "DE", label: "Allemagne" },
  { code: "ES", label: "Espagne" },
  { code: "IT", label: "Italie" },
  { code: "NL", label: "Pays-Bas" },
  { code: "BE", label: "Belgique" },
  { code: "CH", label: "Suisse" },
];

export default function AdminTaxesPage() {
  const [taxes, setTaxes] = useState<Record<string, TaxConfig>>({});

  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "taxes"));
      const map: any = {};
      snap.forEach((d) => (map[d.id] = d.data()));
      setTaxes(map);
    }
    load();
  }, []);

  const save = async (country: string, data: TaxConfig) => {
    await setDoc(doc(db, "taxes", country), data, { merge: true });
    setTaxes((p) => ({ ...p, [country]: data }));
  };

  return (
    <div className="admin-page">
      <h1>🌍 TVA par pays</h1>

      {COUNTRIES.map((c) => {
        const cfg = taxes[c.code] ?? { rate: 20, enabled: true };

        return (
          <div key={c.code} className="admin-card">
            <strong>{c.label}</strong>

            <label>
              <input
                type="checkbox"
                checked={cfg.enabled}
                onChange={(e) =>
                  save(c.code, { ...cfg, enabled: e.target.checked })
                }
              />
              TVA activée
            </label>

            <input
              type="number"
              step="0.1"
              value={cfg.rate}
              onChange={(e) =>
                save(c.code, { ...cfg, rate: Number(e.target.value) })
              }
            />
            %
          </div>
        );
      })}
    </div>
  );
}
