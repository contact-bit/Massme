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
  productCode: string;
  label: string;
  description: string;
  imageUrl: string;
  markets: Market[];
  pricesByMarket: Record<Market, string>;
  vatByMarket: Record<Market, VatConfig>;
};

type ProductAddon = {
  id: string;
  productCode: string;
  label: string;
  description: string;
  imageUrl: string;
  markets: Market[];
  pricesByMarket: Record<Market, string>;
  vatByMarket: Record<Market, VatConfig>;
};

/* =====================================================
   CONSTANTES
===================================================== */
const LANGS: Lang[] = ["fr", "en", "es", "de", "it", "nl", "pt"];

const LANG_META: Record<
  Lang,
  {
    flag: string;
    label: string;
    code: string;
  }
> = {
  fr: { flag: "🇫🇷", label: "France", code: "FR" },
  en: { flag: "🇬🇧", label: "Angleterre", code: "EN" },
  es: { flag: "🇪🇸", label: "Espagne", code: "ES" },
  de: { flag: "🇩🇪", label: "Allemagne", code: "DE" },
  it: { flag: "🇮🇹", label: "Italie", code: "IT" },
  nl: { flag: "🇳🇱", label: "Pays-Bas", code: "NL" },
  pt: { flag: "🇵🇹", label: "Portugal", code: "PT" },
};

