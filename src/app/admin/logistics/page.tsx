"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "../orders/hooks/useToast";
import { useOrders } from "../orders/hooks/useOrders";
import type { Order, ShippingStatus } from "../orders/domain/types";
import { compactId, copyText, formatAddress } from "../orders/domain/utils";
import { Toast } from "../orders/components/Toast";

type LogisticsFilter = "all" | ShippingStatus;
type SourceFilter = "all" | "shipstation" | "manual";
type LogisticsProvider = "internal" | "shipstation";

function getEffectiveShippingStatus(order: Order): ShippingStatus {
  const raw = String(order.shippingStatus || "").toLowerCase();

  if (
    raw === "pending" ||
    raw === "preparing" ||
    raw === "shipped" ||
    raw === "delivered" ||
    raw === "cancelled"
  ) {
    return raw;
  }

  const fulfillmentStatus = String((order as any)?.fulfillment?.status || "").toLowerCase();
  if (fulfillmentStatus === "preparing") return "preparing";
  if (fulfillmentStatus === "shipped") return "shipped";

  return "pending";
}

function getTrackingNumber(order: Order): string | null {
  const direct = order.trackingNumber;
  const shippingTracking = (order as any)?.shippingTracking?.trackingNumber;
  const fulfillmentTracking = (order as any)?.fulfillment?.tracking?.trackingNumber;

  return direct || shippingTracking || fulfillmentTracking || null;
}

function getCarrier(order: Order): string | null {
  const direct = order.carrier;
  const shippingTracking = (order as any)?.shippingTracking?.carrier;
  const fulfillmentTracking = (order as any)?.fulfillment?.tracking?.carrier;

  return direct || shippingTracking || fulfillmentTracking || null;
}

function hasShipStationLink(order: Order): boolean {
  return !!(
    (order as any)?.fulfillment?.shipstation?.orderId ||
    (order as any)?.fulfillment?.shipstation?.orderKey ||
    (order as any)?.shipstation?.lastWebhookAt
  );
}

function getShippingSource(order: Order): "shipstation" | "manual" {
  return hasShipStationLink(order) ? "shipstation" : "manual";
}

function statusLabel(status: ShippingStatus) {
  switch (status) {
    case "pending":
      return "En attente";
    case "preparing":
      return "Préparation";
    case "shipped":
      return "Expédiée";
    case "delivered":
      return "Livrée";
    case "cancelled":
      return "Annulée";
    default:
      return status;
  }
}

