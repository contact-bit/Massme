"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import DashboardOrdersSearch from "./DashboardOrdersSearch";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";

type StatsResponse = {
  kpis: {
    productsCount: number;
    activeProducts: number;

    paymentMethodsCount: number;
    activePaymentMethods: number;
    shippingMethodsCount: number;
    adminCountriesCount: number;
    reviewsCount: number;
    approvedReviews: number;
    pendingReviews: number;

    ordersCount: number;
    paidOrdersCount: number;
    pendingCount: number;

    toPrepareCount: number;
    shippedCount: number;

    revenueLast7: number;
    revenuePrev7: number;

    revenueToday: number;
    revenueYesterday: number;

    aov: number;
  };

  deltas: {
    revenue7dPct: number;
    revenueDayPct: number;
  };

  series: {
    day: string;
    revenue: number;
  }[];

  lastOrders: {
    id: string;
    orderNumber?: string;
    status: string;
    total: number;
    email: string;
    createdAt: string | null;
  }[];

  lowStock: {
    id: string;
    name: string;
    stock: number;
  }[];

  alerts: {
    tone: "info" | "warn" | "danger";
    title: string;
    desc: string;
  }[];
};

/* =========================================================
   HELPERS
========================================================= */

function eur(n?: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n ?? 0);
}

