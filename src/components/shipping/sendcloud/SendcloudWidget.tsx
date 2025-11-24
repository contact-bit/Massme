"use client";

import { useEffect, useRef } from "react";

export default function SendcloudWidget({
  onSelect,
  locale = "fr",
}: {
  onSelect: (data: any) => void;
  locale?: "fr" | "en";
}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const script = document.createElement("script");
    script.src = "https://panel.sendcloud.sc/api/v2/sdk/parcel-selector.min.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (!(window as any).Sendcloud) {
        console.error("❌ Sendcloud SDK introuvable");
        return;
      }

      const sc = new (window as any).Sendcloud.ParcelSelector();

      sc.init({
        apiKey: process.env.NEXT_PUBLIC_SENDCLOUD_API_KEY,
        country: locale === "fr" ? "FR" : "EN",
        locale: locale === "fr" ? "fr-FR" : "en-GB",

        // Où afficher le widget
        target: "#sendcloud-parcel-selector",

        // Restreindre aux pays FR (tu peux en ajouter)
        limitToCountries: ["FR"],

        onSelect: (data: any) => {
          console.log("📦 Sélection Sendcloud :", data);
          onSelect(data);
        },
      });
    };

    return () => {
      const selector = document.getElementById("sendcloud-parcel-selector");
      if (selector) selector.innerHTML = ""; // nettoyer DOM
    };
  }, [locale, onSelect]);

  return (
    <div className="mt-2">
      <h3 className="font-semibold mb-2">
        {locale === "fr"
          ? "Choisissez votre mode de livraison :"
          : "Choose your delivery method:"}
      </h3>

      {/* Container du widget */}
      <div id="sendcloud-parcel-selector" />
    </div>
  );
}
