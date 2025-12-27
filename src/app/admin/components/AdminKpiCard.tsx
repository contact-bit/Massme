"use client";

export default function AdminKpiCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "primary" | "success" | "danger";
}) {
  return (
    <div className={`kpi-card ${tone}`}>
      <div className="kpi-top">
        <div className="kpi-label">{label}</div>
        <div className="kpi-dot" aria-hidden="true" />
      </div>
      <div className="kpi-value">{value}</div>
      {sub ? <div className="kpi-sub">{sub}</div> : null}
    </div>
  );
}
