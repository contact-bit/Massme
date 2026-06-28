"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@/app/admin/styles/product-form.css";

/* =====================================================
   TYPES
===================================================== */
type Lang = "fr" | "en" | "es" | "de" | "it" | "nl";
type Market =
  | "FR"
  | "EN"
  | "BE"
  | "DE"
  | "AT"
  | "ES"
  | "IT"
  | "NL"
  | "CH";
type Currency = "EUR" | "CHF";

type VatConfig = {
  enabled: boolean;
  rate: string;
};

type MarketSettings = Record<
  Market,
  {
    isActive: boolean;
  }
>;

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
const LANGS: Lang[] = ["fr", "en", "es", "de", "it", "nl"];

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
  { code: "CH", label: "Suisse", currency: "CHF" },
];

const MARKET_BY_LANG: Partial<Record<Lang, Market>> = {
  fr: "FR",
  en: "EN",
  es: "ES",
  de: "DE",
  it: "IT",
  nl: "NL",
};

const emptyLangRecord = (): Record<Lang, string> =>
  Object.fromEntries(LANGS.map((l) => [l, ""])) as Record<Lang, string>;

const toNumber = (v: unknown) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

function ToggleButton({
  active,
  disabled = false,
  onToggle,
  activeLabel = "Activé",
  inactiveLabel = "Désactivé",
}: {
  active: boolean;
  disabled?: boolean;
  onToggle: () => void;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <button
      type="button"
      className={`pf-toggle-button ${active ? "is-active" : ""}`}
      disabled={disabled}
      onClick={onToggle}
    >
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}

/* =====================================================
   COMPONENT
===================================================== */
export default function ProductEditForm({
  product,
  onClose,
  onUpdated,
  onDirtyChange,
}: {
  product: any;
  onClose: () => void;
  onUpdated: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}) {
  const [activeLang, setActiveLang] = useState<Lang>("fr");
  const activeMarket: Market | null = MARKET_BY_LANG[activeLang] || null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [productCode, setProductCode] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [
    deliveryPackageCount,
    setDeliveryPackageCount,
  ] = useState("1");
  const [name, setName] = useState<Record<Lang, string>>(emptyLangRecord);
  const [description, setDescription] =
    useState<Record<Lang, string>>(emptyLangRecord);

  const [markets, setMarkets] = useState<Market[]>([]);
  const [pricesByMarket, setPricesByMarket] =
    useState<Record<Market, string>>({} as any);
  const [vatByMarket, setVatByMarket] = useState<
    Record<Market, VatConfig>
  >({} as any);
  const [marketSettings, setMarketSettings] =
    useState<MarketSettings>({} as any);

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [addons, setAddons] = useState<ProductAddon[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const initialSnapshot = useRef<string | null>(null);
  const allowNavigation = useRef(false);

  const formSnapshot = useMemo(
    () =>
      JSON.stringify({
        imageUrl,
        productCode,
        weightKg,
        deliveryPackageCount,
        name,
        description,
        markets,
        marketSettings,
        pricesByMarket,
        vatByMarket,
        variants,
        addons,
      }),
    [
      imageUrl,
      productCode,
      weightKg,
      deliveryPackageCount,
      name,
      description,
      markets,
      marketSettings,
      pricesByMarket,
      vatByMarket,
      variants,
      addons,
    ]
  );

  const isDirty =
    isInitialized &&
    initialSnapshot.current !== null &&
    formSnapshot !== initialSnapshot.current;

  const confirmLeave = useCallback(
    () =>
      !isDirty ||
      window.confirm(
        "Des modifications ne sont pas enregistrées. Pour les conserver, saisissez le mot de passe admin puis cliquez sur Enregistrer en bas de page. Quitter quand même ?"
      ),
    [isDirty]
  );

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (!product) return;

    setIsInitialized(false);
    initialSnapshot.current = null;

    setImageUrl(product.imageUrl || "");
    setProductCode(String(product.productCode || ""));
    setWeightKg(String(product.weightKg ?? ""));
    setDeliveryPackageCount(
      String(product.deliveryPackageCount ?? 1)
    );
    setName({ ...emptyLangRecord(), ...(product.name || {}) });
    setDescription({ ...emptyLangRecord(), ...(product.description || {}) });

    const m: Market[] = product.markets ?? ["FR"];
    setMarkets(m);

    const p: any = {};
    const v: any = {};
    const settings: any = {};

    MARKETS.forEach(({ code }) => {
      p[code] = String(product.pricesByMarket?.[code] ?? "");
      v[code] = {
        enabled: product.vatByMarket?.[code]?.enabled ?? false,
        rate: String(product.vatByMarket?.[code]?.rate ?? ""),
      };
      settings[code] = {
        isActive: product.marketSettings?.[code]?.isActive !== false,
      };
    });

    setPricesByMarket(p);
    setVatByMarket(v);
    setMarketSettings(settings);

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

    setIsInitialized(true);
  }, [product]);

  useEffect(() => {
    if (isInitialized && initialSnapshot.current === null) {
      initialSnapshot.current = formSnapshot;
    }
  }, [formSnapshot, isInitialized]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || allowNavigation.current) return;
      event.preventDefault();
      event.returnValue = "";
    };

    const handleLinkClick = (event: MouseEvent) => {
      if (!isDirty || allowNavigation.current) return;

      const target = event.target as HTMLElement | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (!link || link.target === "_blank" || link.href === window.location.href) {
        return;
      }

      if (!confirmLeave()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        allowNavigation.current = true;
      }
    };

    const handlePopState = () => {
      if (!isDirty || allowNavigation.current) return;

      if (confirmLeave()) {
        allowNavigation.current = true;
      } else {
        window.history.forward();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleLinkClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [confirmLeave, isDirty]);

  /* ---------------- SAVE ---------------- */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
          markets,
          marketSettings: Object.fromEntries(
            markets.map((m) => [
              m,
              {
                isActive: marketSettings[m]?.isActive !== false,
              },
            ])
          ),
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
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      allowNavigation.current = true;
      initialSnapshot.current = formSnapshot;
      onDirtyChange?.(false);
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
        <div className="pf-content-editor">
          <div className="pf-content-fields">
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
              <label className="admin-label">Description</label>
              <textarea
                className="admin-textarea"
                rows={6}
                value={description[activeLang]}
                onChange={(e) =>
                  setDescription((p) => ({
                    ...p,
                    [activeLang]: e.target.value,
                  }))
                }
              />
            </div>

            <div className="pf-content-fields-row">
              <div className="pf-field">
                <label className="admin-label">Référence interne</label>
                <input
                  className="admin-input"
                  placeholder="Ex : SKU-001"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                />
              </div>

              <div className="pf-field">
                <label className="admin-label">Image URL</label>
                <input
                  className="admin-input"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          <aside className="pf-content-preview">
            <div className="pf-content-preview-label">
              Aperçu
              <span>{LANG_META[activeLang].code}</span>
            </div>

            <div className="pf-content-preview-image">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                />
              ) : (
                <span>Image produit</span>
              )}
            </div>

            <div className="pf-content-preview-body">
              {productCode && (
                <span className="pf-content-preview-code">
                  {productCode}
                </span>
              )}

              <h3>
                {name[activeLang] || "Titre du produit"}
              </h3>

              <p>
                {description[activeLang] ||
                  "La description du produit apparaîtra ici."}
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* VARIANTES */}
      <details className="pf-card pf-collapsible">
        <summary className="pf-collapsible-summary">
          <span>
            <strong>Variantes</strong>
            <small>Tailles, couleurs ou autres déclinaisons</small>
          </span>
          <span className="pf-collapsible-count">{variants.length}</span>
        </summary>

        <div className="pf-collapsible-content">
          {variants.length === 0 && (
            <p className="pf-help">
              Ajoutez uniquement les déclinaisons réellement proposées.
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
                    placeholder="Ex : bleu"
                    value={v.id}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx] = { ...copy[idx], id: e.target.value };
                      setVariants(copy);
                    }}
                  />
                </label>

                <label className="pf-option-field compact">
                  <span>Référence interne</span>
                  <input
                    className="admin-input"
                    placeholder="Ex : SKU-001-BLEU"
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
                    placeholder="Ex : Bleu"
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
                  <span>Vente</span>
                  <span>Prix hors taxe</span>
                  <span>Taxe</span>
                  <span>TVA</span>
                  <span>Prix client</span>
                  <span>Monnaie</span>
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

                      <ToggleButton
                        active={active}
                        activeLabel="En vente"
                        inactiveLabel="Masqué"
                        onToggle={() => {
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

                      <ToggleButton
                        disabled={!active}
                        active={vat?.enabled ?? false}
                        activeLabel="Avec TVA"
                        inactiveLabel="Sans TVA"
                        onToggle={() => {
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
                                enabled: !(vat?.enabled ?? false),
                              },
                            },
                          };
                          setVariants(copy);
                        }}
                      />

                      <div className="pf-percent-input">
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
                        <span>%</span>
                      </div>

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
        </div>
      </details>

      {/* COMPLEMENTARY PRODUCTS */}
      <details className="pf-card pf-collapsible">
        <summary className="pf-collapsible-summary">
          <span>
            <strong>Produits complémentaires</strong>
            <small>Options proposées avec ce produit</small>
          </span>
          <span className="pf-collapsible-count">{addons.length}</span>
        </summary>

        <div className="pf-collapsible-content">
          {addons.length === 0 && (
            <p className="pf-help">
              Ajoutez un produit complémentaire seulement si nécessaire.
            </p>
          )}

          <div className="pf-addons-list">
            {addons.map((a, idx) => (
              <div key={idx} className="pf-addon-block">
              <div className="pf-addon-toolbar">
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

              <div className="pf-addon-editor">
                <div className="pf-addon-fields">
                  <label className="pf-option-field">
                    <span>Nom affiché sur la boutique</span>
                    <input
                      className="admin-input pf-addon-label"
                      placeholder="Ex : Accessoire complémentaire"
                      value={a.label}
                      onChange={(e) => {
                        const copy = [...addons];
                        copy[idx] = { ...copy[idx], label: e.target.value };
                        setAddons(copy);
                      }}
                    />
                  </label>

                  <label className="pf-option-field">
                    <span>Description affichée sur la boutique</span>
                    <textarea
                      className="admin-textarea"
                      rows={6}
                      placeholder="Texte court pour expliquer cette option au client."
                      value={a.description}
                      onChange={(e) => {
                        const copy = [...addons];
                        copy[idx] = { ...copy[idx], description: e.target.value };
                        setAddons(copy);
                      }}
                    />
                  </label>

                  <div className="pf-addon-fields-row">
                    <label className="pf-option-field">
                      <span>ID interne</span>
                      <input
                        className="admin-input pf-addon-id"
                        placeholder="Ex : accessoire-01"
                        value={a.id}
                        onChange={(e) => {
                          const copy = [...addons];
                          copy[idx] = { ...copy[idx], id: e.target.value };
                          setAddons(copy);
                        }}
                      />
                    </label>

                    <label className="pf-option-field">
                      <span>Référence interne</span>
                      <input
                        className="admin-input"
                        placeholder="Ex : SKU-ACC-001"
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
                  </div>
                </div>

                <aside className="pf-addon-checkout-preview">
                  <div className="pf-addon-checkout-preview-label">
                    Simulation checkout
                  </div>

                  <div className="pf-addon-checkout-module">
                    <div className="pf-addon-checkout-kicker">
                      Complétez votre commande
                    </div>

                    <div className="pf-addon-checkout-product">
                      <div className="pf-addon-checkout-image">
                        {a.imageUrl ? (
                          <img
                            src={a.imageUrl}
                            alt=""
                          />
                        ) : (
                          <span>Image</span>
                        )}
                      </div>

                      <div className="pf-addon-checkout-copy">
                        <h3>
                          {a.label || "Produit complémentaire"}
                        </h3>
                        <p>
                          {a.description ||
                            "Une suggestion utile à ajouter à la commande."}
                        </p>
                      </div>
                    </div>

                    <div className="pf-addon-checkout-action">
                      <span>
                        {(() => {
                          const market = activeMarket || "FR";
                          const priceHT = toNumber(a.pricesByMarket[market]);
                          const vat = a.vatByMarket[market];
                          const vatRate = vat?.enabled ? toNumber(vat.rate) : 0;
                          const priceTTC = priceHT + (priceHT * vatRate) / 100;

                          return priceHT
                            ? `${priceTTC.toFixed(2).replace(".", ",")} € TTC`
                            : "Prix TTC à définir";
                        })()}
                      </span>
                      <button type="button">
                        + Ajouter à ma commande
                      </button>
                    </div>
                  </div>
                </aside>
              </div>

              <div className="pf-table pf-table-addon">
                <div className="pf-row pf-head">
                  <span>Pays</span>
                  <span>Vente</span>
                  <span>Prix hors taxe</span>
                  <span>Taxe</span>
                  <span>TVA</span>
                  <span>Prix client</span>
                  <span>Monnaie</span>
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

                      <ToggleButton
                        active={active}
                        activeLabel="En vente"
                        inactiveLabel="Masqué"
                        onToggle={() => {
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

                      <ToggleButton
                        disabled={!active}
                        active={vat?.enabled ?? false}
                        activeLabel="Avec TVA"
                        inactiveLabel="Sans TVA"
                        onToggle={() => {
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
                                enabled: !(vat?.enabled ?? false),
                              },
                            },
                          };
                          setAddons(copy);
                        }}
                      />

                      <div className="pf-percent-input">
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
                        <span>%</span>
                      </div>

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
            + Ajouter un produit complémentaire
          </button>
        </div>
      </details>

      {/* PRIX + TVA PRODUIT */}
      <section className="pf-card">
        <h3>Prix & TVA par pays</h3>

        <div className="pf-shipping-summary">
          <span className="pf-shipping-summary-title">
            Expédition
          </span>

          <label className="pf-shipping-summary-field">
            <span>Poids</span>
            <input
              type="number"
              step="0.01"
              className="admin-input"
              placeholder="1,20"
              value={weightKg}
              onChange={(e) =>
                setWeightKg(e.target.value)
              }
            />
            <small>kg</small>
          </label>

          <label className="pf-shipping-summary-field">
            <span>Colis</span>
            <input
              type="number"
              min="1"
              step="1"
              className="admin-input"
              placeholder="1"
              value={deliveryPackageCount}
              onChange={(e) =>
                setDeliveryPackageCount(
                  e.target.value
                )
              }
            />
            <small>par unité</small>
          </label>
        </div>

        <div className="pf-table">
          <div className="pf-row pf-head">
            <span>Pays</span>
            <span>Configuré</span>
            <span>Visible</span>
            <span>Prix hors taxe</span>
            <span>Taxe</span>
            <span>TVA</span>
            <span>Monnaie</span>
          </div>

          {(activeMarket
            ? MARKETS.filter((m) => m.code === activeMarket)
            : MARKETS
          ).map((m) => {
            const active = markets.includes(m.code);
            const vat = vatByMarket[m.code];
            const marketActive =
              marketSettings[m.code]?.isActive !== false;

            return (
              <div key={m.code} className="pf-row">
                <span>
                  <strong>{m.code}</strong> {m.label}
                </span>

                <ToggleButton
                  active={active}
                  activeLabel="En vente"
                  inactiveLabel="Non vendu"
                  onToggle={() =>
                    setMarkets((p) =>
                      active ? p.filter((x) => x !== m.code) : [...p, m.code]
                    )
                  }
                />

                <ToggleButton
                  disabled={!active}
                  active={active && marketActive}
                  activeLabel="Visible"
                  inactiveLabel="Masqué"
                  onToggle={() =>
                    setMarketSettings((p) => ({
                      ...p,
                      [m.code]: {
                        ...(p[m.code] || {
                          isActive: true,
                        }),
                        isActive: !marketActive,
                      },
                    }))
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

                <ToggleButton
                  disabled={!active}
                  active={vat?.enabled ?? false}
                  activeLabel="Avec TVA"
                  inactiveLabel="Sans TVA"
                  onToggle={() =>
                    setVatByMarket((p) => ({
                      ...p,
                      [m.code]: {
                        ...p[m.code],
                        enabled: !(vat?.enabled ?? false),
                      },
                    }))
                  }
                />

                <div className="pf-percent-input">
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
                  <span>%</span>
                </div>

                <span>{m.currency}</span>
              </div>
            );
          })}
        </div>
      </section>

      {error && <p className="admin-error">{error}</p>}

      <div className="pf-save-bar">
        <div className="pf-save-controls">
          <div className="admin-form-actions pf-final-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                if (!confirmLeave()) return;
                allowNavigation.current = true;
                onClose();
              }}
            >
              Annuler
            </button>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
