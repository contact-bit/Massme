"use client";

import { useState, useMemo } from "react";
import type { ShippingMethod, RelayPoint } from "@/components/shipping/types";
import RelayPointMondialRelay from "@/components/shipping/mondialrelay/RelayPointMondialRelay";

type Locale = "fr" | "en";

type Props = {
  methods: ShippingMethod[];
  onSelect: (m: ShippingMethod) => void;
  onRelayChosen: (relay: RelayPoint | null) => void;
  locale: Locale;
  error?: string | null;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function ChooseShippingMethod({
  methods,
  onSelect,
  onRelayChosen,
  locale,
  error,
}: Props) {
  const [selected, setSelected] = useState<ShippingMethod | null>(null);
  const [relayPoint, setRelayPoint] = useState<RelayPoint | null>(null);

  function selectMethod(m: ShippingMethod) {
    setSelected(m);
    onSelect(m);

    if (m.type !== "relay") {
      setRelayPoint(null);
      onRelayChosen(null);
    }
  }

  function handleRelayChosen(point: RelayPoint) {
    setRelayPoint(point);
    onRelayChosen(point);
  }

  function priceTTC(m: ShippingMethod) {
    if (!m.vatRate || m.vatRate <= 0) return m.priceHT;
    return round2(m.priceHT * (1 + m.vatRate / 100));
  }

  const t = {
    title: locale === "fr" ? "Méthode de livraison" : "Shipping method",
    relay:
      locale === "fr"
        ? "Point relais"
        : "Pickup point",
    chooseRelay:
      locale === "fr"
        ? "Choisir un point relais"
        : "Choose pickup point",
  };

  const orderedMethods = useMemo(
    () =>
      [...methods].sort(
        (a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)
      ),
    [methods]
  );

  return (
    <div className="wrap">

      <h2>{t.title}</h2>

      {error && <p className="error">{error}</p>}

      <div className="list">
        {orderedMethods.map((m) => {
          const isSelected = selected?.id === m.id;

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => selectMethod(m)}
              className={`card ${isSelected ? "active" : ""}`}
            >
              <div className="row">
                <div>
                  <p className="name">{m.name}</p>
                  <p className="delay">{m.delay}</p>
                </div>

                <div className="price">
                  {priceTTC(m).toFixed(2)}€
                </div>
              </div>

              <div className="meta">
                {m.priceHT.toFixed(2)}€ HT
                {m.vatRate ? ` • TVA ${m.vatRate}%` : ""}
              </div>

              {m.type === "relay" && (
                <div className="tag">{t.relay}</div>
              )}
            </button>
          );
        })}
      </div>

      {/* RELAY */}
      {selected?.type === "relay" && (
        <div className="relay-box">

          <h3>{t.chooseRelay}</h3>

          <RelayPointMondialRelay
            onSelect={handleRelayChosen}
            country={selected.country}
            locale={locale}
          />

          {relayPoint && (
            <div className="relay-selected">
              <strong>{relayPoint.name}</strong>
              <p>{relayPoint.address}</p>
              <p>
                {relayPoint.postalCode} {relayPoint.city}
              </p>
            </div>
          )}

        </div>
      )}

      <style jsx>{`

        .wrap {
          display: flex;
          flex-direction: column;
          gap: 20px;
          color: white;
        }

        h2 {
          font-size: 20px;
          font-weight: 600;
        }

        .error {
          color: #f87171;
          font-size: 14px;
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .card {
          padding: 16px;
          border-radius: 14px;

          background: rgba(15,23,42,0.6);
          backdrop-filter: blur(8px);

          border: 1px solid rgba(255,255,255,0.08);

          transition: 0.25s;
          cursor: pointer;
        }

        .card:hover {
          transform: translateY(-2px);
          border-color: rgba(59,130,246,0.5);
        }

        .card.active {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.25),
                      0 10px 30px rgba(37,99,235,0.3);
        }

        .row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .name {
          font-weight: 600;
        }

        .delay {
          font-size: 13px;
          color: #94a3b8;
        }

        .price {
          font-weight: 700;
          font-size: 16px;
        }

        .meta {
          font-size: 12px;
          color: #64748b;
          margin-top: 6px;
        }

        .tag {
          margin-top: 10px;
          font-size: 11px;
          background: rgba(139,92,246,0.2);
          color: #c4b5fd;
          padding: 4px 8px;
          border-radius: 999px;
          display: inline-block;
        }

        .relay-box {
          padding: 18px;
          border-radius: 16px;

          background: rgba(15,23,42,0.6);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .relay-selected {
          margin-top: 12px;
          font-size: 13px;

          background: rgba(255,255,255,0.05);
          padding: 10px;
          border-radius: 10px;
        }

      `}</style>
    </div>
  );
}