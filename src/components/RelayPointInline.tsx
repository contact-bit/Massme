"use client";

import { useEffect, useState } from "react";

type RelayInlineProps = {
  onSelect: (relay: any) => void;
};

export default function RelayPointInline({ onSelect }: RelayInlineProps) {
  const [open, setOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  useEffect(() => {
    if (!open) return;

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

      (window as any).jQuery("#mr-inline").MR_ParcelShopPicker({
        Target: "#mr-target",
        Brand: "CC23PDX2",
        Country: "FR",
        ColLivMod: "24R",

        OnParcelShopSelected(data: any) {
          const normalized = {
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
  }, [open]);

  return (
    <div>
      <button
        className="checkout-button"
        onClick={() => setOpen(true)}
      >
        Choisir un point Mondial Relay
      </button>

      {open && (
        <div id="mr-inline" style={{ height: "450px", marginTop: "20px" }}></div>
      )}

      {selectedPoint && (
        <div className="p-3 mt-3 bg-blue-50 border rounded">
          <p className="font-semibold">{selectedPoint.name}</p>
          <p>{selectedPoint.address}</p>
          {selectedPoint.address2 && <p>{selectedPoint.address2}</p>}
          <p>{selectedPoint.postalCode} {selectedPoint.city}</p>

          <button
            className="checkout-button mt-3"
            onClick={() => onSelect(selectedPoint)}
          >
            Sélectionner ce point
          </button>
        </div>
      )}
    </div>
  );
}
