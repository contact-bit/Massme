"use client";

import { useEffect } from "react";

export default function RelayWidget({ onSelect }: { onSelect: (relay: any) => void }) {
  useEffect(() => {
    // Script officiel Pickup
    const script = document.createElement("script");
    script.src = "https://widget.pickupservices.fr/v1/pickup-sdk.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).PickupSDK) {
        (window as any).PickupSDK.open({
          apiKey: "public-demo-key", // remplacer par ta clé Pickup
          country: "FR",
          onRelaySelected: (relay: any) => {
            onSelect(relay);
          },
        });
      }
    };
    document.body.appendChild(script);
  }, [onSelect]);

  return <p className="text-sm text-gray-500">Chargement du widget…</p>;
}
