"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";

import type { Locale } from "@/lib/i18n";

type HomeDirectorySearchProps = {
  locale: Locale;
};

const specialtyOptions = [
  "Spécialiste vitrectomie",
  "Chirurgien rétine",
  "Décollement de rétine",
  "Trou maculaire",
  "Membrane épirétinienne",
  "Corps flottants",
];

export function HomeDirectorySearch({
  locale,
}: HomeDirectorySearchProps) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [specialty, setSpecialty] = useState("");

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const params = new URLSearchParams();
    const cleanLocation = location.trim();
    const cleanSpecialty = specialty.trim();

    if (cleanSpecialty) {
      params.set("quoi", cleanSpecialty);
    }

    if (cleanLocation) {
      params.set("ou", cleanLocation);
    }

    router.push(
      `/${locale}/annuaire/recherche?${params.toString()}`
    );
  };

  return (
    <form
      className="home-exact-search-card"
      onSubmit={handleSubmit}
    >
      <label>
        <span className="home-exact-search-label">Où ?</span>
        <span className="home-exact-search-control">
          <input
            type="search"
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            placeholder="Pays, ville ou code postal"
            autoComplete="address-level2"
          />
          <MapPin size={16} aria-hidden="true" />
        </span>
      </label>
      <label>
        <span className="home-exact-search-label">Spécialité recherchée</span>
        <span className="home-exact-search-control home-exact-search-control-select">
          <select
            value={specialty}
            onChange={(event) =>
              setSpecialty(event.target.value)
            }
          >
            <option value="">Sélectionner une spécialité</option>
            {specialtyOptions.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </span>
      </label>
      <button type="submit" aria-label="Rechercher">
        <Search size={18} aria-hidden="true" />
        <span>Rechercher</span>
      </button>
      <small>Exemples : Vitrectomie, Trou maculaire, Décollement de rétine, Membrane épirétinienne...</small>
    </form>
  );
}