function shortDate(iso: string | null) {
  if (!iso) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

type WidgetSize =
  | "small"
  | "medium"
  | "large";

type WidgetTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "highlight";

type WidgetConfig = {
  id: string;
  size: WidgetSize;
  tone: WidgetTone;
  visible: boolean;
};

type WidgetDefinition = {
  id: string;
  label: string;
  value: string | number;
  foot: string;
  href?: string;
  defaultTone: WidgetTone;
  defaultSize: WidgetSize;
  kind?:
    | "kpi"
    | "chart"
    | "lastOrders"
    | "lowStock"
    | "search";
};

function widgetClass(
  config: WidgetConfig
) {
  return [
    "dash-card",
    `tone-${config.tone}`,
    `size-${config.size}`,
  ].join(" ");
}

function normalizeLayout(
  value: unknown,
  definitions: WidgetDefinition[]
): WidgetConfig[] {
  const byId = new Map(
    definitions.map((d) => [d.id, d])
  );

  const incoming = Array.isArray(value)
    ? value
    : [];

  const seen = new Set<string>();

  const parsed = incoming
    .map((item: any) => {
      const def = byId.get(
        String(item?.id || "")
      );

      if (!def || seen.has(def.id)) {
        return null;
      }

      seen.add(def.id);

      const size: WidgetSize =
        item?.size === "medium" ||
        item?.size === "large" ||
        item?.size === "small"
          ? item.size
          : def.defaultSize;

      const tone: WidgetTone =
        item?.tone === "primary" ||
        item?.tone === "success" ||
        item?.tone === "warning" ||
        item?.tone === "danger" ||
        item?.tone === "highlight" ||
        item?.tone === "neutral"
          ? item.tone
          : def.defaultTone;

      return {
        id: def.id,
        size,
        tone,
        visible:
          item?.visible === false
            ? false
            : true,
      };
    })
    .filter(Boolean) as WidgetConfig[];

  for (const def of definitions) {
    if (!seen.has(def.id)) {
      parsed.push({
        id: def.id,
        size: def.defaultSize,
        tone: def.defaultTone,
        visible: true,
      });
    }
  }

  return parsed;
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminDashboardPage() {
  const [data, setData] =
    useState<StatsResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [err, setErr] =
    useState<string | null>(null);

  const [
    editDashboard,
    setEditDashboard,
  ] = useState(false);

  const [
    dashboardWidgets,
    setDashboardWidgets,
  ] = useState<WidgetConfig[]>([]);

  const [
    draggedWidget,
    setDraggedWidget,
  ] = useState<string | null>(null);

  const [
    savingDashboard,
    setSavingDashboard,
  ] = useState(false);

  /* ================= FETCH ================= */

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch(
        "/api/admin/stats",
        {
          cache: "no-store",
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json?.error || "Erreur API"
        );
      }

      setData(json);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const res = await fetch(
          "/api/admin/settings/dashboard",
          {
            cache: "no-store",
          }
        );

        const json = await res.json();

        if (
          !cancelled &&
          res.ok &&
          json?.ok
        ) {
          setDashboardWidgets(
            json.widgets || []
          );
        }
      } catch {
        if (!cancelled) {
          setDashboardWidgets([]);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const widgetDefinitions =
    useMemo<WidgetDefinition[]>(() => {
      const k = data?.kpis;

      return [
        {
          id: "orders",
          label: "Commandes",
          value: k?.ordersCount ?? 0,
          foot: "Total des commandes",
          href: "/admin/orders",
          defaultTone: "primary",
          defaultSize: "small",
        },
        {
          id: "paid",
          label: "Payées",
          value: k?.paidOrdersCount ?? 0,
          foot: "Commandes validées",
          defaultTone: "success",
          defaultSize: "small",
        },
        {
          id: "pending",
          label: "En attente",
          value: k?.pendingCount ?? 0,
          foot: "Paiement non validé",
          defaultTone: "warning",
          defaultSize: "small",
        },
        {
          id: "prepare",
          label: "À préparer",
          value: k?.toPrepareCount ?? 0,
          foot: "Commandes à expédier",
          defaultTone: "warning",
          defaultSize: "small",
        },
        {
          id: "shipped",
          label: "Expédiées",
          value: k?.shippedCount ?? 0,
          foot: "Déjà envoyées",
          defaultTone: "success",
          defaultSize: "small",
        },
        {
          id: "revenue7",
          label: "CA 7 jours",
          value: eur(k?.revenueLast7),
          foot: "7 derniers jours",
          defaultTone: "highlight",
          defaultSize: "medium",
        },
        {
          id: "today",
          label: "Aujourd’hui",
          value: eur(k?.revenueToday),
          foot: "Revenus du jour",
          defaultTone: "neutral",
          defaultSize: "small",
        },
        {
          id: "yesterday",
          label: "Hier",
          value: eur(k?.revenueYesterday),
          foot: "Revenus de la veille",
          defaultTone: "neutral",
          defaultSize: "small",
        },
        {
          id: "aov",
          label: "Panier moyen",
          value: eur(k?.aov),
          foot: "Moyenne par commande",
          defaultTone: "neutral",
          defaultSize: "small",
        },
        {
          id: "products",
          label: "Produits",
          value: k?.productsCount ?? 0,
          foot: `${k?.activeProducts ?? 0} actifs`,
          defaultTone: "neutral",
          defaultSize: "small",
        },
        {
          id: "payments",
          label: "Paiement",
          value: k?.paymentMethodsCount ?? 0,
          foot: "Méthodes configurées",
          href: "/admin/payment-methods",
          defaultTone: "neutral",
          defaultSize: "small",
        },
        {
          id: "paymentsActive",
          label: "Paiements actifs",
          value: k?.activePaymentMethods ?? 0,
          foot: "Méthodes activées",
          defaultTone: "success",
          defaultSize: "small",
        },
        {
          id: "shipping",
          label: "Livraison",
          value: k?.shippingMethodsCount ?? 0,
          foot: "Méthodes configurées",
          href: "/admin/shipping",
          defaultTone: "neutral",
          defaultSize: "small",
        },
        {
          id: "countries",
          label: "Pays",
          value: k?.adminCountriesCount ?? 0,
          foot: "Pays configurés",
          defaultTone: "neutral",
          defaultSize: "small",
        },
        {
          id: "reviews",
          label: "Avis",
          value: k?.reviewsCount ?? 0,
          foot: "Avis clients",
          href: "/admin/reviews",
          defaultTone: "neutral",
          defaultSize: "small",
        },
        {
          id: "reviewsApproved",
          label: "Publiés",
          value: k?.approvedReviews ?? 0,
          foot: "Avis visibles",
          defaultTone: "success",
          defaultSize: "small",
        },
        {
          id: "reviewsPending",
          label: "Avis en attente",
          value: k?.pendingReviews ?? 0,
          foot: "À modérer",
          defaultTone: "warning",
          defaultSize: "small",
        },
        {
          id: "ordersSearch",
          label: "Recherche commandes",
          value: "",
          foot: "",
          defaultTone: "neutral",
          defaultSize: "large",
          kind: "search",
        },
        {
          id: "revenueChart",
          label: "Revenus",
          value: "",
          foot: "",
          defaultTone: "highlight",
          defaultSize: "large",
          kind: "chart",
        },
        {
          id: "lastOrders",
          label: "Dernières commandes",
          value: "",
          foot: "",
          defaultTone: "neutral",
          defaultSize: "medium",
          kind: "lastOrders",
        },
        {
          id: "lowStock",
          label: "Stocks faibles",
          value: "",
          foot: "",
          defaultTone: "warning",
          defaultSize: "medium",
          kind: "lowStock",
        },
      ];
    }, [data]);

  const widgetLayout = useMemo(
    () =>
      normalizeLayout(
        dashboardWidgets,
        widgetDefinitions
      ),
    [dashboardWidgets, widgetDefinitions]
  );

  const widgetDefinitionById = useMemo(
    () =>
      new Map(
        widgetDefinitions.map((w) => [
          w.id,
          w,
        ])
      ),
    [widgetDefinitions]
  );

  function updateWidget(
    id: string,
    patch: Partial<WidgetConfig>
  ) {
    setDashboardWidgets((prev) =>
      normalizeLayout(
        prev,
        widgetDefinitions
      ).map((w) =>
        w.id === id
          ? {
              ...w,
              ...patch,
            }
          : w
      )
    );
  }

  function moveWidget(
    targetId: string,
    sourceId = draggedWidget
  ) {
    if (
      !sourceId ||
      sourceId === targetId
    ) {
      setDraggedWidget(null);
      return;
    }

    const current = [...widgetLayout];
    const from = current.findIndex(
      (w) => w.id === sourceId
    );
    const to = current.findIndex(
      (w) => w.id === targetId
    );

    if (from < 0 || to < 0) {
      setDraggedWidget(null);
      return;
    }

    const [moved] = current.splice(
      from,
      1
    );

    current.splice(to, 0, moved);

      setDashboardWidgets(current);
    setDraggedWidget(null);
  }

  const visibleWidgets =
    widgetLayout.filter(
      (w) => w.visible
    );

  const hiddenWidgets =
    widgetLayout.filter(
      (w) => !w.visible
    );

  async function saveDashboard() {
    setSavingDashboard(true);

    try {
      const payload = normalizeLayout(
        dashboardWidgets,
        widgetDefinitions
      );

      const res = await fetch(
        "/api/admin/settings/dashboard",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            widgets: payload,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(
          json?.message ||
            "Erreur sauvegarde"
        );
      }

      setDashboardWidgets(
        json.widgets || payload
      );
      setEditDashboard(false);
    } finally {
      setSavingDashboard(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="admin-page">
        <div className="dash-head">
          <div>
            <h1 className="admin-page-title">
              Dashboard
            </h1>

            <p className="dash-sub">
              Chargement des statistiques...
            </p>
          </div>
        </div>

        <div className="dash-skeleton-grid">
          <div className="dash-skel" />
          <div className="dash-skel" />
          <div className="dash-skel" />
          <div className="dash-skel" />
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (err || !data) {
    return (
      <div className="admin-page">
        <div className="dash-head">
          <div>
            <h1 className="admin-page-title">
              Dashboard
            </h1>
          </div>
        </div>

        <div className="dash-error">
          <div className="dash-error-title">
            {err}
          </div>

          <button
            className="btn-secondary"
            onClick={refresh}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const {
    kpis: k,
    alerts,
    lastOrders,
    lowStock,
    series,
  } = data;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="admin-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="dash-head">
        <div>
          <h1 className="admin-page-title">
            Dashboard
          </h1>

          <p className="dash-sub">
            Vue globale de l’activité
          </p>
        </div>

        <div className="dash-actions">
          <button
            className="btn-secondary"
            onClick={refresh}
          >
            Actualiser
          </button>

          <button
            className="btn-secondary"
            onClick={() =>
              setEditDashboard(
                (v) => !v
              )
            }
          >
            {editDashboard
              ? "Terminer"
              : "Personnaliser"}
          </button>

          {editDashboard && (
            <button
              className="btn-primary"
              onClick={saveDashboard}
              disabled={savingDashboard}
            >
              {savingDashboard
                ? "Sauvegarde..."
                : "Enregistrer"}
            </button>
          )}

          <a
            className="btn-primary"
            href="/admin/orders"
          >
            Commandes
          </a>
        </div>
      </div>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {alerts.length > 0 && (
        <div className="dash-alerts">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`dash-alert tone-${a.tone}`}
            >
              <div className="dash-alert-title">
                {a.title}
              </div>

              <div className="dash-alert-desc">
                {a.desc}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================
          KPI
      ===================================================== */}

      <div
        className={`dash-kpis ${
          editDashboard ? "is-editing" : ""
        }`}
      >
        {visibleWidgets.map((config) => {
          const def =
            widgetDefinitionById.get(
              config.id
            );

          if (!def) {
            return null;
          }

          const isKpi =
            !def.kind ||
            def.kind === "kpi";

          return (
            <div
              key={config.id}
              className={
                isKpi
                  ? widgetClass(config)
                  : [
                      "dash-panel",
                      "dash-widget-panel",
                      `tone-${config.tone}`,
                      `size-${config.size}`,
                    ].join(" ")
              }
              draggable={editDashboard}
              onDragStart={(e) => {
                if (!editDashboard) {
                  return;
                }

                e.dataTransfer.effectAllowed =
                  "move";
                e.dataTransfer.setData(
                  "text/plain",
                  config.id
                );
                setDraggedWidget(
                  config.id
                );
              }}
              onDragOver={(e) => {
                if (!editDashboard) {
                  return;
                }

                e.preventDefault();
                e.dataTransfer.dropEffect =
                  "move";
              }}
              onDrop={(e) => {
                if (!editDashboard) {
                  return;
                }

                e.preventDefault();
                moveWidget(
                  config.id,
                  e.dataTransfer.getData(
                    "text/plain"
                  )
                );
              }}
              onDragEnd={() =>
                setDraggedWidget(null)
              }
            >
              {editDashboard && (
                <div className="dash-widget-edit">
                  <button
                    type="button"
                    className="dash-widget-grip"
                    title="Déplacer"
                  >
                    ≡
                  </button>

                  <button
                    type="button"
                    className="dash-widget-hide"
                    title="Masquer"
                    onClick={() =>
                      updateWidget(
                        config.id,
                        {
                          visible:
                            false,
                        }
                      )
                    }
                  >
                    Masquer
                  </button>

                  <select
                    value={config.size}
                    onChange={(e) =>
                      updateWidget(
                        config.id,
                        {
                          size: e.target
                            .value as WidgetSize,
                        }
                      )
                    }
                  >
                    <option value="small">
                      Petit
                    </option>
                    <option value="medium">
                      Moyen
                    </option>
                    <option value="large">
                      Large
                    </option>
                  </select>

                  <select
                    value={config.tone}
                    onChange={(e) =>
                      updateWidget(
                        config.id,
                        {
                          tone: e.target
                            .value as WidgetTone,
                        }
                      )
                    }
                  >
                    <option value="neutral">
                      Neutre
                    </option>
                    <option value="primary">
                      Bleu
                    </option>
                    <option value="success">
                      Vert
                    </option>
                    <option value="warning">
                      Orange
                    </option>
                    <option value="danger">
                      Rouge
                    </option>
                    <option value="highlight">
                      Accent
                    </option>
                  </select>
                </div>
              )}

              {isKpi && (
                <>
                  <div className="dash-card-top">
                    <div className="dash-label">
                      {def.label}
                    </div>

                    {def.href && (
                      <a
                        href={def.href}
                        className="dash-mini-link"
                      >
                        Voir
                      </a>
                    )}
                  </div>

                  <div className="dash-value">
                    {def.value}
                  </div>

                  <div className="dash-foot">
                    {def.foot}
                  </div>
                </>
              )}

              {def.kind === "chart" && (
                <>
                  <div className="dash-panel-head">
                    <h2 className="dash-panel-title">
                      Revenus
                    </h2>

                    <div className="dash-panel-meta">
                      {eur(k.revenueLast7)}
                    </div>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: 280,
                    }}
                  >
                    <ResponsiveContainer>
                      <AreaChart data={series}>
                        <defs>
                          <linearGradient
                            id="rev-widget"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#6366f1"
                              stopOpacity={0.35}
                            />

                            <stop
                              offset="100%"
                              stopColor="#6366f1"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        <XAxis
                          dataKey="day"
                          tick={{
                            fill: "#888",
                            fontSize: 12,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip
                          contentStyle={{
                            background: "#111",
                            border:
                              "1px solid #333",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                        />

                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          fill="url(#rev-widget)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              {def.kind === "lastOrders" && (
                <>
                  <div className="dash-panel-head">
                    <h2 className="dash-panel-title">
                      Dernières commandes
                    </h2>

                    <a
                      href="/admin/orders"
                      className="dash-mini-link"
                    >
                      Tout voir
                    </a>
                  </div>

                  <div className="dash-orders">
                    {lastOrders
                      .slice(0, 5)
                      .map((o) => (
                        <div
                          key={o.id}
                          className="dash-row"
                        >
                          <div className="mono">
                            {o.orderNumber ||
                              o.id.slice(0, 6)}
                          </div>

                          <div className="truncate">
                            {o.email}
                          </div>

                          <div className="strong">
                            {eur(o.total)}
                          </div>

                          <div className="muted">
                            {shortDate(
                              o.createdAt
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}

              {def.kind === "lowStock" && (
                <>
                  <div className="dash-panel-head">
                    <h2 className="dash-panel-title">
                      Stocks faibles
                    </h2>
                  </div>

                  <div className="dash-lowstock">
                    {lowStock.length === 0 ? (
                      <div className="muted">
                        Aucun stock faible.
                      </div>
                    ) : (
                      lowStock
                        .slice(0, 8)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="dash-lowstock-item"
                          >
                            <span className="truncate">
                              {p.name}
                            </span>

                            <span className="dash-chip warn">
                              {p.stock}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </>
              )}

              {def.kind === "search" && (
                <DashboardOrdersSearch embedded />
              )}
            </div>
          );
        })}
      </div>

      {editDashboard &&
        hiddenWidgets.length > 0 && (
          <div className="dash-hidden-widgets">
            <span>Cartes masquées</span>

            {hiddenWidgets.map((config) => {
              const def =
                widgetDefinitionById.get(
                  config.id
                );

              if (!def) {
                return null;
              }

              return (
                <button
                  key={config.id}
                  type="button"
                  onClick={() =>
                    updateWidget(
                      config.id,
                      {
                        visible: true,
                      }
                    )
                  }
                >
                  + {def.label}
                </button>
              );
            })}
          </div>
        )}

      <div className="dash-kpis" hidden>
        <div className="dash-card primary">
          <div className="dash-card-top">
            <div className="dash-label">
              Commandes
            </div>

            <a
              href="/admin/orders"
              className="dash-mini-link"
            >
              Voir
            </a>
          </div>

          <div className="dash-value">
            {k.ordersCount}
          </div>

          <div className="dash-foot">
            Total des commandes
          </div>
        </div>

        <div className="dash-card success">
          <div className="dash-label">
            Payées
          </div>

          <div className="dash-value">
            {k.paidOrdersCount}
          </div>

          <div className="dash-foot">
            Commandes validées
          </div>
        </div>

        <div className="dash-card warning">
          <div className="dash-label">
            En attente
          </div>

          <div className="dash-value">
            {k.pendingCount}
          </div>

          <div className="dash-foot">
            Paiement non validé
          </div>
        </div>

        <div className="dash-card warning">
          <div className="dash-label">
            À préparer
          </div>

          <div className="dash-value">
            {k.toPrepareCount}
          </div>

          <div className="dash-foot">
            Commandes à expédier
          </div>
        </div>

        <div className="dash-card success">
          <div className="dash-label">
            Expédiées
          </div>

          <div className="dash-value">
            {k.shippedCount}
          </div>

          <div className="dash-foot">
            Déjà envoyées
          </div>
        </div>

        <div className="dash-card highlight">
          <div className="dash-label">
            CA 7 jours
          </div>

          <div className="dash-value">
            {eur(k.revenueLast7)}
          </div>

          <div className="dash-foot">
            7 derniers jours
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-label">
            Aujourd’hui
          </div>

          <div className="dash-value">
            {eur(k.revenueToday)}
          </div>

          <div className="dash-foot">
            Revenus du jour
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-label">
            Hier
          </div>

          <div className="dash-value">
            {eur(k.revenueYesterday)}
          </div>

          <div className="dash-foot">
            Revenus de la veille
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-label">
            Panier moyen
          </div>

          <div className="dash-value">
            {eur(k.aov)}
          </div>

          <div className="dash-foot">
            Moyenne par commande
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-label">
            Produits
          </div>

          <div className="dash-value">
            {k.productsCount}
          </div>

          <div className="dash-foot">
            {k.activeProducts} actifs
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-top">
            <div className="dash-label">
              Paiement
            </div>

            <a
              href="/admin/payment-methods"
              className="dash-mini-link"
            >
              Voir
            </a>
          </div>

          <div className="dash-value">
            {k.paymentMethodsCount}
          </div>

          <div className="dash-foot">
            Méthodes configurées
          </div>
        </div>

        <div className="dash-card success">
          <div className="dash-label">
            Paiements actifs
          </div>

          <div className="dash-value">
            {k.activePaymentMethods}
          </div>

          <div className="dash-foot">
            Méthodes activées
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-top">
            <div className="dash-label">
              Livraison
            </div>

            <a
              href="/admin/shipping"
              className="dash-mini-link"
            >
              Voir
            </a>
          </div>

          <div className="dash-value">
            {k.shippingMethodsCount}
          </div>

          <div className="dash-foot">
            Méthodes configurées
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-label">
            Pays
          </div>

          <div className="dash-value">
            {k.adminCountriesCount}
          </div>

          <div className="dash-foot">
            Pays configurés
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-top">
            <div className="dash-label">
              Avis
            </div>

            <a
              href="/admin/reviews"
              className="dash-mini-link"
            >
              Voir
            </a>
          </div>

          <div className="dash-value">
            {k.reviewsCount}
          </div>

          <div className="dash-foot">
            Avis clients
          </div>
        </div>

        <div className="dash-card success">
          <div className="dash-label">
            Publiés
          </div>

          <div className="dash-value">
            {k.approvedReviews}
          </div>

          <div className="dash-foot">
            Avis visibles
          </div>
        </div>

        <div className="dash-card warning">
          <div className="dash-label">
            Avis en attente
          </div>

          <div className="dash-value">
            {k.pendingReviews}
          </div>

          <div className="dash-foot">
            À modérer
          </div>
        </div>
      </div>

      {/* =====================================================
          GRID
      ===================================================== */}

      <div className="dash-grid" hidden>
        {/* GRAPH */}
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h2 className="dash-panel-title">
              Revenus
            </h2>

            <div className="dash-panel-meta">
              {eur(k.revenueLast7)}
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: 280,
            }}
          >
            <ResponsiveContainer>
              <AreaChart data={series}>
                <defs>
                  <linearGradient
                    id="rev"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#6366f1"
                      stopOpacity={0.35}
                    />

                    <stop
                      offset="100%"
                      stopColor="#6366f1"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="day"
                  tick={{
                    fill: "#888",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid #333",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LAST ORDERS */}
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h2 className="dash-panel-title">
              Dernières commandes
            </h2>

            <a
              href="/admin/orders"
              className="dash-mini-link"
            >
              Tout voir
            </a>
          </div>

          <div className="dash-orders">
            {lastOrders
              .slice(0, 5)
              .map((o) => (
                <div
                  key={o.id}
                  className="dash-row"
                >
                  <div className="mono">
                    {o.orderNumber ||
                      o.id.slice(0, 6)}
                  </div>

                  <div className="truncate">
                    {o.email}
                  </div>

                  <div className="strong">
                    {eur(o.total)}
                  </div>

                  <div className="muted">
                    {shortDate(
                      o.createdAt
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* =====================================================
          LOW STOCK
      ===================================================== */}

      {false && lowStock.length > 0 && (
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h2 className="dash-panel-title">
              Stocks faibles
            </h2>
          </div>

          <div className="dash-lowstock">
            {lowStock
              .slice(0, 8)
              .map((p) => (
                <div
                  key={p.id}
                  className="dash-lowstock-item"
                >
                  <span className="truncate">
                    {p.name}
                  </span>

                  <span className="dash-chip warn">
                    {p.stock}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =====================================================
          SEARCH ORDERS
      ===================================================== */}

      {false && <DashboardOrdersSearch />}
    </div>
  );
}
