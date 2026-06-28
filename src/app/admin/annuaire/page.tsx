"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Edit3,
  MapPin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import type {
  DirectoryEntry,
  DirectoryEntryStatus,
  DirectoryEntryType,
} from "@/server/directory/types";
import type { CountryCode } from "@/lib/shipping-i18n";
import { COUNTRIES } from "@/lib/countries";
import {
  isConcreteCountry,
  useAdminScope,
} from "../context/adminScope";

import "./annuaire-admin.css";

type DirectoryFormState = {
  country: CountryCode;
  type: DirectoryEntryType;
  status: DirectoryEntryStatus;
  name: string;
  specialty: string;
  category: string;
  city: string;
  department: string;
  region: string;
  postalCode: string;
  address: string;
  phone: string;
  website: string;
  appointmentUrl: string;
  notes: string;
};

const emptyForm: DirectoryFormState = {
  country: "FR",
  type: "surgeon",
  status: "published",
  name: "",
  specialty: "Chirurgie vitréo-rétinienne",
  category: "Chirurgien rétine",
  city: "",
  department: "",
  region: "",
  postalCode: "",
  address: "",
  phone: "",
  website: "",
  appointmentUrl: "",
  notes: "",
};

type CommuneSuggestion = {
  id: string;
  name: string;
  department: string;
  region: string;
  postalCodes: string[];
};

const COMMUNES_API_URL =
  "https://geo.api.gouv.fr/communes";

const specialtyOptions = [
  "Chirurgie vitréo-rétinienne",
  "Vitrectomie",
  "Chirurgie de la rétine",
  "Pathologies maculaires",
  "Urgences rétine",
  "Suivi post-vitrectomie",
];

const surgeonCategoryOptions = [
  "Chirurgien rétine",
  "Spécialiste vitrectomie",
  "Chirurgien vitréo-rétinien",
];

const establishmentCategoryOptions = [
  "Centre de chirurgie vitréo-rétinienne",
  "Clinique chirurgie rétine",
  "Hôpital service rétine",
  "Centre ophtalmologique spécialisé",
];

function getCategoryOptions(type: DirectoryEntryType) {
  return type === "surgeon"
    ? surgeonCategoryOptions
    : establishmentCategoryOptions;
}

function getEmptyForm(country: CountryCode): DirectoryFormState {
  return {
    ...emptyForm,
    country,
  };
}

function statusLabel(status: DirectoryEntryStatus) {
  if (status === "published") return "Publié";
  if (status === "archived") return "Archivé";
  return "Brouillon";
}

function typeLabel(type: DirectoryEntryType) {
  return type === "surgeon"
    ? "Chirurgien"
    : "Établissement";
}

function entryToForm(
  entry: DirectoryEntry
): DirectoryFormState {
  return {
    country: entry.country,
    type: entry.type,
    status: entry.status,
    name: entry.name,
    specialty: entry.specialty,
    category: entry.category,
    city: entry.city,
    department: entry.department,
    region: entry.region,
    postalCode: entry.postalCode,
    address: entry.address,
    phone: entry.phone,
    website: entry.website,
    appointmentUrl: entry.appointmentUrl,
    notes: entry.notes,
  };
}

