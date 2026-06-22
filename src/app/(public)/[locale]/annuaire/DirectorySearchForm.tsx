"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  MapPin,
  Search,
} from "lucide-react";

export const VITRECTOMY_SEARCH_OPTIONS = [
  {
    label: "Chirurgien rétine",
    value: "chirurgien retine",
  },
  {
    label: "Spécialiste vitrectomie",
    value: "specialiste vitrectomie",
  },
  {
    label: "Centre de chirurgie vitréo-rétinienne",
    value: "centre chirurgie vitreo retinienne",
  },
  {
    label: "Clinique chirurgie de la rétine",
    value: "clinique chirurgie retine",
  },
  {
    label: "Hôpital service rétine",
    value: "hopital service retine",
  },
  {
    label: "Suivi post-vitrectomie",
    value: "suivi post vitrectomie",
  },
];

const LOCATION_API_URL =
  "https://geo.api.gouv.fr/communes";

type LocationSuggestion = {
  id: string;
  value: string;
  label: string;
  detail: string;
  aliases?: string[];
};

type CommuneApiItem = {
  code?: string;
  nom?: string;
  codesPostaux?: string[];
  departement?: {
    nom?: string;
    code?: string;
  };
  region?: {
    nom?: string;
  };
};

const COMMON_CITY_SUGGESTIONS: LocationSuggestion[] = [
  {
    id: "nice",
    value: "Nice",
    label: "Nice",
    detail: "Alpes-Maritimes · 06000",
    aliases: [
      "nice 06",
      "nissa",
      "alpes maritimes nice",
    ],
  },
  {
    id: "paris",
    value: "Paris",
    label: "Paris",
    detail: "Paris · 75000",
  },
  {
    id: "lyon",
    value: "Lyon",
    label: "Lyon",
    detail: "Rhône · 69000",
  },
  {
    id: "marseille",
    value: "Marseille",
    label: "Marseille",
    detail: "Bouches-du-Rhône · 13000",
    aliases: [
      "marseille 13",
      "bouches du rhone marseille",
      "paca marseille",
    ],
  },
  {
    id: "toulouse",
    value: "Toulouse",
    label: "Toulouse",
    detail: "Haute-Garonne · 31000",
  },
  {
    id: "bordeaux",
    value: "Bordeaux",
    label: "Bordeaux",
    detail: "Gironde · 33000",
  },
];

const COMMON_AREA_SUGGESTIONS: LocationSuggestion[] = [
  {
    id: "dept-alpes-maritimes",
    value: "Alpes-Maritimes",
    label: "Alpes-Maritimes",
    detail: "Département · 06",
    aliases: [
      "alpes mari",
      "alpes maritime",
      "alpes maritimes",
      "departement 06",
      "06",
      "cote azur",
      "nice cannes antibes menton grasse",
    ],
  },
  {
    id: "dept-bouches-du-rhone",
    value: "Bouches-du-Rhône",
    label: "Bouches-du-Rhône",
    detail: "Département · 13",
    aliases: [
      "bouches rhone",
      "bouche du rhone",
      "bouches du rhone",
      "departement 13",
      "13",
      "marseille aix arles",
    ],
  },
  {
    id: "dept-rhone",
    value: "Rhône",
    label: "Rhône",
    detail: "Département · 69",
    aliases: [
      "rhone",
      "departement 69",
      "69",
      "lyon villeurbanne",
    ],
  },
  {
    id: "dept-gironde",
    value: "Gironde",
    label: "Gironde",
    detail: "Département · 33",
    aliases: [
      "gironde",
      "departement 33",
      "33",
      "bordeaux",
    ],
  },
  {
    id: "region-provence",
    value: "Provence-Alpes-Côte d'Azur",
    label: "Provence-Alpes-Côte d'Azur",
    detail: "Région",
    aliases: [
      "pa",
      "pac",
      "paca",
      "provence alpes",
      "provence alpes cote azur",
      "cote azur",
      "sud",
      "region sud",
      "region paca",
      "nice marseille toulon avignon",
    ],
  },
  {
    id: "region-ile-de-france",
    value: "Île-de-France",
    label: "Île-de-France",
    detail: "Région",
    aliases: [
      "idf",
      "ile france",
      "ile de france",
      "region parisienne",
      "paris",
    ],
  },
];

function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function suggestionHaystack(
  suggestion: LocationSuggestion
) {
  return [
    suggestion.label,
    suggestion.value,
    suggestion.detail,
    ...(suggestion.aliases || []),
  ]
    .map(normalizeSearch)
    .join(" ");
}

function matchesSuggestion(
  suggestion: LocationSuggestion,
  rawValue: string
) {
  const cleanValue = normalizeSearch(rawValue);

  if (cleanValue.length < 2) {
    return false;
  }

  const haystack =
    suggestionHaystack(suggestion);

  if (haystack.includes(cleanValue)) {
    return true;
  }

  const tokens = cleanValue
    .split(" ")
    .filter((token) => token.length > 0);

  return tokens.every((token) =>
    haystack
      .split(" ")
      .some((word) => word.startsWith(token))
  );
}

function scoreSuggestion(
  suggestion: LocationSuggestion,
  rawValue: string
) {
  const cleanValue = normalizeSearch(rawValue);
  const label = normalizeSearch(suggestion.label);
  const value = normalizeSearch(suggestion.value);
  const aliases = (suggestion.aliases || []).map(
    normalizeSearch
  );

  if (value === cleanValue || label === cleanValue) {
    return 0;
  }

  if (
    value.startsWith(cleanValue) ||
    label.startsWith(cleanValue)
  ) {
    return 1;
  }

  if (
    aliases.some((alias) => alias === cleanValue)
  ) {
    return 2;
  }

  if (
    aliases.some((alias) =>
      alias.startsWith(cleanValue)
    )
  ) {
    return 3;
  }

  if (
    aliases.some((alias) =>
      alias.includes(cleanValue)
    )
  ) {
    return 4;
  }

  return 5;
}

