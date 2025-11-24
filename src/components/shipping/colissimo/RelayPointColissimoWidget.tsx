"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    jQuery: any;
    $: any;
    handleColissimoSelect: any;
  }
}

export default function RelayPointColissimoWidget({ onSelect }: any) {
  const [token, setToken] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  /* ================================
      1) Charger libs externes
  ================================= */
  useEffect(() => {
    const load = async () => {
      // jQuery
      await loadScript("https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.js");
      // Mapbox
      await loadScript("https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.js");
      loadCss("https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.css");
      // Colissimo widget
      await loadScript("https://ws.colissimo.fr/widget-colissimo/js/jquery.plugin.colissimo.min.js");

      // 2) Récup token backend
      const res = await fetch("/api/colissimo/token", { method: "POST" });
      const data = await res.json();

      if (data.token) setToken(data.token);
    };

    load();
  }, []);

  /* Helpers */
  const loadScript = (src: string) =>
    new Promise<void>((resolve) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      document.body.appendChild(s);
    });

  const loadCss = (href: string) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  };

  /* ================================
      3) callback sélection point retrait
  ================================= */
  useEffect(() => {
    window.handleColissimoSelect = (point: any) => {
      onSelect({
        name: point.nom,
        address: point.adresse1,
        city: point.localite,
        postalCode: point.codePostal,
        country: point.codePays,
        latitude: point.coord?.geolocalisation?.lat,
        longitude: point.coord?.geolocalisation?.lon,
        raw: point,
      });

      window.jQuery("#widget-colissimo").frameColissimoClose();
    };
  }, []);

  /* ================================
      4) Ouverture widget dès que token OK
  ================================= */
  useEffect(() => {
    if (!token) return;

    const $ = window.jQuery;

    $("#widget-colissimo").frameColissimoOpen({
      URLColissimo: "https://ws.colissimo.fr",
      callBackFrame: "handleColissimoSelect",
      ceCountry: "FR",
      ceAddress: "343 avenue ollivary",
      ceZipCode: "13008",
      ceTown: "Marseille",
      origin: "WIDGET",
      filterRelay: "1",
      token,
    });
  }, [token]);

  return (
    <div
      id="widget-colissimo"
      ref={widgetRef}
      style={{ width: "100%", height: "650px" }}
    />
  );
}
