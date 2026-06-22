import Link from "next/link";
import {
  Building2,
  MapPin,
  Phone,
  Search,
} from "lucide-react";

import type { DirectoryEntry } from "@/server/directory/types";

type DirectoryResultsProps = {
  entries: DirectoryEntry[];
  emptyHref: string;
  emptyText?: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  page: number;
  previousHref?: string;
  nextHref?: string;
};

export default function DirectoryResults({
  entries,
  emptyHref,
  emptyText =
    "La structure est prête. Les fiches officielles apparaîtront ici dès qu’elles seront ajoutées et vérifiées.",
  hasNextPage,
  hasPreviousPage,
  page,
  previousHref,
  nextHref,
}: DirectoryResultsProps) {
  return (
    <>
      <div className="directory-results-list">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <article
              className="directory-result-card"
              key={entry.id}
            >
              <div className="directory-result-card__main">
                <span className="directory-result-card__type">
                  {entry.category}
                </span>

                <h2>{entry.name}</h2>

                <p className="directory-result-card__specialty">
                  {entry.specialty}
                </p>

                <p className="directory-result-card__address">
                  <MapPin size={18} aria-hidden="true" />
                  {[
                    entry.address,
                    entry.postalCode,
                    entry.city,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              </div>

              {entry.phone || entry.website ? (
                <div className="directory-result-card__actions">
                  {entry.phone ? (
                    <a href={`tel:${entry.phone}`}>
                      <Phone size={18} aria-hidden="true" />
                      Afficher le numéro
                    </a>
                  ) : null}

                  {entry.website ? (
                    <a href={entry.website}>
                      <Building2
                        size={18}
                        aria-hidden="true"
                      />
                      Site officiel
                    </a>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <div className="directory-results-empty">
            <Search size={34} aria-hidden="true" />

            <h2>Aucun résultat vérifié pour cette recherche</h2>

            <p>{emptyText}</p>

            <Link href={emptyHref}>Proposer une fiche</Link>
          </div>
        )}
      </div>

      {hasPreviousPage || hasNextPage ? (
        <nav
          className="directory-results-pagination"
          aria-label="Pagination des résultats"
        >
          {hasPreviousPage && previousHref ? (
            <Link href={previousHref}>Page précédente</Link>
          ) : (
            <span />
          )}

          <strong>Page {page}</strong>

          {hasNextPage && nextHref ? (
            <Link href={nextHref}>Page suivante</Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </>
  );
}
