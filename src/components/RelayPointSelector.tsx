"use client";

import { useState } from "react";

export default function RelayPointSelector({ onSelect }: any) {
  const [cp, setCp] = useState("");
  const [points, setPoints] = useState([]);

  const search = async () => {
    const res = await fetch("/api/mondial-relay/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cp }),
    });

    const data = await res.json();
    setPoints(data.results || []);
  };

  return (
    <div>
      <input
        placeholder="Code postal"
        value={cp}
        onChange={(e) => setCp(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <button
        onClick={search}
        className="mt-3 w-full bg-black text-white p-2 rounded"
      >
        Rechercher
      </button>

      <div className="mt-4 space-y-2">
        {points.length === 0 && cp.length >= 4 && (
          <p className="text-sm text-gray-500">Aucun point relais trouvé.</p>
        )}

        {points.map((p: any) => (
          <div
            key={p.ID}
            onClick={() => onSelect(p)}
            className="border p-3 rounded cursor-pointer hover:bg-gray-100"
          >
            <p className="font-semibold">{p.Nom}</p>
            <p>{p.Adresse1}</p>
            <p>
              {p.CP} {p.Ville}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
