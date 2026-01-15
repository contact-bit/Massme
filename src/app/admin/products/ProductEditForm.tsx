"use client";

import React, { useEffect, useMemo, useState } from "react";
import "@/app/admin/styles/product-form.css";

/* =====================================================
   TYPES
===================================================== */
type Lang = "fr" | "en" | "es" | "de" | "it" | "nl" | "pt";
type Market = "FR" | "BE" | "DE" | "AT" | "ES" | "IT" | "NL" | "PT" | "CH";
type Currency = "EUR" | "CHF";

/* =====================================================
   CONSTANTES
===================================================== */
const LANGS: Lang[] = ["fr", "en", "es", "de", "it", "nl", "pt"];

const MARKETS: { code: Market; label: string; currency: Currency }[] = [
  { code: "FR", label: "France", currency: "EUR" },
  { code: "BE", label: "Belgique", currency: "EUR" },
  { code: "DE", label: "Allemagne", currency: "EUR" },
  { code: "AT", label: "Autriche", currency: "EUR" },
  { code: "ES", label: "Espagne", currency: "EUR" },
  { code: "IT", label: "Italie", currency: "EUR" },
  { code: "NL", label: "Pays-Bas", currency: "EUR" },
  { code: "PT", label: "Portugal", currency: "EUR" },
  { code: "CH", label: "Suisse", currency: "CHF" },
];

const emptyLangRecord = (): Record<Lang, string> =>
  Object.fromEntries(LANGS.map((l) => [l, ""])) as Record<Lang, string>;

const toNumber = (v: unknown) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

/* =====================================================
   COMPONENT
===================================================== */
export default function ProductEditForm({
  product,
  onClose,
  onUpdated,
}: {
  product: any;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [activeLang, setActiveLang] = useState<Lang>("fr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [name, setName] = useState<Record<Lang, string>>(emptyLangRecord);
  const [description, setDescription] =
    useState<Record<Lang, string>>(emptyLangRecord);

  const [markets, setMarkets] = useState<Market[]>([]);
  const [pricesByMarket, setPricesByMarket] =
    useState<Record<Market, string>>({} as any);

  const [vatByMarket, setVatByMarket] = useState<
    Record<Market, { enabled: boolean; rate: string }>
  >({} as any);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (!product) return;

    setImageUrl(product.imageUrl || "");
    setStock(product.stock ?? 0);
    setIsActive(product.isActive ?? true);

    setName({ ...emptyLangRecord(), ...(product.name || {}) });
    setDescription({ ...emptyLangRecord(), ...(product.description || {}) });

    const m: Market[] = product.markets ?? ["FR"];
    setMarkets(m);

    const p: any = {};
    const v: any = {};

    MARKETS.forEach(({ code }) => {
      p[code] = String(product.pricesByMarket?.[code] ?? "");
      v[code] = {
        enabled: product.vatByMarket?.[code]?.enabled ?? false,
        rate: String(product.vatByMarket?.[code]?.rate ?? ""),
      };
    });

    setPricesByMarket(p);
    setVatByMarket(v);
  }, [product]);

  /* ---------------- SAVE ---------------- */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminPassword) return setError("Mot de passe admin requis");
    if (!name.fr.trim()) return setError("Nom FR obligatoire");
    if (!markets.length) return setError("Sélectionne au moins un pays");

    setLoading(true);

    try {
      const payload = {
        data: {
          name,
          description,
          imageUrl: imageUrl || null,
          stock,
          isActive,
          markets,

          pricesByMarket: Object.fromEntries(
            markets.map((m) => [m, toNumber(pricesByMarket[m])])
          ),

          vatByMarket: Object.fromEntries(
            markets.map((m) => {
              const enabled = vatByMarket[m]?.enabled ?? false;
              const rate = toNumber(vatByMarket[m]?.rate);
              return [
                m,
                {
                  enabled: enabled && rate > 0,
                  rate: enabled && rate > 0 ? rate : 0,
                },
              ];
            })
          ),
        },
      };

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <form onSubmit={handleSave} className="admin-form">
      <h2 className="admin-section-title">✏️ Modifier le produit</h2>

      {/* LANG */}
      <div className="admin-lang-tabs">
        {LANGS.map((l) => (
          <button
            key={l}
            type="button"
            className={activeLang === l ? "active" : ""}
            onClick={() => setActiveLang(l)}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <label className="admin-label">Nom</label>
      <input
        className="admin-input"
        value={name[activeLang]}
        onChange={(e) =>
          setName((p) => ({ ...p, [activeLang]: e.target.value }))
        }
      />

      <label className="admin-label">Description</label>
      <textarea
        className="admin-textarea"
        rows={5}
        value={description[activeLang]}
        onChange={(e) =>
          setDescription((p) => ({ ...p, [activeLang]: e.target.value }))
        }
      />

      <label className="admin-label">Image URL</label>
      <input
        className="admin-input"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />

      <label className="admin-label">Stock</label>
      <input
        type="number"
        className="admin-input"
        value={stock}
        onChange={(e) => setStock(Number(e.target.value))}
      />

      {/* PRIX + TVA */}
      <section className="pf-card">
        <h3>🌍 Prix & TVA par pays</h3>

        <div className="pf-table">
          <div className="pf-row pf-head">
            <span>Pays</span>
            <span>Actif</span>
            <span>Prix HT</span>
            <span>TVA</span>
            <span>Taux %</span>
            <span>Devise</span>
          </div>

          {MARKETS.map((m) => {
            const active = markets.includes(m.code);
            const vat = vatByMarket[m.code];

            return (
              <div key={m.code} className="pf-row">
                <span>
                  <strong>{m.code}</strong> {m.label}
                </span>

                <input
                  type="checkbox"
                  checked={active}
                  onChange={() =>
                    setMarkets((p) =>
                      active ? p.filter((x) => x !== m.code) : [...p, m.code]
                    )
                  }
                />

                <input
                  type="number"
                  step="0.01"
                  disabled={!active}
                  value={pricesByMarket[m.code] || ""}
                  onChange={(e) =>
                    setPricesByMarket((p) => ({
                      ...p,
                      [m.code]: e.target.value,
                    }))
                  }
                />

                <input
                  type="checkbox"
                  disabled={!active}
                  checked={vat?.enabled ?? false}
                  onChange={(e) =>
                    setVatByMarket((p) => ({
                      ...p,
                      [m.code]: {
                        ...p[m.code],
                        enabled: e.target.checked,
                      },
                    }))
                  }
                />

                <input
                  type="number"
                  step="0.01"
                  disabled={!active || !vat?.enabled}
                  value={vat?.rate ?? ""}
                  onChange={(e) =>
                    setVatByMarket((p) => ({
                      ...p,
                      [m.code]: {
                        ...p[m.code],
                        rate: e.target.value,
                      },
                    }))
                  }
                />

                <span>{m.currency}</span>
              </div>
            );
          })}
        </div>
      </section>

      <label className="admin-switch">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Produit actif
      </label>

      <label className="admin-label">Mot de passe admin</label>
      <input
        type="password"
        className="admin-input"
        value={adminPassword}
        onChange={(e) => setAdminPassword(e.target.value)}
      />

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Annuler
        </button>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Enregistrement…" : "💾 Enregistrer"}
        </button>
      </div>
    </form>
  );
}
