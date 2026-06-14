"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FiActivity,
  FiAlertCircle,
  FiBarChart2,
  FiCheckCircle,
  FiChevronRight,
  FiCreditCard,
  FiDownload,
  FiEye,
  FiEyeOff,
  FiGrid,
  FiMaximize2,
  FiMessageSquare,
  FiMinimize2,
  FiPackage,
  FiRefreshCw,
  FiSettings,
  FiTruck,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";

import DashboardOrdersSearch from "./DashboardOrdersSearch";

type StatsResponse = {
  kpis: {
    productsCount: number;
    activeProducts: number;
    incompleteProducts: number;
    paymentMethodsCount: number;
    activePaymentMethods: number;
    shippingMethodsCount: number;
    activeShippingMethods: number;
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
    orders?: number;
  }[];
  lastOrders: {
    id: string;
    orderNumber?: string;
    status: string;
    total: number;
    email: string;
    createdAt: string | null;
  }[];
  alerts: {
    tone: "info" | "warn" | "danger";
    title: string;
    desc: string;
  }[];
  periods: Record<DashboardPeriod, PeriodStats>;
};

type DashboardPeriod = "day" | "7d" | "month" | "year" | "all";
type RevenueChartType = "area" | "line" | "bar";
type WidgetTone = "default" | "blue" | "cyan" | "green" | "orange" | "violet";
type WidgetIntensity = "soft" | "normal" | "strong";
type DashboardDensity = "compact" | "comfortable";
type DashboardPreset = "today" | "sales" | "shipping" | "catalog";
type WidgetStyle = {
  tone: WidgetTone;
  intensity: WidgetIntensity;
};
type WidgetId =
  | "alerts"
  | "health"
  | "search"
  | "revenueYear"
  | "revenue7d"
  | "orders"
  | "paidOrders"
  | "pendingOrders"
  | "aov"
  | "revenueChart"
  | "orderStatus"
  | "toPrepare"
  | "shipped"
  | "operationsProgress"
  | "operationsChart"
  | "products"
  | "activeProducts"
  | "payments"
  | "activePayments"
  | "shipping"
  | "countries"
  | "reviews"
  | "approvedReviews"
  | "pendingReviews"
  | "lastOrders";

const widgetGroups: Array<{
  label: string;
  widgets: Array<{ id: WidgetId; label: string }>;
}> = [
  {
    label: "Accès",
    widgets: [
      { id: "alerts", label: "À faire aujourd’hui" },
      { id: "health", label: "Santé de la boutique" },
      { id: "search", label: "Recherche commandes" },
      { id: "lastOrders", label: "Dernières commandes" },
    ],
  },
  {
    label: "Ventes",
    widgets: [
      { id: "revenueYear", label: "CA principal" },
      { id: "revenue7d", label: "CA secondaire" },
      { id: "orders", label: "Commandes" },
      { id: "paidOrders", label: "Commandes payées" },
      { id: "pendingOrders", label: "Commandes en attente" },
      { id: "aov", label: "Panier moyen" },
      { id: "revenueChart", label: "Graphique CA" },
      { id: "orderStatus", label: "État commandes" },
    ],
  },
  {
    label: "Opérations",
    widgets: [
      { id: "toPrepare", label: "À préparer" },
      { id: "shipped", label: "Expédiées" },
      { id: "operationsProgress", label: "Progression" },
      { id: "operationsChart", label: "Volumes" },
    ],
  },
  {
    label: "Boutique",
    widgets: [
      { id: "products", label: "Produits" },
      { id: "activeProducts", label: "Produits actifs" },
      { id: "payments", label: "Paiements" },
      { id: "activePayments", label: "Paiements actifs" },
      { id: "shipping", label: "Livraison" },
      { id: "countries", label: "Pays" },
      { id: "reviews", label: "Avis" },
      { id: "approvedReviews", label: "Avis publiés" },
      { id: "pendingReviews", label: "Avis à modérer" },
    ],
  },
];

const defaultVisibleWidgets: WidgetId[] = [
  "alerts",
  "health",
  "revenueYear",
  "paidOrders",
  "aov",
  "toPrepare",
  "revenueChart",
  "orderStatus",
  "lastOrders",
];

const allWidgets = widgetGroups.flatMap((group) =>
  group.widgets.map((widget) => widget.id)
);

const dashboardPresets: Array<{
  id: DashboardPreset;
  label: string;
  widgets: WidgetId[];
}> = [
  {
    id: "today",
    label: "Aujourd’hui",
    widgets: defaultVisibleWidgets,
  },
  {
    id: "sales",
    label: "Ventes",
    widgets: [
      "search",
      "revenueYear",
      "revenue7d",
      "orders",
      "paidOrders",
      "pendingOrders",
      "aov",
      "revenueChart",
      "orderStatus",
      "reviews",
      "approvedReviews",
      "lastOrders",
    ],
  },
  {
    id: "shipping",
    label: "Expédition",
    widgets: [
      "alerts",
      "health",
      "search",
      "orders",
      "pendingOrders",
      "toPrepare",
      "shipped",
      "operationsProgress",
      "operationsChart",
      "shipping",
      "countries",
      "lastOrders",
    ],
  },
  {
    id: "catalog",
    label: "Catalogue",
    widgets: [
      "alerts",
      "health",
      "search",
      "products",
      "activeProducts",
      "payments",
      "activePayments",
      "shipping",
      "countries",
      "reviews",
      "approvedReviews",
      "pendingReviews",
    ],
  },
];