function statusColor(status: ShippingStatus) {
  switch (status) {
    case "pending":
      return { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" };
    case "preparing":
      return { bg: "#FFF7ED", color: "#9A3412", border: "#FED7AA" };
    case "shipped":
      return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
    case "delivered":
      return { bg: "#ECFDF5", color: "#047857", border: "#A7F3D0" };
    case "cancelled":
      return { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" };
    default:
      return { bg: "#F9FAFB", color: "#374151", border: "#E5E7EB" };
  }
}

function sourceLabel(source: "shipstation" | "manual") {
  return source === "shipstation" ? "ShipStation" : "Interne";
}

function sourceColor(source: "shipstation" | "manual") {
  return source === "shipstation"
    ? { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE" }
    : { bg: "#F9FAFB", color: "#374151", border: "#E5E7EB" };
}

function formatDate(value: unknown) {
  try {
    const d =
      value instanceof Date
        ? value
        : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;

    if (!d || Number.isNaN(d.getTime())) return "—";

    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return "—";
  }
}

function baseButtonStyle() {
  return {
    borderRadius: 10,
    padding: "9px 12px",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700 as const,
    transition: "all 0.15s ease",
  };
}

function neutralButton() {
  return {
    ...baseButtonStyle(),
    border: "1px solid #D1D5DB",
    background: "#FFFFFF",
    color: "#111827",
  };
}

function primaryButton() {
  return {
    ...baseButtonStyle(),
    border: "1px solid #111827",
    background: "#111827",
    color: "#FFFFFF",
  };
}

function subtleButton() {
  return {
    ...baseButtonStyle(),
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    color: "#111827",
  };
}

function dangerButton() {
  return {
    ...baseButtonStyle(),
    border: "1px solid #FECACA",
    background: "#FFF1F2",
    color: "#B91C1C",
  };
}

function disabledDarkButton() {
  return {
    ...baseButtonStyle(),
    border: "1px solid #111827",
    background: "#6B7280",
    color: "#FFFFFF",
    cursor: "not-allowed",
  };
}

function pillStyle(bg: string, color: string, border: string) {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${border}`,
    background: bg,
    color,
    fontSize: 12,
    fontWeight: 700 as const,
    lineHeight: 1,
  };
}

function sectionCardStyle() {
  return {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 18,
  };
}

function detailLabelStyle() {
  return {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
    fontWeight: 700 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.03em",
  };
}

export default function AdminLogisticsPage() {
  const router = useRouter();
  const { toast, toastIt } = useToast();
  const { orders, loading, error, fetchOrders, initOnce, updateShippingStatus } = useOrders(toastIt);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<LogisticsFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [pushingId, setPushingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [provider, setProvider] = useState<LogisticsProvider>("internal");
  const [providerLoading, setProviderLoading] = useState(true);
  const [providerSaving, setProviderSaving] = useState(false);

  useEffect(() => {
    initOnce();
  }, [initOnce]);

  useEffect(() => {
    loadProvider();
  }, []);

  async function loadProvider() {
    const pass = localStorage.getItem("admin_password") || "";
    if (!pass) {
      window.location.href = "/admin/login";
      return;
    }

    try {
      setProviderLoading(true);

      const res = await fetch("/api/admin/logistics/settings", {
        headers: { "x-admin-password": pass },
        cache: "no-store",
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }

      setProvider(json.provider === "shipstation" ? "shipstation" : "internal");
    } catch {
      toastIt("Erreur chargement réglages logistiques ❌");
    } finally {
      setProviderLoading(false);
    }
  }

  async function updateProvider(nextProvider: LogisticsProvider) {
    const pass = localStorage.getItem("admin_password") || "";
    if (!pass) {
      window.location.href = "/admin/login";
      return;
    }

    try {
      setProviderSaving(true);

      const res = await fetch("/api/admin/logistics/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pass,
        },
        body: JSON.stringify({ provider: nextProvider }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }

      setProvider(json.provider === "shipstation" ? "shipstation" : "internal");
      toastIt(
        nextProvider === "shipstation"
          ? "ShipStation activé ✅"
          : "Logistique interne activée ✅"
      );
    } catch (e: any) {
      toastIt("Erreur mise à jour provider logistique ❌");
      alert(e?.message || "Erreur mise à jour provider logistique");
    } finally {
      setProviderSaving(false);
    }
  }

  const showShipStationUi = provider === "shipstation";

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();

    return orders
      .filter((order) => {
        const status = getEffectiveShippingStatus(order);
        const source = getShippingSource(order);

        if (statusFilter !== "all" && status !== statusFilter) return false;
        if (showShipStationUi && sourceFilter !== "all" && source !== sourceFilter) return false;

        if (!term) return true;

        const haystack = [
          order.id,
          order.__email,
          order.email,
          order.shippingMethod?.name,
          getTrackingNumber(order),
          getCarrier(order),
          order.shippingAddress?.firstName,
          order.shippingAddress?.lastName,
          order.shippingAddress?.city,
          order.shippingAddress?.postalCode,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(term);
      })
      .sort((a, b) => {
        const da = a.__created ? a.__created.getTime() : 0;
        const db = b.__created ? b.__created.getTime() : 0;
        return db - da;
      });
  }, [orders, q, statusFilter, sourceFilter, showShipStationUi]);

  useEffect(() => {
    if (!rows.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId) {
      setSelectedId(rows[0].id);
      return;
    }
    if (!rows.some((row) => row.id === selectedId)) {
      setSelectedId(rows[0].id);
    }
  }, [rows, selectedId]);

  const selectedOrder = useMemo(
    () => rows.find((o) => o.id === selectedId) || null,
    [rows, selectedId]
  );

  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((o) => getEffectiveShippingStatus(o) === "pending").length;
    const preparing = rows.filter((o) => getEffectiveShippingStatus(o) === "preparing").length;
    const shipped = rows.filter((o) => getEffectiveShippingStatus(o) === "shipped").length;
    const delivered = rows.filter((o) => getEffectiveShippingStatus(o) === "delivered").length;

    return { total, pending, preparing, shipped, delivered };
  }, [rows]);

  async function handlePushToShipStation(order: Order) {
    const pass = localStorage.getItem("admin_password") || "";
    if (!pass) {
      window.location.href = "/admin/login";
      return;
    }

    try {
      setPushingId(order.id);

      const res = await fetch("/api/shipstation/push-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pass,
        },
        body: JSON.stringify({ orderId: order.id }),
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(json?.message || json?.error || text || `HTTP ${res.status}`);
      }

      toastIt("Commande envoyée à ShipStation ✅");
      await fetchOrders();
    } catch (e: any) {
      toastIt("Erreur envoi ShipStation ❌");
      alert(e?.message || "Erreur envoi ShipStation");
    } finally {
      setPushingId(null);
    }
  }

  return (
    <>
      <Toast message={toast} />

      <div
        style={{
          padding: 24,
          background: "#F6F7F9",
          minHeight: "100vh",
        }}
      >
        <div style={{ display: "grid", gap: 18 }}>
          <section style={{ ...sectionCardStyle(), padding: 22 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 30,
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  📦 Logistique
                </h1>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: "#6B7280",
                    fontSize: 14,
                    lineHeight: 1.5,
                    maxWidth: 720,
                  }}
                >
                  Tableau de pilotage des expéditions, du suivi colis et de l’orchestration logistique.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => fetchOrders()} style={neutralButton()}>
                  Actualiser
                </button>

                <button onClick={() => router.push("/admin/orders")} style={primaryButton()}>
                  Voir les commandes
                </button>
              </div>
            </div>
          </section>

          <section style={{ ...sectionCardStyle(), padding: 18 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Provider logistique global
                </div>

                <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
                  {providerLoading
                    ? "Chargement de la configuration…"
                    : provider === "shipstation"
                    ? "ShipStation pilote les envois quand tu l’utilises."
                    : "Le système logistique interne est actif. ShipStation est masqué et inactif."}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  disabled={providerLoading || providerSaving}
                  onClick={() => updateProvider("internal")}
                  style={provider === "internal" ? primaryButton() : neutralButton()}
                >
                  Interne
                </button>

                <button
                  disabled={providerLoading || providerSaving}
                  onClick={() => updateProvider("shipstation")}
                  style={provider === "shipstation" ? primaryButton() : neutralButton()}
                >
                  ShipStation
                </button>

                <span
                  style={{
                    ...pillStyle(
                      provider === "shipstation" ? "#EEF2FF" : "#ECFDF5",
                      provider === "shipstation" ? "#4338CA" : "#047857",
                      provider === "shipstation" ? "#C7D2FE" : "#A7F3D0"
                    ),
                  }}
                >
                  {providerLoading
                    ? "Chargement"
                    : provider === "shipstation"
                    ? "ShipStation actif"
                    : "Mode interne actif"}
                </span>
              </div>
            </div>
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {[
              { label: "Total commandes", value: stats.total },
              { label: "En attente", value: stats.pending },
              { label: "En préparation", value: stats.preparing },
              { label: "Expédiées", value: stats.shipped },
              { label: "Livrées", value: stats.delivered },
            ].map((card) => (
              <div key={card.label} style={{ ...sectionCardStyle(), padding: 16 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  {card.label}
                </div>

                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {card.value}
                </div>
              </div>
            ))}
          </section>

          <section style={{ ...sectionCardStyle(), padding: 16 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: showShipStationUi ? "2fr 1fr 1fr" : "2fr 1fr",
                gap: 12,
              }}
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher une commande, un client, une ville, un tracking…"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #D1D5DB",
                  background: "#FFFFFF",
                  outline: "none",
                }}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as LogisticsFilter)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #D1D5DB",
                  background: "#FFFFFF",
                }}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="preparing">Préparation</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>

              {showShipStationUi ? (
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #D1D5DB",
                    background: "#FFFFFF",
                  }}
                >
                  <option value="all">Toutes les sources</option>
                  <option value="shipstation">ShipStation</option>
                  <option value="manual">Interne</option>
                </select>
              ) : null}
            </div>
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: selectedOrder ? "1.6fr 1fr" : "1fr",
              gap: 18,
              alignItems: "start",
            }}
          >
            <div style={{ ...sectionCardStyle(), overflow: "hidden" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: showShipStationUi
                    ? "1.05fr 1.15fr 0.85fr 0.85fr 0.9fr"
                    : "1.05fr 1.2fr 0.95fr 1fr",
                  gap: 12,
                  padding: "14px 16px",
                  background: "#F9FAFB",
                  borderBottom: "1px solid #E5E7EB",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#6B7280",
                  textTransform: "uppercase",
                }}
              >
                <div>Commande</div>
                <div>Client</div>
                <div>Statut</div>
                {showShipStationUi ? <div>Source</div> : null}
                <div>Tracking</div>
              </div>

              {loading ? (
                <div style={{ padding: 18, color: "#6B7280" }}>Chargement…</div>
              ) : error ? (
                <div style={{ padding: 18, color: "crimson" }}>{error}</div>
              ) : rows.length === 0 ? (
                <div style={{ padding: 18, color: "#6B7280" }}>Aucune commande trouvée.</div>
              ) : (
                rows.map((order) => {
                  const status = getEffectiveShippingStatus(order);
                  const tracking = getTrackingNumber(order);
                  const carrier = getCarrier(order);
                  const source = getShippingSource(order);
                  const statusUi = statusColor(status);
                  const sourceUi = sourceColor(source);
                  const isSelected = selectedId === order.id;

                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedId(order.id)}
                      style={{
                        width: "100%",
                        display: "grid",
                        gridTemplateColumns: showShipStationUi
                          ? "1.05fr 1.15fr 0.85fr 0.85fr 0.9fr"
                          : "1.05fr 1.2fr 0.95fr 1fr",
                        gap: 12,
                        padding: "16px",
                        border: "none",
                        borderBottom: "1px solid #F3F4F6",
                        background: isSelected ? "#F9FAFB" : "#FFFFFF",
                        textAlign: "left",
                        alignItems: "start",
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, color: "#111827" }}>
                          {compactId(order.id)}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
                          {formatDate(order.__created)}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
                          {order.shippingMethod?.name || "—"}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontWeight: 700, color: "#111827" }}>
                          {order.__email || order.email || "—"}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
                          {[order.shippingAddress?.firstName, order.shippingAddress?.lastName]
                            .filter(Boolean)
                            .join(" ") || "—"}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
                          {[order.shippingAddress?.postalCode, order.shippingAddress?.city]
                            .filter(Boolean)
                            .join(" ") || "—"}
                        </div>
                      </div>

                      <div>
                        <span style={pillStyle(statusUi.bg, statusUi.color, statusUi.border)}>
                          {statusLabel(status)}
                        </span>
                      </div>

                      {showShipStationUi ? (
                        <div>
                          <span style={pillStyle(sourceUi.bg, sourceUi.color, sourceUi.border)}>
                            {sourceLabel(source)}
                          </span>
                        </div>
                      ) : null}

                      <div>
                        <div style={{ fontWeight: 700, color: "#111827" }}>
                          {tracking || "—"}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
                          {carrier || "—"}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {selectedOrder ? (
              <aside
                style={{
                  ...sectionCardStyle(),
                  padding: 18,
                  position: "sticky",
                  top: 24,
                }}
              >
                {(() => {
                  const status = getEffectiveShippingStatus(selectedOrder);
                  const tracking = getTrackingNumber(selectedOrder);
                  const carrier = getCarrier(selectedOrder);
                  const source = getShippingSource(selectedOrder);
                  const statusUi = statusColor(status);
                  const sourceUi = sourceColor(source);

                  return (
                    <div style={{ display: "grid", gap: 18 }}>
                      <div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>
                          Commande sélectionnée
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>
                          {compactId(selectedOrder.id)}
                        </div>
                        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={pillStyle(statusUi.bg, statusUi.color, statusUi.border)}>
                            {statusLabel(status)}
                          </span>
                          {showShipStationUi ? (
                            <span style={pillStyle(sourceUi.bg, sourceUi.color, sourceUi.border)}>
                              {sourceLabel(source)}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <div style={detailLabelStyle()}>Client</div>
                        <div style={{ color: "#111827", fontWeight: 700 }}>
                          {selectedOrder.__email || selectedOrder.email || "—"}
                        </div>
                        <div style={{ color: "#6B7280", marginTop: 6, fontSize: 13 }}>
                          {[selectedOrder.shippingAddress?.firstName, selectedOrder.shippingAddress?.lastName]
                            .filter(Boolean)
                            .join(" ") || "—"}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                          <button
                            onClick={async () => {
                              await copyText(selectedOrder.__email || selectedOrder.email || "");
                              toastIt("Email copié ✅");
                            }}
                            style={subtleButton()}
                          >
                            Copier email
                          </button>
                          <button
                            onClick={async () => {
                              await copyText(formatAddress(selectedOrder.shippingAddress));
                              toastIt("Adresse copiée ✅");
                            }}
                            style={subtleButton()}
                          >
                            Copier adresse
                          </button>
                        </div>
                      </div>

                      <div>
                        <div style={detailLabelStyle()}>Adresse de livraison</div>
                        <div
                          style={{
                            whiteSpace: "pre-line",
                            color: "#111827",
                            lineHeight: 1.6,
                            fontSize: 14,
                          }}
                        >
                          {formatAddress(selectedOrder.shippingAddress) || "—"}
                        </div>
                      </div>

                      <div>
                        <div style={detailLabelStyle()}>Transport</div>
                        <div style={{ color: "#111827", fontWeight: 700 }}>
                          {selectedOrder.shippingMethod?.name || "—"}
                        </div>
                        <div style={{ color: "#6B7280", marginTop: 6, fontSize: 13 }}>
                          Créée le {formatDate(selectedOrder.__created)}
                        </div>
                      </div>

                      <div>
                        <div style={detailLabelStyle()}>Tracking</div>
                        <div style={{ color: "#111827", fontWeight: 700 }}>
                          {tracking || "—"}
                        </div>
                        <div style={{ color: "#6B7280", marginTop: 6, fontSize: 13 }}>
                          {carrier || "—"}
                        </div>
                        {tracking ? (
                          <button
                            onClick={async () => {
                              await copyText(tracking);
                              toastIt("Tracking copié ✅");
                            }}
                            style={{ ...subtleButton(), marginTop: 10 }}
                          >
                            Copier tracking
                          </button>
                        ) : null}
                      </div>

                      {showShipStationUi ? (
                        <div>
                          <div style={detailLabelStyle()}>Infos ShipStation</div>
                          <div style={{ color: "#111827", fontSize: 14, lineHeight: 1.6 }}>
                            <div>
                              Order ID: {(selectedOrder as any)?.fulfillment?.shipstation?.orderId || "—"}
                            </div>
                            <div>
                              Order Key: {(selectedOrder as any)?.fulfillment?.shipstation?.orderKey || "—"}
                            </div>
                            <div>
                              Dernier webhook: {formatDate((selectedOrder as any)?.shipstation?.lastWebhookAt)}
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div>
                        <div style={detailLabelStyle()}>Actions rapides</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            onClick={() => updateShippingStatus(selectedOrder, "preparing")}
                            style={neutralButton()}
                          >
                            Préparer
                          </button>

                          <button
                            onClick={() => updateShippingStatus(selectedOrder, "shipped")}
                            style={neutralButton()}
                          >
                            Expédier
                          </button>

                          <button
                            onClick={() => updateShippingStatus(selectedOrder, "delivered")}
                            style={neutralButton()}
                          >
                            Livrer
                          </button>

                          <button
                            onClick={() => updateShippingStatus(selectedOrder, "cancelled")}
                            style={dangerButton()}
                          >
                            Annuler
                          </button>

                          {showShipStationUi ? (
                            <button
                              onClick={() => handlePushToShipStation(selectedOrder)}
                              disabled={pushingId === selectedOrder.id}
                              style={
                                pushingId === selectedOrder.id
                                  ? disabledDarkButton()
                                  : primaryButton()
                              }
                            >
                              {pushingId === selectedOrder.id ? "Envoi…" : "Push ShipStation"}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <button
                          onClick={() => router.push("/admin/orders")}
                          style={primaryButton()}
                        >
                          Ouvrir dans les commandes
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </aside>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}