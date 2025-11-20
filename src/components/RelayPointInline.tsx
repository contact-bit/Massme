"use client";

import { useEffect, useState } from "react";

export default function TestMRModal({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      const loadScript = (src) =>
        new Promise((res) => {
          const s = document.createElement("script");
          s.src = src;
          s.onload = res;
          document.body.appendChild(s);
        });

      await loadScript("https://code.jquery.com/jquery-3.6.4.min.js");
      await loadScript("https://unpkg.com/leaflet/dist/leaflet.js");
      await loadScript(
        "https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js"
      );

      window.jQuery("#mr-zone").MR_ParcelShopPicker({
        Target: "#mr-target",
        Brand: "CC23PDX2",
        Country: "FR",
        ColLivMod: "24R",

        // Quand un point est cliqué
        OnParcelShopSelected: function (data) {
          setSelectedPoint(data);
        }
      });
    };

    load();
  }, [open]);

  return (
    <div>
      {/* Bouton ouverture */}
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-black text-white rounded-md"
      >
        Choisir un point relais
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-3xl rounded-lg shadow-xl p-4 relative">

            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-3">Sélectionner un point relais</h2>

            {/* Widget MR */}
            <div id="mr-zone" className="mr-zone"></div>
            <input type="hidden" id="mr-target" />

            {/* Détails du point */}
            {selectedPoint && (
              <div className="mt-4 p-3 border rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-1">Point sélectionné :</h3>

                <p className="text-sm text-gray-700">
                  <strong>{selectedPoint.Nom}</strong><br />
                  {selectedPoint.Adresse1}<br />
                  {selectedPoint.Adresse2 && <>{selectedPoint.Adresse2}<br /></>}
                  {selectedPoint.CP} {selectedPoint.Ville}
                </p>

                {/* Bouton renvoi */}
                <button
                  onClick={() => {
                    onSelect(selectedPoint);
                    setOpen(false);
                  }}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Sélectionner ce point relais
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