type PeriodStats = {
  revenue: number;
  previousRevenue: number;
  revenueDeltaPct: number;
  ordersCount: number;
  paidOrdersCount: number;
  pendingCount: number;
  aov: number;
  series: {
    day: string;
    revenue: number;
    orders: number;
  }[];
};

const periodOptions: Array<{
  value: DashboardPeriod;
  label: string;
  shortLabel: string;
}> = [
  { value: "day", label: "Aujourd’hui", shortLabel: "1 jour" },
  { value: "7d", label: "7 derniers jours", shortLabel: "7 jours" },
  { value: "month", label: "Mois en cours", shortLabel: "1 mois" },
  { value: "year", label: "Année en cours", shortLabel: "1 an" },
  { value: "all", label: "Depuis le début", shortLabel: "Total" },
];

function periodLabel(period: DashboardPeriod) {
  return (
    periodOptions.find((option) => option.value === period)?.label ||
    period
  );
}

function eur(value?: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function shortDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status: string) {
  if (status === "paid") return "Payée";
  if (status === "pending_payment") return "En attente";
  if (status === "shipped") return "Expédiée";
  return status || "Inconnu";
}

function Delta({ value }: { value: number }) {
  const positive = value >= 0;

  return (
    <span
      className={`dash-pro-delta ${
        positive ? "positive" : "negative"
      }`}
    >
      {positive ? "+" : ""}
      {value.toLocaleString("fr-FR")} %
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone = "blue",
  delta,
  href,
  control,
  className = "",
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: "blue" | "cyan" | "green" | "orange" | "violet";
  delta?: number;
  href?: string;
  control?: ReactNode;
  className?: string;
}) {
  const content = (
    <>
      <div className="dash-pro-metric-head">
        <span>{label}</span>
        {control}
      </div>
      <strong>{value}</strong>
      <div className="dash-pro-metric-foot">
        <span>{detail}</span>
        {typeof delta === "number" && (
          <Delta value={delta} />
        )}
      </div>
    </>
  );

  const metricClassName =
    `dash-pro-metric tone-${tone} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={metricClassName}
        aria-label={`${label} : ${value}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <article className={metricClassName}>
      {content}
    </article>
  );
}

function PeriodSelect({
  value,
  onChange,
  compact = false,
}: {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
  compact?: boolean;
}) {
  return (
    <select
      className={`dash-pro-period-select ${
        compact ? "compact" : ""
      }`}
      value={value}
      aria-label="Choisir une période"
      onClick={(event) => event.stopPropagation()}
      onChange={(event) =>
        onChange(event.target.value as DashboardPeriod)
      }
    >
      {periodOptions.map((option) => (
        <option value={option.value} key={option.value}>
          {compact ? option.shortLabel : option.label}
        </option>
      ))}
    </select>
  );
}

function PeriodTabs({
  value,
  onChange,
}: {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}) {
  return (
    <div
      className="dash-pro-period-tabs"
      role="group"
      aria-label="Période du graphique"
    >
      {periodOptions.map((option) => (
        <button
          type="button"
          key={option.value}
          className={value === option.value ? "active" : ""}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.shortLabel}
        </button>
      ))}
    </div>
  );
}

