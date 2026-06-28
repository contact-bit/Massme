import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { LEGAL_IDENTITY as legal } from "@/lib/legalIdentity";

export const metadata: Metadata = {
  title: "Politique de confidentialité | VitrectoMed",
  description: "Traitement des données personnelles par VitrectoMed et LAZURCO.",
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LegalPage
      locale={locale}
      eyebrow="Protection des données"
      title="Politique de confidentialité"
      intro="Cette politique explique quelles données sont utilisées par VitrectoMed, pourquoi elles le sont et comment exercer vos droits."
    >
      <LegalSection title="Responsable du traitement">
        <p>
          Le responsable du traitement est {legal.company}, {legal.legalForm},
          située {legal.address}. Toute demande relative aux données personnelles
          peut être adressée à <a href={`mailto:${legal.email}`}>{legal.email}</a>.
        </p>
      </LegalSection>

      <LegalSection title="Données traitées">
        <ul>
          <li>identité et coordonnées : nom, prénom, e-mail, téléphone et adresses ;</li>
          <li>données de commande : produits, montants, livraison, facture et suivi ;</li>
          <li>informations professionnelles facultatives, notamment le numéro de TVA ;</li>
          <li>messages transmis via le formulaire de contact ;</li>
          <li>avis, note, commentaire et éléments nécessaires à leur vérification ;</li>
          <li>données techniques strictement nécessaires à la sécurité et au fonctionnement.</li>
        </ul>
        <p>
          VitrectoMed ne collecte pas directement le numéro complet de carte
          bancaire ni son cryptogramme. Ces données sont traitées par Stripe ou
          PayPal selon le moyen de paiement choisi.
        </p>
      </LegalSection>

      <LegalSection title="Finalités et bases légales">
        <ul>
          <li>exécuter la commande, le paiement, la livraison et le service après-vente : exécution du contrat ;</li>
          <li>établir les factures et respecter les obligations comptables et fiscales : obligation légale ;</li>
          <li>répondre aux demandes de contact et prévenir la fraude : intérêt légitime ;</li>
          <li>publier et modérer les avis : consentement et intérêt légitime à garantir leur authenticité ;</li>
          <li>envoyer une demande d’avis liée à une commande : intérêt légitime, avec possibilité d’opposition.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Destinataires et prestataires">
        <p>
          Les données sont accessibles aux personnes habilitées chez LAZURCO et,
          lorsque nécessaire, à ses prestataires : Vercel et Google Firebase pour
          l’hébergement technique, Stripe et PayPal pour les paiements, Resend pour
          les e-mails, Sendcloud, Mondial Relay ou les transporteurs sélectionnés
          pour la livraison, ainsi qu’aux conseils et autorités légalement habilités.
        </p>
        <p>
          Certains prestataires peuvent traiter des données hors de l’Espace
          économique européen. Ces transferts sont encadrés par les mécanismes
          prévus par le RGPD, notamment les décisions d’adéquation ou clauses
          contractuelles types applicables.
        </p>
      </LegalSection>

      <LegalSection title="Durées de conservation">
        <ul>
          <li>commandes, factures et pièces comptables : dix ans lorsqu’une obligation légale l’exige ;</li>
          <li>données nécessaires à la preuve d’un contrat : durée de la relation puis archivage pendant les délais de prescription applicables ;</li>
          <li>demandes de contact et prospects : trois ans après le dernier échange ;</li>
          <li>avis publiés : pendant leur publication, puis archivage limité en cas de contestation ;</li>
          <li>journaux techniques : durée limitée nécessaire à la sécurité et au diagnostic.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Vous pouvez demander l’accès, la rectification, l’effacement, la
          limitation ou la portabilité de vos données et vous opposer à certains
          traitements. Vous pouvez également retirer un consentement à tout moment
          et définir des directives relatives au sort de vos données après votre
          décès. Une preuve d’identité peut être demandée en cas de doute raisonnable.
        </p>
        <p>
          Si la réponse apportée ne vous satisfait pas, vous pouvez déposer une
          réclamation auprès de la CNIL sur{" "}
          <a href="https://www.cnil.fr" rel="noreferrer" target="_blank">cnil.fr</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

