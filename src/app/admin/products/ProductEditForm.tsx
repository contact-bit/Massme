"use client";

import React, { useEffect, useMemo, useState } from "react";

type Lang = "fr" | "en" | "es" | "de" | "it" | "nl" | "pt";
type Market = "FR" | "BE" | "DE" | "AT" | "ES" | "IT" | "NL" | "PT" | "CH";
type Currency = "EUR" | "CHF";

const LANGS: { code: Lang; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "nl", label: "Nederlands" },
  { code: "pt", label: "Português" },
];

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

function emptyLangRecord(): Record<Lang, string> {
  return { fr: "", en: "", es: "", de: "", it: "", nl: "", pt: "" };
}

function toNum(v: unknown): number {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function toInt(v: unknown): number {
  const n = Math.floor(toNum(v));
  return Number.isFinite(n) ? n : 0;
}

function normalizeString(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

export default function ProductEditForm({
  product,
  onClose,
  onUpdated,
}: {
  product: any;
  onClose: () => void;
  onUpdated: () => void;
}) {
  if (!product) return null;

  const currencyByMarket = useMemo(() => {
    const map = {} as Record<Market, Currency>;
    for (const m of MARKETS) map[m.code] = m.currency;
    return map;
  }, []);

  // UI
  const [activeLang, setActiveLang] = useState<Lang>("fr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin pwd
  const [adminPassword, setAdminPassword] = useState("");

  // Base fields
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState<number | string>("");
  const [isActive, setIsActive] = useState(true);

  // Multi language
  const [name, setName] = useState<Record<Lang, string>>(() => emptyLangRecord());
  const [description, setDescription] = useState<Record<Lang, string>>(() => emptyLangRecord());

  // Markets + prices
  const [markets, setMarkets] = useState<Market[]>(["FR"]);
  const [pricesByMarket, setPricesByMarket] = useState<Record<Market, string>>(() => ({
    FR: "149.90",
    BE: "149.90",
    DE: "149.90",
    AT: "149.90",
    ES: "149.90",
    IT: "149.90",
    NL: "149.90",
    PT: "149.90",
    CH: "169.00",
  }));

  useEffect(() => {
    // --- hydrate from product ---
    setImageUrl(normalizeString(product.imageUrl || ""));
    setStock(product.stock ?? "");
    setIsActive(product.isActive ?? true);

    // name: support old formats
    const n = product.name;
    if (typeof n === "string") {
      setName((prev) => ({ ...prev, fr: n, en: n }));
    } else {
      setName({
        fr: normalizeString(n?.fr),
        en: normalizeString(n?.en),
        es: normalizeString(n?.es),
        de: normalizeString(n?.de),
        it: normalizeString(n?.it),
        nl: normalizeString(n?.nl),
        pt: normalizeString(n?.pt),
      });
    }

    // description: support old formats
    const d = product.description;
    if (typeof d === "string") {
      setDescription((prev) => ({ ...prev, fr: d, en: d }));
    } else {
      setDescription({
        fr: normalizeString(d?.fr),
        en: normalizeString(d?.en),
        es: normalizeString(d?.es),
        de: normalizeString(d?.de),
        it: normalizeString(d?.it),
        nl: normalizeString(d?.nl),
        pt: normalizeString(d?.pt),
      });
    }

    // markets: default FR if missing
    const m = Array.isArray(product.markets) ? product.markets : null;
    const mNorm = (m || ["FR"]).filter((x: any) => typeof x === "string") as Market[];
    setMarkets(mNorm.length ? mNorm : ["FR"]);

    // pricesByMarket: support old price.eur
    const pbm = product.pricesByMarket;
    const oldPriceEur =
      typeof product.price === "number"
        ? product.price
        : typeof product.price?.eur === "number"
        ? product.price.eur
        : 0;

    setPricesByMarket((prev) => {
      const next = { ...prev };
      // hydrate from pbm if exists
      if (pbm && typeof pbm === "object") {
        for (const k of Object.keys(pbm)) {
          const mk = k as Market;
          if (mk in next) next[mk] = String(pbm[mk] ?? "");
        }
      } else if (oldPriceEur) {
        // fill eur markets with old eur
        for (const x of MARKETS) {
          if (x.currency === "EUR") next[x.code] = String(oldPriceEur);
        }
      }
      return next;
    });
  }, [product]);

  const toggleMarket = (m: Market) => {
    setMarkets((prev) => {
      const has = prev.includes(m);
      const next = has ? prev.filter((x) => x !== m) : [...prev, m];
      return next.length ? next : ["FR"];
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminPassword) {
      setError("Merci d’entrer le mot de passe admin.");
      return;
    }
    if (!name.fr.trim()) {
      setError("Le nom FR est obligatoire (minimum).");
      return;
    }
    if (!markets.length) {
      setError("Choisis au moins un pays (market).");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        data: {
          name,
          description,
          stock: Math.max(0, toInt(stock)),
          isActive,
          imageUrl: imageUrl.trim() || null,

          // ✅ NEW
          markets,
          pricesByMarket: Object.fromEntries(
            markets.map((m) => [m, Math.round(toNum(pricesByMarket[m]) * 100) / 100])
          ) as Record<Market, number>,
          currencyByMarket: Object.fromEntries(
            markets.map((m) => [m, currencyByMarket[m]])
          ) as Record<Market, Currency>,

          // (optionnel) keep legacy price for older code paths if you want:
          // price: { eur: Math.round(toNum(pricesByMarket["FR"]) * 100) / 100 },
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

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Erreur lors de la mise à jour");
      }

      onUpdated();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="admin-form">
      <div className="admin-form-head">
        <div>
          <h2 className="admin-section-title">Modifier le produit</h2>
          <p className="admin-muted">Langues + pays (markets) + prix/devise.</p>
        </div>

        <div className="admin-lang-tabs">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`admin-lang-tab ${activeLang === l.code ? "active" : ""}`}
              onClick={() => setActiveLang(l.code)}
              title={l.label}
            >
              {l.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* IMAGE PREVIEW */}
      <div className="admin-img-wrapper">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Preview" className="admin-img-preview" />
        ) : (
          <div className="admin-img-placeholder">Aucune image</div>
        )}
      </div>

      <label className="admin-label">URL de l'image Cloudflare</label>
      <input
        type="text"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="admin-input"
        placeholder="https://imagedelivery.net/..."
      />

      {/* LANG FIELDS */}
      <div className="admin-grid-2">
        <div>
          <label className="admin-label">Nom ({activeLang.toUpperCase()})</label>
          <input
            type="text"
            value={name[activeLang]}
            onChange={(e) => setName((prev) => ({ ...prev, [activeLang]: e.target.value }))}
            className="admin-input"
          />
          <p className="admin-hint">Minimum requis : FR.</p>
        </div>

        <div>
          <label className="admin-label">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      <label className="admin-label">Description ({activeLang.toUpperCase()})</label>
      <textarea
        value={description[activeLang]}
        onChange={(e) => setDescription((prev) => ({ ...prev, [activeLang]: e.target.value }))}
        className="admin-textarea"
        rows={6}
      />

      {/* MARKETS */}
      <div className="admin-block">
        <div className="admin-block-title">Pays (marchés) où le produit est vendu</div>
        <div className="admin-markets">
          {MARKETS.map((m) => {
            const checked = markets.includes(m.code);
            return (
              <button
                key={m.code}
                type="button"
                className={`admin-market-chip ${checked ? "on" : ""}`}
                onClick={() => toggleMarket(m.code)}
              >
                <span className="code">{m.code}</span>
                <span className="cur">{m.currency}</span>
                <span className="lbl">{m.label}</span>
              </button>
            );
          })}
        </div>
        <div className="admin-hint">CHF uniquement pour CH. Le reste = EUR.</div>
      </div>

      {/* PRICES */}
      <div className="admin-block">
        <div className="admin-block-title">Prix par pays (uniquement marchés sélectionnés)</div>

        <div className="admin-price-list">
          {markets.map((m) => (
            <div key={m} className="admin-price-row">
              <div className="mk">{m}</div>
              <input
                className="admin-input"
                value={pricesByMarket[m]}
                onChange={(e) => setPricesByMarket((prev) => ({ ...prev, [m]: e.target.value }))}
                inputMode="decimal"
                placeholder="0.00"
              />
              <div className="ccy">{currencyByMarket[m]}</div>
            </div>
          ))}
        </div>
      </div>

      <label className="admin-switch">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <span>Produit actif ({isActive ? "🟢 visible" : "🔴 masqué"})</span>
      </label>

      {/* ADMIN PASSWORD */}
      <label className="admin-label mt-4">Mot de passe admin</label>
      <input
        type="password"
        value={adminPassword}
        onChange={(e) => setAdminPassword(e.target.value)}
        className="admin-input"
        placeholder="••••••••"
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <div className="admin-form-actions">
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Annuler
        </button>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Enregistrement…" : "💾 Enregistrer"}
        </button>
      </div>

      {/* minimal css helper if missing */}
      <style jsx>{`
        .admin-form-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .admin-muted {
          margin: 6px 0 0;
          color: rgba(11, 18, 32, 0.6);
          font-weight: 700;
          font-size: 12px;
        }
        .admin-lang-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .admin-lang-tab {
          border: 1px solid rgba(11, 18, 32, 0.12);
          background: rgba(11, 18, 32, 0.03);
          border-radius: 999px;
          padding: 8px 10px;
          font-weight: 950;
          font-size: 12px;
          cursor: pointer;
        }
        .admin-lang-tab.active {
          background: rgba(37, 99, 235, 1);
          border-color: rgba(37, 99, 235, 1);
          color: #fff;
          box-shadow: 0 12px 26px rgba(37, 99, 235, 0.22);
        }
        .admin-grid-2 {
          display: grid;
          grid-template-columns: 1fr 220px;
          gap: 12px;
        }
        .admin-hint {
          font-size: 12px;
          color: rgba(11, 18, 32, 0.55);
          font-weight: 750;
          margin-top: 6px;
        }
        .admin-block {
          margin-top: 14px;
          padding: 12px;
          border: 1px solid rgba(11, 18, 32, 0.1);
          border-radius: 14px;
          background: rgba(11, 18, 32, 0.02);
        }
        .admin-block-title {
          font-weight: 950;
          margin-bottom: 10px;
          color: rgba(11, 18, 32, 0.9);
        }
        .admin-markets {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
        .admin-market-chip {
          border: 1px solid rgba(11, 18, 32, 0.12);
          background: #fff;
          border-radius: 14px;
          padding: 10px 12px;
          cursor: pointer;
          text-align: left;
          display: grid;
          gap: 4px;
        }
        .admin-market-chip.on {
          border-color: rgba(37, 99, 235, 0.45);
          background: rgba(37, 99, 235, 0.08);
        }
        .admin-market-chip .code {
          font-weight: 950;
        }
        .admin-market-chip .cur {
          font-weight: 900;
          color: rgba(11, 18, 32, 0.65);
          font-size: 12px;
        }
        .admin-market-chip .lbl {
          color: rgba(11, 18, 32, 0.7);
          font-weight: 800;
          font-size: 12px;
        }
        .admin-price-list {
          display: grid;
          gap: 10px;
        }
        .admin-price-row {
          display: grid;
          grid-template-columns: 70px 1fr 70px;
          gap: 10px;
          align-items: center;
          padding: 10px;
          border: 1px solid rgba(11, 18, 32, 0.1);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.9);
        }
        .admin-price-row .mk {
          font-weight: 950;
        }
        .admin-price-row .ccy {
          font-weight: 950;
          color: rgba(11, 18, 32, 0.7);
          text-align: right;
        }

        @media (max-width: 820px) {
          .admin-grid-2 {
            grid-template-columns: 1fr;
          }
          .admin-markets {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </form>
  );
}
