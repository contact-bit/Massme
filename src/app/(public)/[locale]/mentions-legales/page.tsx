import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { LEGAL_IDENTITY as legal } from "@/lib/legalIdentity";

export const metadata: Metadata = {
  title: "Mentions légales | VitrectoMed",
  description: "Mentions légales du site vitrectomed.com édité par LAZURCO.",
};

export default async function LegalNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LegalPage
      locale={locale}
      eyebrow="Informations légales"
      title="Mentions légales"
      intro="Identité de l’éditeur, hébergement et responsabilités applicables au site VitrectoMed."
    >
      <LegalSection title="Éditeur du site">
        <div className="legal-identity-card">
          <strong>{legal.company}</strong> — {legal.legalForm}<br />
          Siège social : {legal.address}<br />
          {legal.rcs}<br />
          SIRET : {legal.siret}<br />
          TVA intracommunautaire : {legal.vat}<br />
          Téléphone : {legal.phone}<br />
          E-mail : <a href={`mailto:${legal.email}`}>{legal.email}</a>
        </div>
        <p>
          {legal.brand} et le site {legal.siteUrl} sont édités et exploités par
          LAZURCO. Le directeur de la publication est {legal.director}, en sa
          qualité de président de LAZURCO.
        </p>
      </LegalSection>

      <LegalSection title="Conception et développement">
        <p>
          Conception et développement technique :{" "}
          <a href={legal.developerUrl} rel="noreferrer" target="_blank">
            {legal.developer}
          </a>
          , prestataire indépendant. HDConnects n’est ni le vendeur des produits,
          ni l’éditeur du site, ni le responsable des commandes clients.
        </p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site est hébergé par Vercel Inc., 440 N Barranca Avenue #4133,
          Covina, CA 91723, États-Unis. Les données applicatives sont notamment
          traitées au moyen de services Google Firebase conformément aux choix
          techniques et contractuels de LAZURCO.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          Les marques, textes, photographies, illustrations, logos, vidéos,
          documents et éléments techniques du site sont protégés. Toute
          reproduction ou exploitation non autorisée, totale ou partielle, est
          interdite, sauf autorisation écrite préalable de LAZURCO ou exception
          prévue par la loi.
        </p>
      </LegalSection>

      <LegalSection title="Information médicale et responsabilité">
        <p>
          Les contenus de VitrectoMed ont une finalité informative et éducative.
          Ils ne constituent ni un diagnostic, ni une prescription, ni un avis
          médical personnalisé et ne remplacent pas la consultation d’un
          ophtalmologue ou d’un autre professionnel de santé. En cas d’urgence,
          contactez immédiatement les services d’urgence compétents.
        </p>
        <p>
          LAZURCO s’efforce de maintenir des informations exactes et à jour sans
          pouvoir garantir l’absence absolue d’erreur ou l’adaptation des contenus
          à chaque situation individuelle.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

