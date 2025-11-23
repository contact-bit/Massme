"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================
   EXPORT — Type public utilisé dans checkout
============================================================ */
export type RelayPoint = {
  name: string;
  address: string;
  address2?: string | null;
  city: string;
  postalCode: string;
  country: string;
  latitude?: string | null;
  longitude?: string | null;
  raw?: any;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function RelayPointInline({
  onSelect,
}: {
  onSelect: (relay: RelayPoint) => void;
}) {
  const [selectedPoint, setSelectedPoint] = useState<RelayPoint | null>(null);
  const initialized = useRef(false);

  /* ============================================================
     LOAD MONDIAL RELAY WIDGET
  ============================================================ */
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const loadScript = (src: string) =>
      new Promise<void>((resolve) => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => resolve();
        document.body.appendChild(s);
      });

    const init = async () => {
      await loadScript("https://code.jquery.com/jquery/3.6.4.min.js");
      await loadScript("https://unpkg.com/leaflet/dist/leaflet.js");
      await loadScript(
        "https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js"
      );

      (window as any).jQuery("#mr-list").MR_ParcelShopPicker({
        Target: "#mr-target",
        Brand: "CC23PDX2",
        Country: "FR",
        ColLivMod: "24R",

        OnParcelShopSelected(data: any) {
          const relay: RelayPoint = {
            name: data.Nom,
            address: data.Adresse1,
            address2: data.Adresse2 || null,
            city: data.Ville,
            postalCode: data.CP,
            country: data.Pays,
            latitude: data.Latitude,
            longitude: data.Longitude,
            raw: data,
          };

          setSelectedPoint(relay);
          updateMap(relay);
        },
      });
    };

    init();
  }, []);

  /* ============================================================
     LEAFLET MAP SETUP
  ============================================================ */
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const marker = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const interval = setInterval(() => {
      if ((window as any).L) {
        const L = (window as any).L;

        mapInstance.current = L.map(mapRef.current).setView(
          [48.8566, 2.3522],
          10
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
        }).addTo(mapInstance.current);

        marker.current = L.marker([48.8566, 2.3522]).addTo(
          mapInstance.current
        );

        clearInterval(interval);
      }
    }, 300);
  }, []);

  /* ============================================================
     UPDATE MAP WHEN USER SELECTS A RELAY POINT
  ============================================================ */
  function updateMap(relay: RelayPoint) {
    if (!mapInstance.current || !marker.current) return;
    if (!relay.latitude || !relay.longitude) return;

    const lat = parseFloat(relay.latitude);
    const lng = parseFloat(relay.longitude);

    mapInstance.current.setView([lat, lng], 16);
    marker.current.setLatLng([lat, lng]);
  }

  /* ============================================================
     RENDER UI
  ============================================================ */
  return (
    <div className="mr-wrapper mt-4">
      <h3 className="mr-title">Choisissez votre point Mondial Relay</h3>

      <div className="mr-grid">
        {/* LISTE IMPLÉMENTÉE PAR LE WIDGET */}
        <div id="mr-list" className="mr-list"></div>

        {/* CARTE LEAFLET */}
        <div className="mr-map" ref={mapRef}></div>
      </div>

      {/* CONFIRMATION PRO (affiché uniquement si point sélectionné) */}
      {selectedPoint && (
        <div className="mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50">
          <h4 className="font-semibold text-lg text-blue-900 mb-1">
            Point relais sélectionné ✓
          </h4>

          <p className="font-medium text-blue-900">{selectedPoint.name}</p>
          <p className="text-blue-900/80">{selectedPoint.address}</p>
          {selectedPoint.address2 && (
            <p className="text-blue-900/80">{selectedPoint.address2}</p>
          )}
          <p className="text-blue-900/80">
            {selectedPoint.postalCode} {selectedPoint.city}
          </p>

          <button
            onClick={() => onSelect(selectedPoint)}
            className="
              mt-4 w-full
              bg-blue-600 text-white font-semibold
              py-3 rounded-xl
              transition-all duration-200
              hover:bg-blue-700 active:bg-blue-800
              shadow-sm hover:shadow-md
            "
          >
            Confirmer ce point de retrait
          </button>
        </div>
      )}
    </div>
  );
}