function ChartTypeTabs({
  value,
  onChange,
}: {
  value: RevenueChartType;
  onChange: (type: RevenueChartType) => void;
}) {
  const options = [
    { value: "area" as const, label: "Aire", icon: <FiActivity /> },
    {
      value: "line" as const,
      label: "Courbe",
      icon: <FiTrendingUp />,
    },
    {
      value: "bar" as const,
      label: "Barres",
      icon: <FiBarChart2 />,
    },
  ];

  return (
    <div
      className="dash-pro-chart-tabs"
      role="group"
      aria-label="Type de graphique"
    >
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          title={option.label}
          aria-label={option.label}
          aria-pressed={value === option.value}
          className={value === option.value ? "active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <div className="dash-pro-section-head">
      <h2>{title}</h2>
    </div>
  );
}

type DashboardAction = {
  title: string;
  detail: string;
  href: string;
  label: string;
  tone: "danger" | "warn" | "info";
  icon: ReactNode;
};

export default function AdminDashboardPage() {
  const [data, setData] =
    useState<StatsResponse | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState<string | null>(null);
  const [chartPeriod, setChartPeriod] =
    useState<DashboardPeriod>("month");
  const [primaryPeriod, setPrimaryPeriod] =
    useState<DashboardPeriod>("year");
  const [secondaryPeriod, setSecondaryPeriod] =
    useState<DashboardPeriod>("7d");
  const [chartType, setChartType] =
    useState<RevenueChartType>("area");
  const [showWidgetPanel, setShowWidgetPanel] =
    useState(false);
  const [visibleWidgets, setVisibleWidgets] =
    useState<WidgetId[]>(defaultVisibleWidgets);
  const [widgetStyles, setWidgetStyles] =
    useState<Partial<Record<WidgetId, WidgetStyle>>>({});
  const [density, setDensity] =
    useState<DashboardDensity>("comfortable");

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/stats", {
        cache: "no-store",
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "Erreur API");
      }

      setData(json);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger le dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const savedChart = localStorage.getItem(
      "dashboard_chart_period"
    ) as DashboardPeriod | null;
    const savedPrimary = localStorage.getItem(
      "dashboard_primary_period"
    ) as DashboardPeriod | null;
    const savedSecondary = localStorage.getItem(
      "dashboard_secondary_period"
    ) as DashboardPeriod | null;
    const savedChartType = localStorage.getItem(
      "dashboard_chart_type"
    ) as RevenueChartType | null;
    const savedWidgets = localStorage.getItem(
      "dashboard_visible_widgets"
    );
    const savedStyles = localStorage.getItem(
      "dashboard_widget_styles"
    );
    const savedDensity = localStorage.getItem(
      "dashboard_density"
    );
    const layoutVersion = localStorage.getItem(
      "dashboard_layout_version"
    );
    const valid = new Set(
      periodOptions.map((option) => option.value)
    );

    if (savedChart && valid.has(savedChart)) {
      setChartPeriod(savedChart);
    }
    if (savedPrimary && valid.has(savedPrimary)) {
      setPrimaryPeriod(savedPrimary);
    }
    if (savedSecondary && valid.has(savedSecondary)) {
      setSecondaryPeriod(savedSecondary);
    }
    if (
      savedChartType === "area" ||
      savedChartType === "line" ||
      savedChartType === "bar"
    ) {
      setChartType(savedChartType);
    }
    if (layoutVersion !== "3") {
      setVisibleWidgets(defaultVisibleWidgets);
      localStorage.setItem(
        "dashboard_visible_widgets",
        JSON.stringify(defaultVisibleWidgets)
      );
      localStorage.setItem("dashboard_layout_version", "3");
    } else if (savedWidgets) {
      try {
        const parsed = JSON.parse(savedWidgets);
        if (Array.isArray(parsed)) {
          setVisibleWidgets(
            parsed.filter((id): id is WidgetId =>
              allWidgets.includes(id as WidgetId)
            )
          );
        }
      } catch {
        setVisibleWidgets(defaultVisibleWidgets);
      }
    }
    if (savedStyles) {
      try {
        setWidgetStyles(JSON.parse(savedStyles));
      } catch {
        setWidgetStyles({});
      }
    }
    if (savedDensity === "compact" || savedDensity === "comfortable") {
      setDensity(savedDensity);
    }
  }, []);

  function updatePeriod(
    key: "chart" | "primary" | "secondary",
    value: DashboardPeriod
  ) {
    localStorage.setItem(`dashboard_${key}_period`, value);

    if (key === "chart") setChartPeriod(value);
    if (key === "primary") setPrimaryPeriod(value);
    if (key === "secondary") setSecondaryPeriod(value);
  }

  function updateChartType(value: RevenueChartType) {
    localStorage.setItem("dashboard_chart_type", value);
    setChartType(value);
  }

  function toggleWidget(id: WidgetId) {
    setVisibleWidgets((current) => {
      const next = current.includes(id)
        ? current.filter((widgetId) => widgetId !== id)
        : [...current, id];

      localStorage.setItem(
        "dashboard_visible_widgets",
        JSON.stringify(next)
      );

      return next;
    });
  }

  function showWidget(id: WidgetId) {
    return visibleWidgets.includes(id);
  }

  function setAllWidgets(visible: boolean) {
    const next = visible ? allWidgets : [];
    setVisibleWidgets(next);
    localStorage.setItem(
      "dashboard_visible_widgets",
      JSON.stringify(next)
    );
  }

  function resetWidgetStyles() {
    setWidgetStyles({});
    localStorage.removeItem("dashboard_widget_styles");
  }

  function applyPreset(preset: DashboardPreset) {
    const next =
      dashboardPresets.find((item) => item.id === preset)?.widgets ||
      defaultVisibleWidgets;
    setVisibleWidgets(next);
    localStorage.setItem(
      "dashboard_visible_widgets",
      JSON.stringify(next)
    );
  }

  function isPresetActive(preset: DashboardPreset) {
    const widgets =
      dashboardPresets.find((item) => item.id === preset)?.widgets || [];
    return (
      widgets.length === visibleWidgets.length &&
      widgets.every((id) => visibleWidgets.includes(id))
    );
  }

  function updateDensity(value: DashboardDensity) {
    setDensity(value);
    localStorage.setItem("dashboard_density", value);
  }

  function updateGlobalPeriod(value: DashboardPeriod) {
    updatePeriod("chart", value);
    updatePeriod("primary", value);
    updatePeriod("secondary", value);
  }

  function updateWidgetStyle(
    id: WidgetId,
    key: keyof WidgetStyle,
    value: WidgetTone | WidgetIntensity
  ) {
    setWidgetStyles((current) => {
      const next = {
        ...current,
        [id]: {
          tone: current[id]?.tone || "default",
          intensity: current[id]?.intensity || "normal",
          [key]: value,
        },
      };
      localStorage.setItem(
        "dashboard_widget_styles",
        JSON.stringify(next)
      );
      return next;
    });
  }

  function widgetClass(id: WidgetId) {
    const style = widgetStyles[id];
    return [
      "dash-pro-widget-surface",
      style?.tone && style.tone !== "default"
        ? `tone-${style.tone}`
        : "",
      `intensity-${style?.intensity || "normal"}`,
    ]
      .filter(Boolean)
      .join(" ");
  }

  const chartTooltip = useMemo(
    () => ({
      background: "var(--admin-tooltip-bg)",
      border: "1px solid var(--admin-tooltip-border)",
      borderRadius: 12,
      fontSize: 12,
      color: "var(--admin-tooltip-text)",
      boxShadow: "var(--admin-tooltip-shadow)",
    }),
    []
  );

  if (loading) {
    return (
      <div className="admin-page dash-pro-page">
        <div className="dash-pro-loading">
          Chargement du pilotage…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="admin-page dash-pro-page">
        <div className="dash-error">
          <strong>{error}</strong>
          <button className="btn-secondary" onClick={refresh}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { kpis: k, lastOrders } = data;
  const primaryStats = data.periods[primaryPeriod];
  const secondaryStats = data.periods[secondaryPeriod];
  const chartStats = data.periods[chartPeriod];
  const dashboardActions: DashboardAction[] = [
    ...(k.toPrepareCount > 0
      ? [{
          title: `${k.toPrepareCount} commande${k.toPrepareCount > 1 ? "s" : ""} à préparer`,
          detail: "Ces commandes sont prêtes à être traitées.",
          href: "/admin/logistics",
          label: "Préparer",
          tone: "warn" as const,
          icon: <FiPackage />,
        }]
      : []),
    ...(chartStats.pendingCount > 0
      ? [{
          title: `${chartStats.pendingCount} paiement${chartStats.pendingCount > 1 ? "s" : ""} en attente`,
          detail: `Sur la période ${periodLabel(chartPeriod).toLowerCase()}.`,
          href: "/admin/orders",
          label: "Vérifier",
          tone: "warn" as const,
          icon: <FiCreditCard />,
        }]
      : []),
    ...(k.pendingReviews > 0
      ? [{
          title: `${k.pendingReviews} avis à modérer`,
          detail: "Publiez ou refusez les avis en attente.",
          href: "/admin/reviews",
          label: "Modérer",
          tone: "info" as const,
          icon: <FiMessageSquare />,
        }]
      : []),
    ...(k.incompleteProducts > 0
      ? [{
          title: `${k.incompleteProducts} produit${k.incompleteProducts > 1 ? "s" : ""} à compléter`,
          detail: "Titre, image ou prix manquant.",
          href: "/admin/products",
          label: "Corriger",
          tone: "danger" as const,
          icon: <FiAlertCircle />,
        }]
      : []),
    ...(k.activePaymentMethods === 0
      ? [{
          title: "Aucun paiement actif",
          detail: "Les clients ne peuvent pas finaliser leur commande.",
          href: "/admin/payment-methods",
          label: "Configurer",
          tone: "danger" as const,
          icon: <FiCreditCard />,
        }]
      : []),
    ...(k.activeShippingMethods === 0
      ? [{
          title: "Aucune livraison active",
          detail: "Activez au moins une méthode de livraison.",
          href: "/admin/shipping",
          label: "Configurer",
          tone: "danger" as const,
          icon: <FiTruck />,
        }]
      : []),
  ];
  const healthChecks = [
    {
      label: "Produit actif",
      valid: k.activeProducts > 0,
      href: "/admin/products",
    },
    {
      label: "Paiement actif",
      valid: k.activePaymentMethods > 0,
      href: "/admin/payment-methods",
    },
    {
      label: "Livraison active",
      valid: k.activeShippingMethods > 0,
      href: "/admin/shipping",
    },
    {
      label: "Catalogue complet",
      valid: k.productsCount > 0 && k.incompleteProducts === 0,
      href: "/admin/products",
    },
  ];
  const healthScore = Math.round(
    (healthChecks.filter((check) => check.valid).length /
      healthChecks.length) *
      100
  );

  const operations = [
    {
      label: "À préparer",
      value: k.toPrepareCount,
      max: Math.max(k.toPrepareCount + k.shippedCount, 1),
      tone: "orange",
    },
    {
      label: "Expédiées",
      value: k.shippedCount,
      max: Math.max(k.toPrepareCount + k.shippedCount, 1),
      tone: "cyan",
    },
    {
      label: "Avis à modérer",
      value: k.pendingReviews,
      max: Math.max(k.reviewsCount, 1),
      tone: "violet",
    },
  ];
  const showSalesCharts =
    showWidget("revenueChart") || showWidget("orderStatus");
  const showSalesMetrics =
    showWidget("revenueYear") ||
    showWidget("revenue7d") ||
    showWidget("orders") ||
    showWidget("paidOrders") ||
    showWidget("pendingOrders") ||
    showWidget("aov") ||
    showWidget("toPrepare");
  const showOperations =
    showWidget("shipped") ||
    showWidget("operationsProgress") ||
    showWidget("operationsChart");
  const showStore =
    showWidget("products") ||
    showWidget("activeProducts") ||
    showWidget("payments") ||
    showWidget("activePayments") ||
    showWidget("shipping") ||
    showWidget("countries") ||
    showWidget("reviews") ||
    showWidget("approvedReviews") ||
    showWidget("pendingReviews");
  const hasVisibleWidgets = visibleWidgets.length > 0;

  return (
    <div className={`admin-page dash-pro-page density-${density}`}>
      <header className="dash-pro-hero">
        <div className="dash-pro-actions">
          <PeriodSelect
            compact
            value={chartPeriod}
            onChange={updateGlobalPeriod}
          />
          <button
            className="dash-pro-icon-action"
            onClick={() =>
              updateDensity(
                density === "compact" ? "comfortable" : "compact"
              )
            }
            title={density === "compact" ? "Vue confortable" : "Vue compacte"}
            aria-label={density === "compact" ? "Vue confortable" : "Vue compacte"}
          >
            {density === "compact" ? <FiMaximize2 /> : <FiMinimize2 />}
          </button>
          <button
            className={`dash-pro-icon-action ${
              showWidgetPanel ? "active" : ""
            }`}
            onClick={() => setShowWidgetPanel((current) => !current)}
            title="Widgets"
            aria-label="Widgets"
          >
            <FiSettings />
          </button>
          <button
            className="dash-pro-icon-action"
            onClick={refresh}
            title="Actualiser"
            aria-label="Actualiser"
          >
            <FiRefreshCw />
          </button>
          <Link
            className="dash-pro-icon-action"
            href="/admin/export"
            title="Exports"
            aria-label="Exports"
          >
            <FiDownload />
          </Link>
        </div>
      </header>

      {showWidgetPanel && (
        <section className="dash-pro-widget-panel">
          <div className="dash-pro-widget-panel-head">
            <div className="dash-pro-widget-panel-title">
              <FiGrid />
              <strong>Personnalisation</strong>
              <span>{visibleWidgets.length}/{allWidgets.length}</span>
            </div>
            <div>
              <button type="button" onClick={() => setAllWidgets(true)}>
                Tout afficher
              </button>
              <button type="button" onClick={() => setAllWidgets(false)}>
                Tout masquer
              </button>
              <button type="button" onClick={resetWidgetStyles}>
                Style initial
              </button>
              <button
                type="button"
                className="icon"
                onClick={() => setShowWidgetPanel(false)}
                aria-label="Fermer"
              >
                <FiX />
              </button>
            </div>
          </div>

          <div className="dash-pro-presets">
            {dashboardPresets.map((preset) => (
              <button
                type="button"
                key={preset.id}
                className={isPresetActive(preset.id) ? "active" : ""}
                aria-pressed={isPresetActive(preset.id)}
                onClick={() => applyPreset(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="dash-pro-widget-groups">
            {widgetGroups.map((group) => (
              <div className="dash-pro-widget-group" key={group.label}>
                <strong>{group.label}</strong>
                <div>
                  {group.widgets.map((widget) => {
                    const visible = showWidget(widget.id);
                    const style = widgetStyles[widget.id];

                    return (
                      <div
                        key={widget.id}
                        className="dash-pro-widget-control"
                      >
                        <button
                          type="button"
                          className={visible ? "active" : ""}
                          aria-pressed={visible}
                          onClick={() => toggleWidget(widget.id)}
                        >
                          {visible ? <FiEye /> : <FiEyeOff />}
                          {widget.label}
                        </button>
                        <select
                          aria-label={`Couleur ${widget.label}`}
                          value={style?.tone || "default"}
                          onChange={(event) =>
                            updateWidgetStyle(
                              widget.id,
                              "tone",
                              event.target.value as WidgetTone
                            )
                          }
                        >
                          <option value="default">Auto</option>
                          <option value="blue">Bleu</option>
                          <option value="cyan">Cyan</option>
                          <option value="green">Vert</option>
                          <option value="orange">Orange</option>
                          <option value="violet">Violet</option>
                        </select>
                        <select
                          aria-label={`Intensité ${widget.label}`}
                          value={style?.intensity || "normal"}
                          onChange={(event) =>
                            updateWidgetStyle(
                              widget.id,
                              "intensity",
                              event.target.value as WidgetIntensity
                            )
                          }
                        >
                          <option value="soft">Doux</option>
                          <option value="normal">Normal</option>
                          <option value="strong">Fort</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!hasVisibleWidgets && (
        <section className="dash-pro-empty-dashboard">
          <FiGrid />
          <strong>Dashboard vide</strong>
          <button type="button" onClick={() => applyPreset("today")}>
            Afficher l’essentiel
          </button>
        </section>
      )}

      {hasVisibleWidgets && (showWidget("alerts") || showWidget("health")) && (
        <section
          className={`dash-command-center ${
            showWidget("alerts") !== showWidget("health") ? "single" : ""
          }`}
        >
          {showWidget("alerts") && (
          <article className={`dash-action-panel ${dashboardActions.length === 0 ? "is-clear" : ""} ${widgetClass("alerts")}`}>
            <div className="dash-command-head">
              <div>
                <span className="dash-command-kicker">À faire aujourd’hui</span>
              </div>
              <strong>{dashboardActions.length}</strong>
            </div>

            <div className="dash-action-list">
              {dashboardActions.length === 0 ? (
                <div className="dash-action-empty">
                  <FiCheckCircle />
                  <div>
                    <strong>Aucune action urgente</strong>
                  </div>
                </div>
              ) : (
                dashboardActions.slice(0, 5).map((action) => (
                  <Link
                    href={action.href}
                    className={`dash-action-row tone-${action.tone}`}
                    key={`${action.href}-${action.title}`}
                  >
                    <span className="dash-action-icon">{action.icon}</span>
                    <div>
                      <strong>{action.title}</strong>
                      <span>{action.detail}</span>
                    </div>
                    <b>{action.label}</b>
                    <FiChevronRight />
                  </Link>
                ))
              )}
            </div>
          </article>
          )}

          {showWidget("health") && (
          <article className={`dash-health-panel ${widgetClass("health")}`}>
            <div className="dash-health-score">
              <div
                className="dash-health-ring"
                style={{ "--health-score": `${healthScore * 3.6}deg` } as CSSProperties}
              >
                <strong>{healthScore}%</strong>
              </div>
              <div>
                <span className="dash-command-kicker">Santé de la boutique</span>
                <h2>{healthScore === 100 ? "Prête à vendre" : "Configuration à terminer"}</h2>
              </div>
            </div>
            <div className="dash-health-checks">
              {healthChecks.map((check) => (
                <Link
                  href={check.href}
                  className={check.valid ? "is-valid" : "is-missing"}
                  key={check.label}
                >
                  {check.valid ? <FiCheckCircle /> : <FiAlertCircle />}
                  <span>{check.label}</span>
                  {!check.valid && <b>Corriger</b>}
                </Link>
              ))}
            </div>
          </article>
          )}
        </section>
      )}

      {showWidget("search") && (
        <section className="dash-pro-section dash-pro-search-section">
          <article className={`dash-pro-panel dash-pro-search-panel ${widgetClass("search")}`}>
            <DashboardOrdersSearch embedded />
          </article>
        </section>
      )}

      {showSalesMetrics && (
      <section className="dash-pro-metrics">
        {showWidget("revenueYear") && (
          <MetricCard
            label="Chiffre d’affaires"
            value={eur(primaryStats.revenue)}
            detail={periodLabel(primaryPeriod)}
            delta={
              primaryPeriod === "all"
                ? undefined
                : primaryStats.revenueDeltaPct
            }
            tone="blue"
            className={widgetClass("revenueYear")}
            control={
              <PeriodSelect
                compact
                value={primaryPeriod}
                onChange={(value) => updatePeriod("primary", value)}
              />
            }
          />
        )}
        {showWidget("revenue7d") && (
          <MetricCard
            label="Chiffre d’affaires 2"
            value={eur(secondaryStats.revenue)}
            detail={periodLabel(secondaryPeriod)}
            tone="cyan"
            className={widgetClass("revenue7d")}
            delta={
              secondaryPeriod === "all"
                ? undefined
                : secondaryStats.revenueDeltaPct
            }
            control={
              <PeriodSelect
                compact
                value={secondaryPeriod}
                onChange={(value) => updatePeriod("secondary", value)}
              />
            }
          />
        )}
        {showWidget("orders") && (
          <MetricCard
            label="Commandes"
            value={chartStats.ordersCount}
            detail={periodLabel(chartPeriod)}
            tone="blue"
            className={widgetClass("orders")}
            href="/admin/orders"
          />
        )}
        {showWidget("paidOrders") && (
          <MetricCard
            label="Payées"
            value={chartStats.paidOrdersCount}
            detail={periodLabel(chartPeriod)}
            tone="green"
            className={widgetClass("paidOrders")}
            href="/admin/orders"
          />
        )}
        {showWidget("pendingOrders") && (
          <MetricCard
            label="En attente"
            value={chartStats.pendingCount}
            detail={periodLabel(chartPeriod)}
            tone="orange"
            className={widgetClass("pendingOrders")}
            href="/admin/orders"
          />
        )}
        {showWidget("aov") && (
          <MetricCard
            label="Panier moyen"
            value={eur(chartStats.aov)}
            detail={periodLabel(chartPeriod)}
            tone="violet"
            className={widgetClass("aov")}
          />
        )}
        {showWidget("toPrepare") && (
          <MetricCard
            label="À préparer"
            value={k.toPrepareCount}
            detail="Commandes"
            tone="orange"
            className={widgetClass("toPrepare")}
            href="/admin/logistics"
          />
        )}
      </section>
      )}

      {showSalesCharts && (
        <section className="dash-pro-section">
          <SectionHead title="Ventes" />
          <div
            className={`dash-pro-commerce-grid ${
              showWidget("revenueChart") !== showWidget("orderStatus")
                ? "single"
                : ""
            }`}
          >
          {showWidget("revenueChart") && (
            <article className={`dash-pro-panel dash-pro-revenue-panel ${widgetClass("revenueChart")}`}>
            <div className="dash-pro-panel-head">
              <h3>Chiffre d’affaires</h3>
              <div className="dash-pro-chart-controls">
                <strong>{eur(chartStats.revenue)}</strong>
                <PeriodTabs
                  value={chartPeriod}
                  onChange={(value) =>
                    updatePeriod("chart", value)
                  }
                />
                <ChartTypeTabs
                  value={chartType}
                  onChange={updateChartType}
                />
              </div>
            </div>

            <div className="dash-pro-chart">
              <ResponsiveContainer>
                {chartType === "bar" ? (
                  <BarChart data={chartStats.series}>
                    <CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#7f91a8", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#7f91a8", fontSize: 11 }} tickFormatter={(value) => `${value} €`} width={58} />
                    <Tooltip contentStyle={chartTooltip} formatter={(value) => eur(Number(value))} />
                    <Bar dataKey="revenue" fill="#38bdf8" radius={[7, 7, 2, 2]} />
                  </BarChart>
                ) : chartType === "line" ? (
                  <LineChart data={chartStats.series}>
                    <CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#7f91a8", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#7f91a8", fontSize: 11 }} tickFormatter={(value) => `${value} €`} width={58} />
                    <Tooltip contentStyle={chartTooltip} formatter={(value) => eur(Number(value))} />
                    <Line type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={3} dot={{ fill: "#38bdf8", r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                ) : (
                  <AreaChart data={chartStats.series}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.42} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#7f91a8", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#7f91a8", fontSize: 11 }} tickFormatter={(value) => `${value} €`} width={58} />
                    <Tooltip contentStyle={chartTooltip} formatter={(value) => eur(Number(value))} />
                    <Area type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={3} fill="url(#revenueFill)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </article>
          )}

          {showWidget("orderStatus") && (
            <article className={`dash-pro-panel dash-pro-orders-panel ${widgetClass("orderStatus")}`}>
            <div className="dash-pro-panel-head">
              <h3>État des commandes</h3>
              <strong>{chartStats.ordersCount}</strong>
            </div>

            <div className="dash-pro-donut">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Payées",
                        value: chartStats.paidOrdersCount,
                        color: "#22c55e",
                      },
                      {
                        name: "En attente",
                        value: chartStats.pendingCount,
                        color: "#f59e0b",
                      },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={64}
                    outerRadius={90}
                    paddingAngle={5}
                  >
                    {[
                      {
                        name: "Payées",
                        color: "#22c55e",
                      },
                      {
                        name: "En attente",
                        color: "#f59e0b",
                      },
                    ].map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltip} />
                </PieChart>
              </ResponsiveContainer>

              <div className="dash-pro-donut-center">
                <strong>{chartStats.ordersCount}</strong>
                <span>commandes</span>
              </div>
            </div>

            <div className="dash-pro-legend">
              {[
                {
                  name: "Payées",
                  value: chartStats.paidOrdersCount,
                  color: "#22c55e",
                },
                {
                  name: "En attente",
                  value: chartStats.pendingCount,
                  color: "#f59e0b",
                },
              ].map((entry) => (
                <div key={entry.name}>
                  <span
                    style={{ background: entry.color }}
                  />
                  <small>{entry.name}</small>
                  <strong>{entry.value}</strong>
                </div>
              ))}
            </div>
          </article>
          )}
          </div>
        </section>
      )}

      {showOperations && (
        <section className="dash-pro-section">
          <SectionHead title="Opérations" />
          <div className="dash-pro-metrics">
            {showWidget("shipped") && (
              <MetricCard
                label="Expédiées"
                value={k.shippedCount}
                detail="Commandes"
                tone="cyan"
                className={widgetClass("shipped")}
                href="/admin/logistics"
              />
            )}
          </div>

          {(showWidget("operationsProgress") ||
            showWidget("operationsChart")) && (
          <div
            className={`dash-pro-operations-grid ${
              showWidget("operationsProgress") !==
              showWidget("operationsChart")
                ? "single"
                : ""
            }`}
          >
          {showWidget("operationsProgress") && (
            <article className={`dash-pro-panel ${widgetClass("operationsProgress")}`}>
            <div className="dash-pro-panel-head">
              <h3>Progression</h3>
            </div>

            <div className="dash-pro-progress-list">
              {operations.map((item) => (
                <div
                  className={`dash-pro-progress tone-${item.tone}`}
                  key={item.label}
                >
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                  <div className="dash-pro-progress-track">
                    <span
                      style={{
                        width: `${Math.max(
                          item.value
                            ? (item.value / item.max) * 100
                            : 0,
                          item.value ? 8 : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
          )}

          {showWidget("operationsChart") && (
            <article className={`dash-pro-panel ${widgetClass("operationsChart")}`}>
            <div className="dash-pro-panel-head">
              <h3>Volumes</h3>
            </div>

            <div className="dash-pro-chart dash-pro-chart-small">
              <ResponsiveContainer>
                <BarChart
                  data={operations.map((item) => ({
                    name: item.label,
                    value: item.value,
                  }))}
                >
                  <CartesianGrid
                    stroke="rgba(148,163,184,.1)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#7f91a8", fontSize: 10 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#7f91a8", fontSize: 10 }}
                  />
                  <Tooltip contentStyle={chartTooltip} />
                  <Bar
                    dataKey="value"
                    fill="#22d3ee"
                    radius={[8, 8, 2, 2]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
          )}
          </div>
          )}
        </section>
      )}

      {showStore && (
        <section className="dash-pro-section">
          <SectionHead title="Boutique" />
          <div className="dash-pro-health-grid">
            {showWidget("products") && (
              <MetricCard label="Produits" value={k.productsCount} detail="Total" tone="violet" href="/admin/products" className={widgetClass("products")} />
            )}
            {showWidget("activeProducts") && (
              <MetricCard label="Produits actifs" value={k.activeProducts} detail="Actifs" tone="green" href="/admin/products" className={widgetClass("activeProducts")} />
            )}
            {showWidget("payments") && (
              <MetricCard label="Paiements" value={k.paymentMethodsCount} detail="Méthodes" tone="blue" href="/admin/payment-methods" className={widgetClass("payments")} />
            )}
            {showWidget("activePayments") && (
              <MetricCard label="Paiements actifs" value={k.activePaymentMethods} detail="Actifs" tone="green" href="/admin/payment-methods" className={widgetClass("activePayments")} />
            )}
            {showWidget("shipping") && (
              <MetricCard label="Livraison" value={k.shippingMethodsCount} detail="Méthodes" tone="cyan" href="/admin/shipping" className={widgetClass("shipping")} />
            )}
            {showWidget("countries") && (
              <MetricCard label="Pays" value={k.adminCountriesCount} detail="Disponibles" tone="cyan" href="/admin/shipping" className={widgetClass("countries")} />
            )}
            {showWidget("reviews") && (
              <MetricCard label="Avis" value={k.reviewsCount} detail="Total" tone="orange" href="/admin/reviews" className={widgetClass("reviews")} />
            )}
            {showWidget("approvedReviews") && (
              <MetricCard label="Avis publiés" value={k.approvedReviews} detail="Publiés" tone="green" href="/admin/reviews" className={widgetClass("approvedReviews")} />
            )}
            {showWidget("pendingReviews") && (
              <MetricCard label="Avis à modérer" value={k.pendingReviews} detail="En attente" tone="orange" href="/admin/reviews" className={widgetClass("pendingReviews")} />
            )}
          </div>
        </section>
      )}

      {showWidget("lastOrders") && (
        <section className="dash-pro-section">
          <SectionHead title="Dernières commandes" />
          <article className={`dash-pro-panel dash-pro-orders-list ${widgetClass("lastOrders")}`}>
            {lastOrders.length === 0 ? (
              <div className="dash-pro-inline-empty">
                Aucune commande
              </div>
            ) : lastOrders.slice(0, 6).map((order) => (
              <Link
                href={`/admin/orders?open=${encodeURIComponent(order.id)}`}
                key={order.id}
                className="dash-pro-order-row"
              >
                <div>
                  <strong>{order.orderNumber || order.id.slice(0, 6)}</strong>
                  <span>{order.email || "Client"}</span>
                </div>
                <span className={`dash-pro-status status-${order.status}`}>
                  {statusLabel(order.status)}
                </span>
                <strong>{eur(order.total)}</strong>
                <time>{shortDate(order.createdAt)}</time>
              </Link>
            ))}
          </article>
        </section>
      )}
    </div>
  );
}