export default function AdminDirectoryPage() {
  const { country: activeCountry } =
    useAdminScope();
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [form, setForm] =
    useState<DirectoryFormState>(emptyForm);
  const [editingId, setEditingId] =
    useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] =
    useState<"all" | DirectoryEntryStatus>("all");
  const [type, setType] =
    useState<"all" | DirectoryEntryType>("all");
  const [communeSuggestions, setCommuneSuggestions] =
    useState<CommuneSuggestion[]>([]);
  const [postalCodeOptions, setPostalCodeOptions] =
    useState<string[]>([]);

  async function fetchEntries() {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (isConcreteCountry(activeCountry)) {
        params.set("country", activeCountry);
      }

      const response = await fetch(
        `/api/admin/directory${
          params.toString()
            ? `?${params.toString()}`
            : ""
        }`,
        { cache: "no-store" }
      );
      const payload = await response.json();

      setEntries(payload.entries || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntries();
  }, [activeCountry]);

  useEffect(() => {
    if (editingId || !isConcreteCountry(activeCountry)) {
      return;
    }

    setForm((current) => ({
      ...current,
      country: activeCountry,
    }));
  }, [activeCountry, editingId]);

  useEffect(() => {
    const cleanCity = form.city.trim();

    if (cleanCity.length < 2) {
      setCommuneSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      const params = new URLSearchParams({
        nom: cleanCity,
        fields:
          "nom,codesPostaux,codeDepartement,departement,region",
        boost: "population",
        limit: "8",
      });

      try {
        const response = await fetch(
          `${COMMUNES_API_URL}?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          setCommuneSuggestions([]);
          return;
        }

        const payload =
          (await response.json()) as Array<{
            code?: string;
            nom?: string;
            codesPostaux?: string[];
            departement?: { nom?: string };
            region?: { nom?: string };
          }>;

        setCommuneSuggestions(
          payload
            .filter((item) => item.nom)
            .map((item) => ({
              id:
                item.code ||
                `${item.nom}-${item.departement?.nom || ""}`,
              name: item.nom || "",
              department: item.departement?.nom || "",
              region: item.region?.nom || "",
              postalCodes: item.codesPostaux || [],
            }))
        );
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setCommuneSuggestions([]);
      }
    }, 220);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [form.city]);

  const filteredEntries = useMemo(() => {
    const cleanQuery = query
      .trim()
      .toLocaleLowerCase("fr");

    return entries.filter((entry) => {
      const matchesStatus =
        status === "all" ||
        entry.status === status;
      const matchesType =
        type === "all" || entry.type === type;
      const matchesCountry =
        !isConcreteCountry(activeCountry) ||
        entry.country === activeCountry;
      const searchable = [
        entry.name,
        entry.specialty,
        entry.category,
        entry.city,
        entry.department,
        entry.region,
        entry.postalCode,
        entry.address,
      ]
        .join(" ")
        .toLocaleLowerCase("fr");

      return (
        matchesStatus &&
        matchesType &&
        matchesCountry &&
        (!cleanQuery ||
          searchable.includes(cleanQuery))
      );
    });
  }, [
    entries,
    query,
    status,
    type,
    activeCountry,
  ]);

  function updateForm(
    key: keyof DirectoryFormState,
    value: string
  ) {
    setForm((current) => {
      if (key === "type") {
        const nextType =
          value as DirectoryEntryType;

        return {
          ...current,
          type: nextType,
          category:
            nextType === "surgeon"
              ? "Chirurgien rétine"
              : "Établissement spécialisé",
        };
      }

      return {
        ...current,
        [key]: value,
      };
    });
  }

  function selectCommune(commune: CommuneSuggestion) {
    setForm((current) => ({
      ...current,
      city: commune.name,
      department: commune.department,
      region: commune.region,
      postalCode:
        commune.postalCodes[0] || current.postalCode,
    }));
    setPostalCodeOptions(commune.postalCodes);
    setCommuneSuggestions([]);
  }

  function resetForm() {
    setForm(
      getEmptyForm(
        isConcreteCountry(activeCountry)
          ? activeCountry
          : "FR"
      )
    );
    setEditingId(null);
    setShowForm(false);
    setPostalCodeOptions([]);
    setCommuneSuggestions([]);
  }

  function openCreateForm() {
    setForm(
      getEmptyForm(
        isConcreteCountry(activeCountry)
          ? activeCountry
          : "FR"
      )
    );
    setEditingId(null);
    setPostalCodeOptions([]);
    setCommuneSuggestions([]);
    setShowForm((current) => !current);
  }

  function openEditForm(entry: DirectoryEntry) {
    setEditingId(entry.id);
    setForm(entryToForm(entry));
    setPostalCodeOptions(
      entry.postalCode ? [entry.postalCode] : []
    );
    setCommuneSuggestions([]);
    setShowForm(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function submitForm(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      const url = editingId
        ? `/api/admin/directory/${editingId}`
        : "/api/admin/directory";
      const method = editingId ? "PATCH" : "POST";
      const body = {
        ...form,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId
            ? { data: body }
            : body
        ),
      });

      if (!response.ok) {
        const payload = await response
          .json()
          .catch(() => null);
        throw new Error(
          payload?.error ||
            "Impossible d'enregistrer la fiche."
        );
      }

      resetForm();
      await fetchEntries();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer la fiche."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(
    entry: DirectoryEntry,
    nextStatus: DirectoryEntryStatus
  ) {
    await fetch(`/api/admin/directory/${entry.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          ...entry,
          status: nextStatus,
        },
      }),
    });

    await fetchEntries();
  }

  async function deleteEntry(entry: DirectoryEntry) {
    if (
      !confirm(
        `Supprimer la fiche "${entry.name}" ?`
      )
    ) {
      return;
    }

    await fetch(`/api/admin/directory/${entry.id}`, {
      method: "DELETE",
    });

    if (editingId === entry.id) {
      resetForm();
    }

    await fetchEntries();
  }

  return (
    <main className="directory-admin-page">
      <header className="directory-admin-topbar">
        <div className="directory-admin-title">
          Annuaire
        </div>

        <button
          type="button"
          className="directory-admin-secondary"
          onClick={openCreateForm}
        >
          <Plus size={16} aria-hidden="true" />
          {showForm && !editingId
            ? "Fermer"
            : "Nouvelle fiche"}
        </button>
      </header>

      {showForm ? (
        <form
          className="directory-admin-form"
          onSubmit={submitForm}
        >
        <div className="directory-admin-form-title">
          {editingId
            ? "Modifier la fiche"
            : "Ajouter une fiche"}
        </div>

        <div className="directory-admin-form-stack">
          <div className="directory-admin-form-row directory-admin-form-row--identity">
            <label>
              Pays
              <select
                value={form.country}
                onChange={(event) =>
                  updateForm("country", event.target.value)
                }
              >
                {COUNTRIES.map((country) => (
                  <option
                    key={country.code}
                    value={country.code}
                  >
                    {country.flag} {country.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Type
              <select
                value={form.type}
                onChange={(event) =>
                  updateForm("type", event.target.value)
                }
              >
                <option value="surgeon">Chirurgien</option>
                <option value="establishment">Établissement</option>
              </select>
            </label>

            <label>
              Statut
              <select
                value={form.status}
                onChange={(event) =>
                  updateForm("status", event.target.value)
                }
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </label>

            <label>
              Nom
              <input
                required
                value={form.name}
                onChange={(event) =>
                  updateForm("name", event.target.value)
                }
                placeholder="Dr Martin Dupont ou Centre rétine..."
              />
            </label>

            <label>
              Spécialité
              <select
                value={form.specialty}
                onChange={(event) =>
                  updateForm("specialty", event.target.value)
                }
              >
                {specialtyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Catégorie
              <select
                value={form.category}
                onChange={(event) =>
                  updateForm("category", event.target.value)
                }
              >
                {getCategoryOptions(form.type).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="directory-admin-form-row directory-admin-form-row--location">
            <div className="directory-admin-location-field">
              <label>
                Ville
                <input
                  required
                  value={form.city}
                  onChange={(event) => {
                    updateForm("city", event.target.value);
                    updateForm("department", "");
                    updateForm("region", "");
                    updateForm("postalCode", "");
                    setPostalCodeOptions([]);
                  }}
                  placeholder="Nice, Paris, Lyon..."
                />
              </label>

              {communeSuggestions.length > 0 ? (
                <div className="directory-admin-city-suggestions">
                  {communeSuggestions.map((commune) => (
                    <button
                      type="button"
                      key={commune.id}
                      onClick={() => selectCommune(commune)}
                    >
                      <MapPin size={15} aria-hidden="true" />
                      <span>
                        <strong>{commune.name}</strong>
                        {commune.department ? ` · ${commune.department}` : ""}
                        {commune.region ? ` · ${commune.region}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <label>
              Département
              <input readOnly value={form.department} />
            </label>

            <label>
              Région
              <input readOnly value={form.region} />
            </label>

            <label>
              Code postal
              <select
                value={form.postalCode}
                onChange={(event) =>
                  updateForm("postalCode", event.target.value)
                }
              >
                <option value="">Sélectionner</option>
                {postalCodeOptions.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
                {form.postalCode &&
                !postalCodeOptions.includes(form.postalCode) ? (
                  <option value={form.postalCode}>
                    {form.postalCode}
                  </option>
                ) : null}
              </select>
            </label>
          </div>

          <div className="directory-admin-form-row directory-admin-form-row--contact">
            <label>
              Adresse
              <input
                value={form.address}
                onChange={(event) =>
                  updateForm("address", event.target.value)
                }
              />
            </label>

            <label>
              Téléphone
              <input
                value={form.phone}
                onChange={(event) =>
                  updateForm("phone", event.target.value)
                }
              />
            </label>

            <label>
              Site officiel
              <input
                value={form.website}
                onChange={(event) =>
                  updateForm("website", event.target.value)
                }
              />
            </label>

            <label>
              Lien rendez-vous
              <input
                value={form.appointmentUrl}
                onChange={(event) =>
                  updateForm("appointmentUrl", event.target.value)
                }
              />
            </label>
          </div>

          <div className="directory-admin-form-row directory-admin-form-row--notes">
            <label>
              Notes internes
              <textarea
                value={form.notes}
                onChange={(event) =>
                  updateForm("notes", event.target.value)
                }
              />
            </label>
          </div>
        </div>

        <div className="directory-admin-form-actions">
          <button
            type="submit"
            className="directory-admin-primary"
            disabled={saving}
          >
            <Plus size={18} aria-hidden="true" />
            {saving
              ? "Enregistrement..."
              : editingId
                ? "Enregistrer"
                : "Ajouter la fiche"}
          </button>

          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="directory-admin-secondary"
            >
              Annuler
            </button>
          ) : null}
        </div>
        </form>
      ) : null}

      <section className="directory-admin-list">
        <div className="directory-admin-toolbar">
          <div className="directory-admin-count">
            {filteredEntries.length} résultat
            {filteredEntries.length > 1 ? "s" : ""}
          </div>

          <label className="directory-admin-search">
            <Search size={17} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Rechercher"
            />
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as
                  | "all"
                  | DirectoryEntryStatus
              )
            }
          >
            <option value="all">Tous statuts</option>
            <option value="draft">Brouillons</option>
            <option value="published">Publiés</option>
            <option value="archived">Archivés</option>
          </select>

          <select
            value={type}
            onChange={(event) =>
              setType(
                event.target.value as
                  | "all"
                  | DirectoryEntryType
              )
            }
          >
            <option value="all">Tous types</option>
            <option value="surgeon">Chirurgiens</option>
            <option value="establishment">
              Établissements
            </option>
          </select>
        </div>

        <div className="directory-admin-table-wrap">
          <table className="directory-admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Pays</th>
                <th>Type</th>
                <th>Ville</th>
                <th>Spécialité</th>
                <th>Statut</th>
                <th>Contact</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>
                  <div className="directory-admin-empty">
                    Chargement des fiches...
                  </div>
                </td>
              </tr>
            ) : filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="directory-admin-empty">
                    Aucune fiche.
                  </div>
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr
                  key={entry.id}
                >
                  <td>
                    <strong>{entry.name}</strong>
                    {entry.address ? (
                      <span>{entry.address}</span>
                    ) : null}
                  </td>

                  <td>
                    {COUNTRIES.find(
                      (country) =>
                        country.code ===
                        entry.country
                    )?.flag || "🌍"}
                  </td>

                  <td>{typeLabel(entry.type)}</td>

                  <td>
                    <strong>{entry.city || "—"}</strong>
                    <span>
                      {[
                        entry.postalCode,
                        entry.department,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </span>
                  </td>

                  <td>{entry.specialty || "—"}</td>

                  <td>
                      <span
                        className={`directory-admin-status directory-admin-status--${entry.status}`}
                      >
                        {statusLabel(entry.status)}
                      </span>
                  </td>

                  <td>
                    {entry.phone ? (
                      <strong>{entry.phone}</strong>
                    ) : (
                      <span>—</span>
                    )}
                    {entry.website ? (
                      <span>Site renseigné</span>
                    ) : null}
                  </td>

                  <td>
                    <div className="directory-admin-row-actions">
                      <button
                        type="button"
                        title="Modifier"
                        onClick={() => openEditForm(entry)}
                      >
                        <Edit3
                          size={16}
                          aria-hidden="true"
                        />
                      </button>

                      <button
                        type="button"
                        title={
                          entry.status === "published"
                            ? "Dépublier"
                            : "Publier"
                        }
                        onClick={() =>
                          updateStatus(
                            entry,
                            entry.status === "published"
                              ? "draft"
                              : "published"
                            )
                        }
                      >
                        {entry.status === "published"
                          ? "Off"
                          : "On"}
                      </button>

                      <button
                        type="button"
                        title="Supprimer"
                        className="directory-admin-danger"
                        onClick={() => deleteEntry(entry)}
                      >
                        <Trash2
                          size={16}
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
