"use client";

import { useEffect, useState } from "react";

type RelayPoint = {
  name: string;
  address: string;
  address2?: string | null;
  city: string;
  postalCode: string;
  country: string;
  latitude?: string | null;
  longitude?: string | null;
  raw: any;
};

type TestMRModalProps = {
  onSelect: (relay: RelayPoint) => void;
};

export default function TestMRModal({ onSelect }: TestMRModalProps) {
  const [selectedPoint, setSelectedPoint] = useState<RelayPoint | null>(null);

  useEffect(() => {
    const load = async () => {
      const loadScript = (src: string) =>
        new Promise<void>((resolve) => {
          const s = document.createElement("script");
          s.src = src;
          s.onload = () => resolve();
          document.body.appendChild(s);
        });

      await loadScript("https://code.jquery.com/jquery-3.6.4.min.js");
      await loadScript("https://unpkg.com/leaflet/dist/leaflet.js");
      await loadScript(
        "https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js"
      );

      (window as any).jQuery("#mr-zone").MR_ParcelShopPicker({
        Target: "#mr-target",
        Brand: "CC23PDX2",
        Country: "FR",
        ColLivMod: "24R",

        OnParcelShopSelected(data: any) {
          const normalized: RelayPoint = {
            name: data.Nom,
            address: data.Adresse1,
            address2: data.Adresse2 || null,
            city: data.Ville,
            postalCode: data.CP,
            country: data.Pays || "FR",
            latitude: data.Latitude || null,
            longitude: data.Longitude || null,
            raw: data,
          };

          setSelectedPoint(normalized);
        },
      });
    };

    load();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full relative">

        <h2 className="text-xl font-bold mb-4">Choisir un point Mondial Relay</h2>

        <div id="mr-zone" style={{ height: "500px" }}></div>

        {selectedPoint && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <p className="font-semibold">{selectedPoint.name}</p>
            <p>{selectedPoint.address}</p>
            {selectedPoint.address2 && <p>{selectedPoint.address2}</p>}
            <p>
              {selectedPoint.postalCode} {selectedPoint.city}
            </p>

            <button
              onClick={() => onSelect(selectedPoint)}
              className="mt-3 checkout-button"
            >
              Sélectionner ce point
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
