"use client";

import {
  ADMIN_COUNTRIES,
  useAdminScope,
} from "../context/adminScope";

export default function AdminCountryScopeBar() {
  const { country, setCountry } =
    useAdminScope();
  const activeCountry =
    ADMIN_COUNTRIES.find(
      (item) => item.code === country
    ) || ADMIN_COUNTRIES[0];

  return (
    <div className="admin-country-scope-bar">
      <div className="admin-country-scope-inner">
        <div className="admin-country-scope-field">
          <label
            className="admin-country-scope-label"
            htmlFor="admin-country-scope"
          >
            Pays de vente
          </label>

          <div className="admin-country-select-wrap">
            <span
              className="admin-country-select-flag"
              aria-hidden="true"
            >
              {activeCountry.flag}
            </span>

            <select
              id="admin-country-scope"
              className="admin-country-select"
              value={country}
              onChange={(event) =>
                setCountry(
                  event.target
                    .value as typeof country
                )
              }
              aria-label="Filtrer les données par pays"
            >
              {ADMIN_COUNTRIES.map((item) => (
                <option
                  key={item.code}
                  value={item.code}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
