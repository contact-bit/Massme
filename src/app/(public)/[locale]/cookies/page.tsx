import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookies et stockage local | VitrectoMed",
  description: "Informations sur les cookies et stockages utilisés par VitrectoMed.",
};

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LegalPage
      locale={locale}
      eyebrow="Vie privée"
      title="Cookies et stockage local"
      intro="VitrectoMed limite les traceurs aux éléments nécessaires au fonctionnement de la boutique et aux services demandés par l’utilisateur."
    >
      <LegalSection title="Stockages nécessaires">
        <ul>
          <li>
            <strong>vitrectomed-cart</strong> : stockage local du navigateur utilisé
            pour conserver le panier entre deux pages ou visites ; il reste présent
            jusqu’à la suppression du panier ou des données du navigateur.
          </li>
          <li>
            <strong>hd_admin_session</strong> : cookie de session sécurisé réservé
            aux utilisateurs autorisés de l’administration ; durée maximale de huit heures.
          </li>
          <li>
            préférences techniques de l’administration : stockées localement et
            sans finalité publicitaire.
          </li>
        </ul>
        <p>
          Ces stockages sont nécessaires au service expressément demandé ou à sa
          sécurité et ne nécessitent pas de consentement préalable.
        </p>
      </LegalSection>

      <LegalSection title="Services tiers sollicités">
        <p>
          Lorsque vous choisissez un paiement PayPal ou utilisez un sélecteur de
          point relais, les services concernés peuvent déposer leurs propres
          cookies strictement nécessaires à l’opération demandée. Stripe, PayPal,
          Mondial Relay et les autres prestataires appliquent leurs propres
          politiques de confidentialité.
        </p>
      </LegalSection>

      <LegalSection title="Absence de publicité comportementale">
        <p>
          Dans sa configuration actuelle, VitrectoMed n’intègre pas de traceur
          publicitaire ni d’outil de mesure d’audience nécessitant un consentement.
          Si de tels services sont ajoutés ultérieurement, ils devront être bloqués
          avant consentement et un outil de choix permettant d’accepter ou refuser
          chaque finalité sera mis à disposition.
        </p>
      </LegalSection>

      <LegalSection title="Gérer les données du navigateur">
        <p>
          Vous pouvez supprimer les cookies et le stockage local depuis les réglages
          de votre navigateur. Cette suppression peut vider le panier ou interrompre
          une session en cours. Les menus diffèrent selon Chrome, Safari, Firefox,
          Edge et les navigateurs mobiles.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

