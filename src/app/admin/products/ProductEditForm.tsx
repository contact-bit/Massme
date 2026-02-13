"use client";

import React, { useEffect, useState } from "react";
import "@/app/admin/styles/product-form.css";

/* =====================================================
   TYPES
===================================================== */
type Lang = "fr" | "en" | "es" | "de" | "it" | "nl" | "pt";
type Market =
  | "FR"
  | "EN"
  | "BE"
  | "DE"
  | "AT"
  | "ES"
  | "IT"
  | "NL"
  | "PT"
  | "CH";
type Currency = "EUR" | "CHF";

type VatConfig = {
  enabled: boolean;
  rate: string;
};

type ProductVariant = {
  id: string;
  label: string;
  imageUrl: string;
  markets: Market[];
  pricesByMarket: Record<Market, string>;
  vatByMarket: Record<Market, VatConfig>;
};

type ProductAddon = {
  id: string;
  label: string;
  imageUrl: string;
  markets: Market[];
  pricesByMarket: Record<Market, string>;
  vatByMarket: Record<Market, VatConfig>;
};

/* =====================================================
   CONSTANTES
===================================================== */
const LANGS: Lang[] = ["fr", "en", "es", "de", "it", "nl", "pt"];

const MARKETS: { code: Market; label: string; currency: Currency }[] = [
  { code: "FR", label: "France", currency: "EUR" },
  { code: "EN", label: "English market", currency: "EUR" },
  { code: "BE", label: "Belgique", currency: "EUR" },
  { code: "DE", label: "Allemagne", currency: "EUR" },
  { code: "AT", label: "Autriche", currency: "EUR" },
  { code: "ES", label: "Espagne", currency: "EUR" },
  { code: "IT", label: "Italie", currency: "EUR" },
  { code: "NL", label: "Pays-Bas", currency: "EUR" },
  { code: "PT", label: "Portugal", currency: "EUR" },
  { code: "CH", label: "Suisse", currency: "CHF" },
];