const MARKETS: { code: Market; label: string; currency: Currency }[] = [
  { code: "FR", label: "France", currency: "EUR" },
  { code: "EN", label: "Angleterre", currency: "EUR" },
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
  const [productCode, setProductCode] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [
    deliveryPackageCount,
    setDeliveryPackageCount,
  ] = useState("1");
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
    setProductCode(String(product.productCode || ""));
    setWeightKg(String(product.weightKg ?? ""));
    setDeliveryPackageCount(
      String(product.deliveryPackageCount ?? 1)
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
              productCode: String(vv.productCode || ""),
              label: String(vv.label || ""),
              description: String(vv.description || ""),
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
              productCode: String(aa.productCode || ""),
              label: String(aa.label || ""),
              description: String(aa.description || ""),
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
          productCode,
          imageUrl: imageUrl || null,
          weightKg,
          deliveryPackageCount,
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
              productCode: v.productCode,
              label: v.label,
              description: v.description,
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
              productCode: a.productCode,
              label: a.label,
              description: a.description,
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
      <div className="pf-form-head">
        <div>
          <h2 className="admin-section-title">Contenu produit</h2>
          <p className="pf-form-note">
            Modifiez les textes, prix, variantes et options par pays.
          </p>
        </div>
      </div>

      {/* LANG */}
      <div className="admin-lang-tabs">
        {LANGS.map((l) => {
          const meta = LANG_META[l];

          return (
            <button
              key={l}
              type="button"
              className={activeLang === l ? "active" : ""}
              onClick={() => setActiveLang(l)}
            >
              <span className="pf-lang-flag">
                {meta.flag}
              </span>

              <span className="pf-lang-content">
                <span className="pf-lang-label">
                  {meta.label}
                </span>

                <span className="pf-lang-code">
                  {meta.code}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <section className="pf-card pf-card-compact">
        <div className="pf-field-grid">
          <div className="pf-field">
            <label className="admin-label">Nom</label>
            <input
              className="admin-input"
              value={name[activeLang]}
              onChange={(e) =>
                setName((p) => ({ ...p, [activeLang]: e.target.value }))
              }
            />
          </div>

          <div className="pf-field">
            <label className="admin-label">Image URL</label>
            <input
              className="admin-input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="pf-field">
            <label className="admin-label">Code produit</label>
            <input
              className="admin-input"
              placeholder="LM000202"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
            />
          </div>

          <div className="pf-field pf-field-wide">
            <label className="admin-label">Description</label>
            <textarea
              className="admin-textarea"
              rows={4}
              value={description[activeLang]}
              onChange={(e) =>
                setDescription((p) => ({ ...p, [activeLang]: e.target.value }))
              }
            />
          </div>

          <div className="pf-field">
            <label className="admin-label">
              Poids unitaire (kg)
            </label>
            <input
              type="number"
              step="0.01"
              className="admin-input"
              value={weightKg}
              onChange={(e) =>
                setWeightKg(e.target.value)
              }
            />
          </div>

          <div className="pf-field">
            <label className="admin-label">
              Colis par unité
            </label>
            <input
              type="number"
              min="1"
              step="1"
              className="admin-input"
              value={deliveryPackageCount}
              onChange={(e) =>
                setDeliveryPackageCount(
                  e.target.value
                )
              }
            />
          </div>

        </div>
      </section>

      {/* VARIANTES */}
      <section className="pf-card">
        <h3>Variantes</h3>

        {variants.length === 0 && (
          <p className="pf-help">
            Exemple : Blanc [Fibres de bambou], Rouge [Simili cuir], etc.
          </p>
        )}

        <div className="pf-variants-list">
          {variants.map((v, idx) => (
            <div key={idx} className="pf-variant-block">
              <div className="pf-option-head">
                <label className="pf-option-field compact">
                  <span>ID interne</span>
                  <input
                    className="admin-input pf-variant-id"
                    placeholder="bambou"
                    value={v.id}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx] = { ...copy[idx], id: e.target.value };
                      setVariants(copy);
                    }}
                  />
                </label>

                <label className="pf-option-field compact">
                  <span>Code produit</span>
                  <input
                    className="admin-input"
                    placeholder="LM000202"
                    value={v.productCode}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx] = {
                        ...copy[idx],
                        productCode: e.target.value,
                      };
                      setVariants(copy);
                    }}
                  />
                </label>

                <label className="pf-option-field">
                  <span>Nom affiché sur la boutique</span>
                  <input
                    className="admin-input pf-variant-label"
                    placeholder="Housse bambou"
                    value={v.label}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx] = { ...copy[idx], label: e.target.value };
                      setVariants(copy);
                    }}
                  />
                </label>

                <label className="pf-option-field">
                  <span>Image de la variante</span>
                  <input
                    className="admin-input pf-variant-image"
                    placeholder="https://..."
                    value={v.imageUrl}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx] = { ...copy[idx], imageUrl: e.target.value };
                      setVariants(copy);
                    }}
                  />
                </label>

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

              <label className="pf-option-field pf-option-description">
                <span>Description affichée sur la boutique</span>
                <textarea
                  className="admin-textarea"
                  rows={2}
                  placeholder="Texte court pour expliquer cette variante au client."
                  value={v.description}
                  onChange={(e) => {
                    const copy = [...variants];
                    copy[idx] = { ...copy[idx], description: e.target.value };
                    setVariants(copy);
                  }}
                />
              </label>

              <div className="pf-table pf-table-variant">
                <div className="pf-row pf-head">
                  <span>Pays</span>
                  <span>Actif</span>
                  <span>Prix HT</span>
                  <span>TVA</span>
                  <span>Taux %</span>
                  <span>Prix TTC</span>
                  <span>Devise</span>
                </div>

                {(activeMarket
                  ? MARKETS.filter((m) => m.code === activeMarket)
                  : MARKETS
                ).map((m) => {
                  const active = v.markets.includes(m.code);
                  const vat = v.vatByMarket[m.code];
                  const priceHT = toNumber(v.pricesByMarket[m.code]);
                  const vatRate = vat?.enabled ? toNumber(vat.rate) : 0;
                  const priceTTC = priceHT + (priceHT * vatRate) / 100;

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

                      <strong>
                        {active && priceHT
                          ? priceTTC.toFixed(2).replace(".", ",")
                          : "—"}
                      </strong>

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
                description: "",
                imageUrl: "",
                markets: [],
                pricesByMarket: {} as any,
                vatByMarket: {} as any,
                productCode: "",
              },
            ])
          }
        >
          + Ajouter une variante
        </button>
      </section>

      {/* OPTIONS / HOUSSES */}
      <section className="pf-card">
        <h3>Options / Housses</h3>

        {addons.length === 0 && (
          <p className="pf-help">
            Exemple : “Housse supplémentaire bambou”, “Housse simili‑cuir”, etc.
          </p>
        )}

        <div className="pf-addons-list">
          {addons.map((a, idx) => (
            <div key={idx} className="pf-addon-block">
              <div className="pf-option-head">
                <label className="pf-option-field compact">
                  <span>ID interne</span>
                  <input
                    className="admin-input pf-addon-id"
                    placeholder="housse-bambou"
                    value={a.id}
                    onChange={(e) => {
                      const copy = [...addons];
                      copy[idx] = { ...copy[idx], id: e.target.value };
                      setAddons(copy);
                    }}
                  />
                </label>

                <label className="pf-option-field compact">
                  <span>Code housse</span>
                  <input
                    className="admin-input"
                    placeholder="LM020001"
                    value={a.productCode}
                    onChange={(e) => {
                      const copy = [...addons];
                      copy[idx] = {
                        ...copy[idx],
                        productCode: e.target.value,
                      };
                      setAddons(copy);
                    }}
                  />
                </label>

                <label className="pf-option-field">
                  <span>Nom affiché sur la boutique</span>
                  <input
                    className="admin-input pf-addon-label"
                    placeholder="Housse en fibres de bambou"
                    value={a.label}
                    onChange={(e) => {
                      const copy = [...addons];
                      copy[idx] = { ...copy[idx], label: e.target.value };
                      setAddons(copy);
                    }}
                  />
                </label>

                <label className="pf-option-field">
                  <span>Image de l’option</span>
                  <input
                    className="admin-input pf-addon-image"
                    placeholder="https://..."
                    value={a.imageUrl}
                    onChange={(e) => {
                      const copy = [...addons];
                      copy[idx] = { ...copy[idx], imageUrl: e.target.value };
                      setAddons(copy);
                    }}
                  />
                </label>

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

              <label className="pf-option-field pf-option-description">
                <span>Description affichée sur la boutique</span>
                <textarea
                  className="admin-textarea"
                  rows={2}
                  placeholder="Texte court pour expliquer cette option au client."
                  value={a.description}
                  onChange={(e) => {
                    const copy = [...addons];
                    copy[idx] = { ...copy[idx], description: e.target.value };
                    setAddons(copy);
                  }}
                />
              </label>

              <div className="pf-table pf-table-addon">
                <div className="pf-row pf-head">
                  <span>Pays</span>
                  <span>Actif</span>
                  <span>Prix HT</span>
                  <span>TVA</span>
                  <span>Taux %</span>
                  <span>Prix TTC</span>
                  <span>Devise</span>
                </div>

                {(activeMarket
                  ? MARKETS.filter((m) => m.code === activeMarket)
                  : MARKETS
                ).map((m) => {
                  const active = a.markets.includes(m.code);
                  const vat = a.vatByMarket[m.code];
                  const priceHT = toNumber(a.pricesByMarket[m.code]);
                  const vatRate = vat?.enabled ? toNumber(vat.rate) : 0;
                  const priceTTC = priceHT + (priceHT * vatRate) / 100;

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

                      <strong>
                        {active && priceHT
                          ? priceTTC.toFixed(2).replace(".", ",")
                          : "—"}
                      </strong>

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
                description: "",
                imageUrl: "",
                markets: [],
                pricesByMarket: {} as any,
                vatByMarket: {} as any,
                productCode: "",
              },
            ])
          }
        >
          + Ajouter une option / housse
        </button>
      </section>

      {/* PRIX + TVA PRODUIT */}
      <section className="pf-card">
        <h3>Prix & TVA par pays</h3>

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
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