function getLocalSuggestions(
  value: string
): LocationSuggestion[] {
  const cleanValue = normalizeSearch(value.trim());

  if (cleanValue.length < 2) {
    return [];
  }

  return [
    ...COMMON_CITY_SUGGESTIONS,
    ...COMMON_AREA_SUGGESTIONS,
  ]
    .filter((suggestion) =>
      matchesSuggestion(suggestion, cleanValue)
    )
    .sort(
      (a, b) =>
        scoreSuggestion(a, cleanValue) -
        scoreSuggestion(b, cleanValue)
    );
}

function communeToSuggestion(
  item: CommuneApiItem
): LocationSuggestion | null {
  if (!item.nom) {
    return null;
  }

  const postalCodes =
    item.codesPostaux?.slice(0, 2).join(", ") || "";
  const department =
    item.departement?.nom || item.departement?.code || "";
  const detail = [department, postalCodes]
    .filter(Boolean)
    .join(" · ");

  return {
    id: item.code || `${item.nom}-${detail}`,
    value: item.nom,
    label: item.nom,
    detail,
  };
}

interface DirectorySearchFormProps {
  compact?: boolean;
  initialLocation?: string;
  initialQuery?: string;
  locale: string;
}

export default function DirectorySearchForm({
  compact = false,
  initialLocation = "",
  initialQuery = "",
  locale,
}: DirectorySearchFormProps) {
  const router = useRouter();
  const [query, setQuery] =
    useState(
      initialQuery ||
      VITRECTOMY_SEARCH_OPTIONS[0].value
    );
  const [location, setLocation] =
    useState(initialLocation);
  const [isLocationFocused, setIsLocationFocused] =
    useState(false);
  const [
    locationSuggestions,
    setLocationSuggestions,
  ] = useState<LocationSuggestion[]>([]);

  useEffect(() => {
    const cleanLocation =
      location.trim();

    if (
      !isLocationFocused ||
      cleanLocation.length < 2
    ) {
      return;
    }

    const controller =
      new AbortController();

    const timeout =
      window.setTimeout(async () => {
        const localSuggestions =
          getLocalSuggestions(cleanLocation);

        setLocationSuggestions(localSuggestions);

        const params =
          new URLSearchParams({
            nom: cleanLocation,
            fields:
              "nom,codesPostaux,codeDepartement,departement,region",
            boost: "population",
            limit: "8",
          });

        try {
          const response =
            await fetch(
              `${LOCATION_API_URL}?${params.toString()}`,
              {
                signal:
                  controller.signal,
              }
            );

          if (!response.ok) {
            setLocationSuggestions([]);
            return;
          }

          const payload =
            (await response.json()) as CommuneApiItem[];

          const apiSuggestions =
            payload
              .map(communeToSuggestion)
              .filter(
                (
                  suggestion
                ): suggestion is LocationSuggestion =>
                  Boolean(suggestion)
              );

          setLocationSuggestions(
            [
              ...getLocalSuggestions(cleanLocation),
              ...apiSuggestions,
            ]
              .filter(
                (suggestion, index, list) =>
                  list.findIndex(
                    (item) =>
                      normalizeSearch(item.value) ===
                      normalizeSearch(suggestion.value)
                  ) === index
              )
              .slice(0, 7)
          );
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return;
          }

          setLocationSuggestions([]);
        }
      }, 220);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [
    isLocationFocused,
    location,
  ]);

  const showLocationSuggestions =
    isLocationFocused &&
    locationSuggestions.length > 0;

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const params = new URLSearchParams();
    const cleanQuery = query.trim();
    const cleanLocation = location.trim();

    if (cleanQuery) {
      params.set("quoi", cleanQuery);
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
      className={`directory-search-form ${
        compact ? "directory-search-form--compact" : ""
      }`}
      onSubmit={handleSubmit}
    >
      <label className="directory-search-form__field">
        <span>Quoi</span>
        <div className="directory-search-form__select-wrap">
          <Search size={22} aria-hidden="true" />
          <select
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
          >
            {VITRECTOMY_SEARCH_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={19} aria-hidden="true" />
        </div>
      </label>

      <label className="directory-search-form__field">
        <span>Où</span>
        <div className="directory-location-field">
          <div className="directory-location-field__input">
            <MapPin size={22} aria-hidden="true" />
            <input
              type="search"
              value={location}
              onBlur={() =>
                setIsLocationFocused(false)
              }
              onChange={(event) => {
                const value =
                  event.target.value;

                setLocation(value);

                if (value.trim().length < 2) {
                  setLocationSuggestions([]);
                }
              }}
              onFocus={() =>
                setIsLocationFocused(true)
              }
              placeholder="Ville, département, région..."
            />
          </div>

          {showLocationSuggestions ? (
            <div className="directory-location-suggestions">
              {locationSuggestions.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion.id}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setLocation(suggestion.value);
                    setIsLocationFocused(false);
                  }}
                >
                  <MapPin size={16} aria-hidden="true" />
                  <span>
                    <strong>{suggestion.label}</strong>
                    {suggestion.detail ? (
                      <small>{suggestion.detail}</small>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </label>

      <button
        type="submit"
        className="directory-search-form__button"
      >
        <Search size={24} aria-hidden="true" />
        <span>Rechercher</span>
      </button>
    </form>
  );
}
