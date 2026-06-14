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
      const map: Record<string, TaxConfig> = {};

      snap.forEach((entry) => {
        const data = entry.data();

        map[entry.id] = {
          rate: Number(data.rate ?? 20),
          enabled: data.enabled !== false,
        };
      });

      setTaxes(map);
    }
    load();
  }, []);

  const save = async (country: string, data: TaxConfig) => {
    await setDoc(doc(db, "taxes", country), data, { merge: true });
    setTaxes((p) => ({ ...p, [country]: data }));
  };

  return (
    <div className="admin-page taxes-page">
      <header className="taxes-head">
        <div>
          <h1>TVA par pays</h1>
          <p>Configurez simplement l’activation et le taux appliqué.</p>
        </div>
      </header>

      <div className="taxes-grid">
        {COUNTRIES.map((c) => {
          const cfg = taxes[c.code] ?? { rate: 20, enabled: true };

          return (
            <div key={c.code} className="admin-card taxes-card">
              <div className="taxes-card-head">
                <div>
                  <strong>{c.label}</strong>
                  <small>{c.code}</small>
                </div>

                <label className={`taxes-switch ${cfg.enabled ? "is-active" : ""}`}>
                  <input
                    type="checkbox"
                    checked={cfg.enabled}
                    onChange={(e) =>
                      save(c.code, { ...cfg, enabled: e.target.checked })
                    }
                  />
                  <span className="taxes-switch-track">
                    <span />
                  </span>
                  <span>{cfg.enabled ? "Activée" : "Désactivée"}</span>
                </label>
              </div>

              <label className="taxes-rate">
                <span>Taux de TVA</span>
                <span className="taxes-rate-input">
                  <input
                    type="number"
                    step="0.1"
                    value={cfg.rate}
                    onChange={(e) =>
                      save(c.code, { ...cfg, rate: Number(e.target.value) })
                    }
                  />
                  <strong>%</strong>
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
