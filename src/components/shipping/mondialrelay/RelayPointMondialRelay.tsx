"use client";

import { useEffect, useRef, useState } from "react";
import type { RelayPoint } from "@/components/shipping/types";
import type { Locale } from "@/lib/i18n";

type Props = {
  onSelect: (relay: RelayPoint) => void;
  country: string;
  locale: Locale;
};

/* ============================================================
   Composant Mondial Relay INLINE
============================================================ */
export default function RelayPointMondialRelay({
  onSelect,
  country,
  locale,
}: Props) {
  const [selectedPoint, setSelectedPoint] = useState<RelayPoint | null>(null);

  const initialized = useRef(false);

  // refs Leaflet
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const marker = useRef<any>(null);

  /* ============================================================
     Chargement scripts + init widget + init carte
  ============================================================ */
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          return resolve();
        }

        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Échec chargement script: ${src}`));
        document.body.appendChild(s);
      });

    const loadLeafletCss = () => {
      if (document.querySelector('link[data-leaflet-css="true"]')) return;

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet/dist/leaflet.css";
      link.setAttribute("data-leaflet-css", "true");
      document.head.appendChild(link);
    };

    const init = async () => {
      try {
        loadLeafletCss();

        // 1) jQuery + Leaflet + widget
        await loadScript("https://code.jquery.com/jquery-3.6.4.min.js");
        await loadScript("https://unpkg.com/leaflet/dist/leaflet.js");
        await loadScript(
          "https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js"
        );

        const $ = (window as any).jQuery;
        const L = (window as any).L;

        if (!$ || !$.fn || !$.fn.MR_ParcelShopPicker) {
          console.error("❌ MR_ParcelShopPicker introuvable");
          return;
        }
        if (!L) {
          console.error("❌ Leaflet (window.L) introuvable");
          return;
        }

        // 2) Init Leaflet sur ta div carte
        if (mapRef.current && !mapInstance.current) {
          mapInstance.current = L.map(mapRef.current).setView(
            [48.8566, 2.3522], // centre par défaut
            10
          );

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap",
          }).addTo(mapInstance.current);

          marker.current = L.marker([48.8566, 2.3522]).addTo(
            mapInstance.current
          );
        }

        // 3) Init du widget Mondial Relay (liste)
        $("#mr-list").MR_ParcelShopPicker({
          Target: "#mr-target",
          Brand: "CC23PDX2",
          Country: country || "FR",
          ColLivMod: "24R",

          OnParcelShopSelected(data: any) {
            const relay: RelayPoint = {
              id: data.ID || data.Num || "",
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

            if (
              mapInstance.current &&
              marker.current &&
              relay.latitude &&
              relay.longitude
            ) {
              const lat = parseFloat(String(relay.latitude));
              const lng = parseFloat(String(relay.longitude));

              mapInstance.current.setView([lat, lng], 16);
              marker.current.setLatLng([lat, lng]);
            }
          },
        });
      } catch (err) {
        console.error("❌ Erreur init Mondial Relay :", err);
      }
    };

    init();

    // Cleanup
    return () => {
      try {
        if (mapInstance.current) {
          mapInstance.current.remove();
        }
      } catch {}
      mapInstance.current = null;
      marker.current = null;
    };
  }, [country, locale]);

  /* ============================================================
     UI
  ============================================================ */
  return (
    <div className="mr-wrapper mt-4">
      <h3 className="mr-title">Choisissez votre point Mondial Relay</h3>

      <div className="mr-grid">
        {/* Liste injectée par le widget */}
        <div id="mr-list" className="mr-list" />

        {/* Carte Leaflet custom */}
        <div className="mr-map" ref={mapRef} />
      </div>

      {/* Target caché utilisé par le widget */}
      <input type="hidden" id="mr-target" />

      {/* Bloc de confirmation UX propre */}
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
