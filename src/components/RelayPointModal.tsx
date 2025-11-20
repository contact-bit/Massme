"use client";

import { useEffect } from "react";

export default function RelayPointModal({ onClose, onSelect }: any) {
  useEffect(() => {
    console.log("📦 Chargement du widget Mondial Relay…");

    const jquery = document.createElement("script");
    jquery.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js";
    jquery.async = true;

    const leaflet = document.createElement("script");
    leaflet.src = "https://unpkg.com/leaflet/dist/leaflet.js";
    leaflet.async = true;

    const leafletCss = document.createElement("link");
    leafletCss.rel = "stylesheet";
    leafletCss.href = "https://unpkg.com/leaflet/dist/leaflet.css";

    const widget = document.createElement("script");
    widget.src = "https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js";
    widget.async = true;

    document.head.appendChild(leafletCss);
    document.body.appendChild(jquery);

    jquery.onload = () => {
      document.body.appendChild(leaflet);
      leaflet.onload = () => {
        document.body.appendChild(widget);

        widget.onload = () => {
          console.log("🟢 Widget MR prêt !");

          (window as any).$("#Zone_Widget").MR_ParcelShopPicker({
            Target: "#Target_Widget",
            Brand: "CC23PDX2",
            Country: "FR",

            OnParcelShopSelected: (data: any) => {
              console.log("📦 Point relais sélectionné :", data);
              onSelect(data); // On renvoie le point au parent
              onClose();      // Fermeture modal
            }
          });
        };
      };
    };

    return () => {
      console.log("🔵 Cleanup Mondial Relay");
      leafletCss.remove();
      jquery.remove();
      leaflet.remove();
      widget.remove();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-xl w-full relative">

        <button onClick={onClose} className="absolute right-3 top-3 text-xl">
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4">Choisir un point relais Mondial Relay</h2>

        <div id="Zone_Widget" style={{ height: "500px" }}></div>
        <input type="hidden" id="Target_Widget" />

      </div>
    </div>
  );
}
