"use client";

import { useEffect, useMemo } from "react";
import { useOrders } from "../orders/hooks/useOrders";
import { useToast } from "../orders/hooks/useToast";
import { Toast } from "../orders/components/Toast";
import { getLogisticStatus } from "../orders/domain/logistics";
import LogisticsList from "./LogisticsList";

export default function LogisticsPage() {
  const { toast, toastIt } = useToast();
  const { orders, loading, error, initOnce } = useOrders(toastIt);

  useEffect(() => {
    initOnce();
  }, [initOnce]);

  const toPrepareCount = useMemo(
    () => orders.filter((o) => getLogisticStatus(o) === "to_prepare").length,
    [orders]
  );

  const shippedCount = useMemo(
    () => orders.filter((o) => getLogisticStatus(o) === "shipped").length,
    [orders]
  );

  return (
    <>
      <Toast message={toast} />

      <div
        style={{
          minHeight: "100vh",
          background: "#F6F7F9",
          padding: 20,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gap: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              padding: 20,
              display: "grid",
              gap: 14,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                📦 Préparation commandes
              </h1>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#6B7280",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                Suivi des commandes à préparer et des commandes déjà expédiées.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              <div
                style={{
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  À préparer
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {toPrepareCount}
                </div>
              </div>

              <div
                style={{
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  Expédiées
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {shippedCount}
                </div>
              </div>

              <div
                style={{
                  background: "#111827",
                  color: "#fff",
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.72)",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  Total affiché
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 26,
                    fontWeight: 800,
                  }}
                >
                  {orders.length}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
            }}
          >
            <LogisticsList
              orders={orders}
              loading={loading}
              error={error}
              toastIt={toastIt}
            />
          </div>
        </div>
      </div>
    </>
  );
}