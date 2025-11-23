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

  /* ========================================
     🧱 Lock / unlock scroll du body
  ========================================= */
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  /* ========================================
     🔥 CHARGEMENT DU WIDGET MONDIAL RELAY
  ========================================= */
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

      // Petit fix Leaflet au cas où (ne casse rien si inutile)
      setTimeout(() => {
        document.querySelectorAll(".leaflet-container").forEach((el) => {
          try {
            (window as any).L?.map(el)?.invalidateSize();
          } catch {}
        });
      }, 400);
    };

    load();
  }, []);

  return (
    // overlay scrollable si contenu > viewport
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center overflow-y-auto">
      {/* WRAPPER MODAL */}
      <div className="mr-modal bg-white p-6 rounded-2xl w-[90%] max-w-2xl relative shadow-xl">

        <h2 className="text-xl font-bold mb-4 text-center">
          Choisir un point Mondial Relay
        </h2>

        {/* Zone du widget */}
        <div className="flex justify-center">
          <div
            id="mr-zone"
            style={{
              width: "100%",
              maxWidth: "700px",
              // hauteur gérée par le CSS via max-height + scroll
              margin: "0 auto",
            }}
          ></div>
        </div>

        {/* POINT SELECTIONNÉ */}
        {selectedPoint && (
          <div className="mt-4 p-3 border rounded bg-gray-50 text-center">
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
