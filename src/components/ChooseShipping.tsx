"use client";

import { useState } from "react";

export default function ChooseShipping({
  methods,
  onMethodSelect,
  onRelaySelect,
}: {
  methods: any[];
  onMethodSelect: (method: any) => void;
  onRelaySelect: (relay: any | null) => void;
}) {
  const [selectedMethod, setSelectedMethod] = useState<any | null>(null);
  const [relayPoint, setRelayPoint] = useState<any | null>(null);

  // ---- Sélection d'une méthode de livraison ----
  function selectMethod(method: any) {
    setSelectedMethod(method);
    onMethodSelect(method);

    // Si ce n'est pas un point relais → reset
    if (method.type !== "relay") {
      setRelayPoint(null);
      onRelaySelect(null);
    }
  }

  // ---- Sélection d'un point relais ----
  function chooseRelay(point: any) {
    setRelayPoint(point);
    onRelaySelect(point);
  }

  return (
    <div className="space-y-4">
      {/* TITLE */}
      <h2 className="font-semibold mb-2 text-lg">Méthode de livraison</h2>

      {/* LISTE DES MÉTHODES */}
      <div className="space-y-3">
        {methods.map((m) => (
          <div
            key={m.id}
            onClick={() => selectMethod(m)}
            className={`border p-4 rounded-lg cursor-pointer transition ${
              selectedMethod?.id === m.id
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-white"
            }`}
          >
            <p className="font-semibold">{m.name}</p>
            <p className="text-sm text-gray-600">{m.delay}</p>
            <p className="text-sm mt-1">{m.price.toFixed(2)} €</p>

            {m.type === "relay" && (
              <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded mt-2 inline-block">
                Mode : Point Relais ({m.relayProvider})
              </span>
            )}
          </div>
        ))}
      </div>

      {/* WIDGET POINT RELAIS */}
      {selectedMethod?.type === "relay" && (
        <div className="border p-4 rounded-lg mt-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-2">Choisir un point relais</h3>

          {/* Ici : FUTUR widget Mondial Relay / Pickup */}
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() =>
              chooseRelay({
                id: "DEMO123",
                name: "Relais Pickup – Maison de la Presse",
                address: "12 rue du Général Leclerc",
                city: "Paris",
                postalCode: "75010",
              })
            }
          >
            Choisir un point relais (démo)
          </button>

          {/* RÉSULTAT */}
          {relayPoint && (
            <div className="mt-3 text-sm bg-gray-100 p-3 rounded">
              <p className="font-bold">{relayPoint.name}</p>
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
