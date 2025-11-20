"use client";

import { useEffect, useState } from "react";

export default function ChooseShippingMethod({
  methods,
  onSelect,
  onRelayChosen,
}: {
  methods: any[];
  onSelect: (m: any) => void;
  onRelayChosen: (relay: any) => void;
}) {
  const [selected, setSelected] = useState<any | null>(null);
  const [relayPoint, setRelayPoint] = useState<any | null>(null);

  function selectMethod(m: any) {
    setSelected(m);
    onSelect(m);

    // Reset relay choice
    if (m.type !== "relay") {
      setRelayPoint(null);
      onRelayChosen(null);
    }
  }

  function chooseRelay(point: any) {
    setRelayPoint(point);
    onRelayChosen(point);
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold mb-2 text-lg">Livraison</h2>

      {methods.map((m) => (
        <div
          key={m.id}
          onClick={() => selectMethod(m)}
          className={`border p-4 rounded-lg cursor-pointer ${
            selected?.id === m.id ? "border-blue-600" : "border-gray-300"
          }`}
        >
          <p className="font-semibold">{m.name}</p>
          <p className="text-sm text-gray-600">{m.delay}</p>
          <p className="text-sm mt-1">{m.price.toFixed(2)} €</p>

          {m.type === "relay" && (
            <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded mt-2 inline-block">
              Point relais ({m.relayProvider})
            </span>
          )}
        </div>
      ))}

      {/* SI MODE RELAIS → AFFICHER LE PICKER */}
      {selected?.type === "relay" && (
        <div className="border p-4 rounded-lg mt-4">
          <h3 className="font-semibold mb-2">Choisir un point relais</h3>

          {/* Ici tu peux brancher l’API réelle plus tard */}
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() =>
              chooseRelay({
                id: "123456",
                name: "Relais Pickup - Tabac Chez Paul",
                address: "12 rue du Général Leclerc",
                city: "Paris",
                postalCode: "75010",
              })
            }
          >
            Choisir un point relais (démo)
          </button>

          {relayPoint && (
            <div className="mt-3 text-sm bg-gray-100 p-2 rounded">
              <p>{relayPoint.name}</p>
              <p>{relayPoint.address}</p>
              <p>
                {relayPoint.postalCode} {relayPoint.city}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
