"use client";

import { useState } from "react";
import { ShippingMethod, RelayPoint } from "@/components/shipping/types";
import RelayPointMondialRelay from "@/components/shipping/mondialrelay/RelayPointMondialRelay";

type Locale = "fr" | "en";

type Props = {
  methods: ShippingMethod[];
  onSelect: (m: ShippingMethod) => void;
  onRelayChosen: (relay: RelayPoint | null) => void;
  locale: Locale;
  error?: string | null;
};

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

  const t = {
    title: locale === "fr" ? "Méthode de livraison" : "Shipping method",
    chooseRelay:
      locale === "fr"
        ? "Choisir un point relais Mondial Relay"
        : "Choose a Mondial Relay pickup point",
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold mb-2 text-lg">{t.title}</h2>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {methods.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => selectMethod(m)}
          className={`w-full text-left border p-4 rounded-lg cursor-pointer transition ${
            selected?.id === m.id
              ? "border-blue-600 bg-blue-50"
              : "border-gray-300 bg-white"
          }`}
        >
          <p className="font-semibold">
            {m.name} — {m.price.toFixed(2)} €
          </p>
          <p className="text-sm text-gray-600">{m.delay}</p>

          {m.type === "relay" && (
            <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded mt-2 inline-block">
              {locale === "fr"
                ? "Point relais Mondial Relay"
                : "Mondial Relay pickup point"}
            </span>
          )}
        </button>
      ))}

      {selected?.type === "relay" && (
        <div className="border p-4 rounded-lg mt-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-2">{t.chooseRelay}</h3>

          {/* vrai widget Mondial Relay */}
          <RelayPointMondialRelay onSelect={handleRelayChosen} />

          {relayPoint && (
            <div className="mt-3 text-sm bg-gray-100 p-2 rounded">
              <p className="font-bold">{relayPoint.name}</p>
              <p>{relayPoint.address}</p>
              <p>
                {relayPoint.postalCode} {relayPoint.city}
              </p>
              {relayPoint.country && <p>{relayPoint.country}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