const MARKET_BY_LANG: Partial<Record<Lang, Market>> = {
  fr: "FR",
  en: "EN",
  es: "ES",
  de: "DE",
  it: "IT",
  nl: "NL",
  pt: "PT",
};

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
  const activeMarket: Market | null = MARKET_BY_LANG[activeLang] || null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState(0);
  const [manageStock, setManageStock] = useState<boolean>(true); // ✅ gestion du stock pour cet article
  const [isActive, setIsActive] = useState(true);

  const [name, setName] = useState<Record<Lang, string>>(emptyLangRecord);
  const [description, setDescription] =
    useState<Record<Lang, string>>(emptyLangRecord);

  const [markets, setMarkets] = useState<Market[]>([]);
  const [pricesByMarket, setPricesByMarket] =
    useState<Record<Market, string>>({} as any);
  const [vatByMarket, setVatByMarket] = useState<
    Record<Market, VatConfig>
  >({} as any);

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [addons, setAddons] = useState<ProductAddon[]>([]);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (!product) return;

    setImageUrl(product.imageUrl || "");
    setStock(product.stock ?? 0);
    setManageStock(
      typeof product.manageStock === "boolean" ? product.manageStock : true
    );
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

    // Variantes
    setVariants(
      Array.isArray(product.variants)
        ? product.variants.map((vv: any) => {
            const vm: Market[] = vv.markets ?? product.markets ?? ["FR"];
            const vp: Record<Market, string> = {} as any;
            const vvVat: Record<Market, VatConfig> = {} as any;

            MARKETS.forEach(({ code }) => {
              vp[code] = String(vv.pricesByMarket?.[code] ?? "");
              vvVat[code] = {
                enabled: vv.vatByMarket?.[code]?.enabled ?? false,
                rate: String(vv.vatByMarket?.[code]?.rate ?? ""),
              };
            });

            return {
              id: String(vv.id || ""),
              label: String(vv.label || ""),
              imageUrl: String(vv.imageUrl || ""),
              markets: vm,
              pricesByMarket: vp,
              vatByMarket: vvVat,
            };
          })
        : []
    );

    // Addons
    setAddons(
      Array.isArray(product.addons)
        ? product.addons.map((aa: any) => {
            const am: Market[] = aa.markets ?? product.markets ?? ["FR"];
            const ap: Record<Market, string> = {} as any;
            const av: Record<Market, VatConfig> = {} as any;

            MARKETS.forEach(({ code }) => {
              ap[code] = String(aa.pricesByMarket?.[code] ?? "");
              av[code] = {
                enabled: aa.vatByMarket?.[code]?.enabled ?? false,
                rate: String(aa.vatByMarket?.[code]?.rate ?? ""),
              };
            });

            return {
              id: String(aa.id || ""),
              label: String(aa.label || ""),
              imageUrl: String(aa.imageUrl || ""),
              markets: am,
              pricesByMarket: ap,
              vatByMarket: av,
            };
          })
        : []
    );
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
          manageStock, // ✅ envoyé au backend
          isActive,
          markets,
          pricesByMarket: Object.fromEntries(
            markets.map((m) => [m, toNumber(pricesByMarket[m])])
          ),
          vatByMarket: Object.fromEntries(
            markets.map((m) => {
              const cfg = vatByMarket[m] || { enabled: false, rate: "" };
              const enabled = cfg.enabled;
              const rate = toNumber(cfg.rate);
              return [
                m,
                {
                  enabled: enabled && rate > 0,
                  rate: enabled && rate > 0 ? rate : 0,
                },
              ];
            })
          ),
          variants: variants
            .filter((v) => v.id && v.label)
            .map((v) => ({
              id: v.id,
              label: v.label,
              imageUrl: v.imageUrl,
              markets: v.markets,
              pricesByMarket: Object.fromEntries(
                v.markets.map((m) => [m, toNumber(v.pricesByMarket[m])])
              ),
              vatByMarket: Object.fromEntries(
                v.markets.map((m) => {
                  const cfg = v.vatByMarket[m] || {
                    enabled: false,
                    rate: "",
                  };
                  const enabled = cfg.enabled;
                  const rate = toNumber(cfg.rate);
                  return [
                    m,
                    {
                      enabled: enabled && rate > 0,
                      rate: enabled && rate > 0 ? rate : 0,
                    },
                  ];
                })
              ),
            })),
          addons: addons
            .filter((a) => a.id && a.label)
            .map((a) => ({
              id: a.id,
              label: a.label,
              imageUrl: a.imageUrl,
              markets: a.markets,
              pricesByMarket: Object.fromEntries(
                a.markets.map((m) => [m, toNumber(a.pricesByMarket[m])])
              ),
              vatByMarket: Object.fromEntries(
                a.markets.map((m) => {
                  const cfg = a.vatByMarket[m] || {
                    enabled: false,
                    rate: "",
                  };
                  const enabled = cfg.enabled;
                  const rate = toNumber(cfg.rate);
                  return [
                    m,
                    {
                      enabled: enabled && rate > 0,
                      rate: enabled && rate > 0 ? rate : 0,
                    },
                  ];
                })
              ),
            })),
        },
      };

      console.log("PAYLOAD SENT", JSON.stringify(payload, null, 2));

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

      {/* Gestion du stock pour cet article */}
      <label className="admin-switch">
        <input
          type="checkbox"
          checked={manageStock}
          onChange={(e) => setManageStock(e.target.checked)}
        />
        Gestion du stock pour cet article
      </label>

      <label className="admin-label">
        Stock {manageStock ? "" : "(ignoré si gestion désactivée)"}
      </label>
      <input
        type="number"
        className="admin-input"
        value={stock}
        onChange={(e) => setStock(Number(e.target.value))}
        disabled={!manageStock}
      />

      {/* VARIANTES */}
      <section className="pf-card">
        <h3>🎨 Variantes (couleurs / matières)</h3>

        {variants.length === 0 && (
          <p className="pf-help">
            Exemple : Blanc [Fibres de bambou], Rouge [Simili cuir], etc.
          </p>
        )}

        <div className="pf-variants-list">
          {variants.map((v, idx) => (
            <div key={idx} className="pf-variant-block">
              <div className="pf-row pf-variant-row">
                <input
                  className="admin-input pf-variant-id"
                  placeholder="ID interne"
                  value={v.id}
                  onChange={(e) => {
                    const copy = [...variants];
                    copy[idx] = { ...copy[idx], id: e.target.value };
                    setVariants(copy);
                  }}
                />
                <input
                  className="admin-input pf-variant-label"
                  placeholder="Label affiché"
                  value={v.label}
                  onChange={(e) => {
                    const copy = [...variants];
                    copy[idx] = { ...copy[idx], label: e.target.value };
                    setVariants(copy);
                  }}
                />
                <input
                  className="admin-input pf-variant-image"
                  placeholder="Image URL"
                  value={v.imageUrl}
                  onChange={(e) => {
                    const copy = [...variants];
                    copy[idx] = { ...copy[idx], imageUrl: e.target.value };
                    setVariants(copy);
                  }}
                />
                <button
                  type="button"
                  className="btn btn-ghost pf-variant-remove"
                  onClick={() =>
                    setVariants((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  ✕
                </button>
              </div>

              {/* Prix & TVA par pays pour cette variante */}
              <div className="pf-table pf-table-variant">
                <div className="pf-row pf-head">
                  <span>Pays</span>
                  <span>Actif</span>
                  <span>Prix HT</span>
                  <span>TVA</span>
                  <span>Taux %</span>
                  <span>Devise</span>
                </div>

                {(activeMarket
                  ? MARKETS.filter((m) => m.code === activeMarket)
                  : MARKETS
                ).map((m) => {
                  const active = v.markets.includes(m.code);
                  const vat = v.vatByMarket[m.code];

                  return (
                    <div key={m.code} className="pf-row">
                      <span>
                        <strong>{m.code}</strong> {m.label}
                      </span>

                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => {
                          const copy = [...variants];
                          const current = copy[idx];
                          const nextMarkets = active
                            ? current.markets.filter((x) => x !== m.code)
                            : Array.from(
                                new Set([...(current.markets || []), m.code])
                              );
                          copy[idx] = { ...current, markets: nextMarkets };
                          setVariants(copy);
                        }}
                      />

                      <input
                        type="number"
                        step="0.01"
                        disabled={!active}
                        value={v.pricesByMarket[m.code] || ""}
                        onChange={(e) => {
                          const copy = [...variants];
                          const current = copy[idx];
                          copy[idx] = {
                            ...current,
                            pricesByMarket: {
                              ...current.pricesByMarket,
                              [m.code]: e.target.value,
                            },
                          };
                          setVariants(copy);
                        }}
                      />

                      <input
                        type="checkbox"
                        disabled={!active}
                        checked={vat?.enabled ?? false}
                        onChange={(e) => {
                          const copy = [...variants];
                          const current = copy[idx];
                          copy[idx] = {
                            ...current,
                            vatByMarket: {
                              ...current.vatByMarket,
                              [m.code]: {
                                ...(current.vatByMarket[m.code] || {
                                  rate: "",
                                }),
                                enabled: e.target.checked,
                              },
                            },
                          };
                          setVariants(copy);
                        }}
                      />

                      <input
                        type="number"
                        step="0.01"
                        disabled={!active || !vat?.enabled}
                        value={vat?.rate ?? ""}
                        onChange={(e) => {
                          const copy = [...variants];
                          const current = copy[idx];
                          copy[idx] = {
                            ...current,
                            vatByMarket: {
                              ...current.vatByMarket,
                              [m.code]: {
                                ...(current.vatByMarket[m.code] || {
                                  enabled: false,
                                }),
                                rate: e.target.value,
                              },
                            },
                          };
                          setVariants(copy);
                        }}
                      />

                      <span>{m.currency}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-secondary pf-variant-add"
          onClick={() =>
            setVariants((prev) => [
              ...prev,
              {
                id: "",
                label: "",
                imageUrl: "",
                markets: [],
                pricesByMarket: {} as any,
                vatByMarket: {} as any,
              },
            ])
          }
        >
          + Ajouter une variante
        </button>
      </section>

      {/* OPTIONS / HOUSSES */}
      <section className="pf-card">
        <h3>🧺 Options / Housses</h3>

        {addons.length === 0 && (
          <p className="pf-help">
            Exemple : “Housse supplémentaire bambou”, “Housse simili‑cuir”, etc.
          </p>
        )}

        <div className="pf-addons-list">
          {addons.map((a, idx) => (
            <div key={idx} className="pf-addon-block">
              <div className="pf-row pf-addon-row">
                <input
                  className="admin-input pf-addon-id"
                  placeholder="ID interne"
                  value={a.id}
                  onChange={(e) => {
                    const copy = [...addons];
                    copy[idx] = { ...copy[idx], id: e.target.value };
                    setAddons(copy);
                  }}
                />
                <input
                  className="admin-input pf-addon-label"
                  placeholder="Label affiché"
                  value={a.label}
                  onChange={(e) => {
                    const copy = [...addons];
                    copy[idx] = { ...copy[idx], label: e.target.value };
                    setAddons(copy);
                  }}
                />
                <input
                  className="admin-input pf-addon-image"
                  placeholder="Image URL"
                  value={a.imageUrl}
                  onChange={(e) => {
                    const copy = [...addons];
                    copy[idx] = { ...copy[idx], imageUrl: e.target.value };
                    setAddons(copy);
                  }}
                />
                <button
                  type="button"
                  className="btn btn-ghost pf-addon-remove"
                  onClick={() =>
                    setAddons((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  ✕
                </button>
              </div>

              {/* Prix & TVA par pays pour cet addon */}
              <div className="pf-table pf-table-addon">
                <div className="pf-row pf-head">
                  <span>Pays</span>
                  <span>Actif</span>
                  <span>Prix HT</span>
                  <span>TVA</span>
                  <span>Taux %</span>
                  <span>Devise</span>
                </div>

                {(activeMarket
                  ? MARKETS.filter((m) => m.code === activeMarket)
                  : MARKETS
                ).map((m) => {
                  const active = a.markets.includes(m.code);
                  const vat = a.vatByMarket[m.code];

                  return (
                    <div key={m.code} className="pf-row">
                      <span>
                        <strong>{m.code}</strong> {m.label}
                      </span>

                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => {
                          const copy = [...addons];
                          const current = copy[idx];
                          const nextMarkets = active
                            ? current.markets.filter((x) => x !== m.code)
                            : Array.from(
                                new Set([...(current.markets || []), m.code])
                              );
                          copy[idx] = { ...current, markets: nextMarkets };
                          setAddons(copy);
                        }}
                      />

                      <input
                        type="number"
                        step="0.01"
                        disabled={!active}
                        value={a.pricesByMarket[m.code] || ""}
                        onChange={(e) => {
                          const copy = [...addons];
                          const current = copy[idx];
                          copy[idx] = {
                            ...current,
                            pricesByMarket: {
                              ...current.pricesByMarket,
                              [m.code]: e.target.value,
                            },
                          };
                          setAddons(copy);
                        }}
                      />

                      <input
                        type="checkbox"
                        disabled={!active}
                        checked={vat?.enabled ?? false}
                        onChange={(e) => {
                          const copy = [...addons];
                          const current = copy[idx];
                          copy[idx] = {
                            ...current,
                            vatByMarket: {
                              ...current.vatByMarket,
                              [m.code]: {
                                ...(current.vatByMarket[m.code] || {
                                  rate: "",
                                }),
                                enabled: e.target.checked,
                              },
                            },
                          };
                          setAddons(copy);
                        }}
                      />

                      <input
                        type="number"
                        step="0.01"
                        disabled={!active || !vat?.enabled}
                        value={vat?.rate ?? ""}
                        onChange={(e) => {
                          const copy = [...addons];
                          const current = copy[idx];
                          copy[idx] = {
                            ...current,
                            vatByMarket: {
                              ...current.vatByMarket,
                              [m.code]: {
                                ...(current.vatByMarket[m.code] || {
                                  enabled: false,
                                }),
                                rate: e.target.value,
                              },
                            },
                          };
                          setAddons(copy);
                        }}
                      />

                      <span>{m.currency}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-secondary pf-addon-add"
          onClick={() =>
            setAddons((prev) => [
              ...prev,
              {
                id: "",
                label: "",
                imageUrl: "",
                markets: [],
                pricesByMarket: {} as any,
                vatByMarket: {} as any,
              },
            ])
          }
        >
          + Ajouter une option / housse
        </button>
      </section>

      {/* PRIX + TVA PRODUIT */}
      <section className="pf-card">
        <h3>🌍 Prix & TVA par pays (produit)</h3>

        <div className="pf-table">
          <div className="pf-row pf-head">
            <span>Pays</span>
            <span>Actif</span>
            <span>Prix HT</span>
            <span>TVA</span>
            <span>Taux %</span>
            <span>Devise</span>
          </div>

          {(activeMarket
            ? MARKETS.filter((m) => m.code === activeMarket)
            : MARKETS
          ).map((m) => {
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
