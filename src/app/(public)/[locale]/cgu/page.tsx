import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { LEGAL_IDENTITY as legal } from "@/lib/legalIdentity";

export const metadata: Metadata = {
  title: "Conditions générales de vente et d’utilisation | VitrectoMed",
  description: "Conditions applicables aux commandes passées sur vitrectomed.com.",
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LegalPage
      locale={locale}
      eyebrow="Boutique VitrectoMed"
      title="Conditions générales de vente et d’utilisation"
      intro="Les présentes conditions encadrent l’utilisation du site et les ventes conclues à distance entre LAZURCO et ses clients consommateurs."
    >
      <LegalSection title="1. Vendeur et champ d’application">
        <p>
          Le vendeur est {legal.company}, {legal.legalForm}, {legal.address},
          {" "}{legal.rcs}, SIRET {legal.siret}, TVA {legal.vat}. Toute commande
          passée sur {legal.siteUrl} implique l’acceptation des présentes conditions
          dans leur version applicable au jour de la commande.
        </p>
        <p>
          Pour un achat réalisé à titre professionnel, des conditions particulières
          peuvent être convenues avec LAZURCO et prévalent lorsqu’elles sont acceptées.
        </p>
      </LegalSection>

      <LegalSection title="2. Produits et information médicale">
        <p>
          Les caractéristiques essentielles, visuels, accessoires et prix sont
          présentés sur chaque fiche produit. De légères différences non substantielles
          peuvent résulter de l’affichage ou d’évolutions de fabrication.
        </p>
        <p>
          Les produits et contenus VitrectoMed ne remplacent jamais les consignes
          personnalisées d’un chirurgien ou d’un professionnel de santé. Le client
          doit respecter les instructions du fabricant et les recommandations de son
          équipe médicale.
        </p>
      </LegalSection>

      <LegalSection title="3. Prix, taxes et frais">
        <p>
          Les prix sont affichés en euros. Les taxes applicables sont calculées selon
          le pays de livraison et la situation déclarée par le client. Les frais de
          livraison et le montant total sont indiqués avant la validation définitive.
          Pour une livraison hors Union européenne, les droits de douane et taxes
          d’importation éventuels restent à la charge du destinataire.
        </p>
      </LegalSection>

      <LegalSection title="4. Commande">
        <p>
          Le client vérifie son panier, ses coordonnées, le mode de livraison et le
          prix total avant de confirmer son obligation de paiement. LAZURCO adresse
          ensuite une confirmation électronique. LAZURCO peut refuser ou suspendre
          une commande en cas de paiement refusé, fraude présumée, litige antérieur,
          erreur manifeste de prix ou indisponibilité.
        </p>
      </LegalSection>

      <LegalSection title="5. Paiement">
        <p>
          Le paiement peut être proposé par carte via Stripe, PayPal ou virement
          bancaire selon le pays et les options affichées. Les paiements par carte et
          PayPal sont traités par le prestataire choisi. Une commande par virement
          n’est préparée qu’après réception effective des fonds. Les produits restent
          la propriété de LAZURCO jusqu’au paiement intégral.
        </p>
      </LegalSection>

      <LegalSection title="6. Livraison">
        <p>
          Les modes, coûts et délais estimatifs sont présentés avant la commande. Le
          client doit fournir une adresse exacte et signaler rapidement tout retard,
          colis endommagé, produit manquant ou erreur de livraison. Le risque est
          transféré au consommateur lorsqu’il prend physiquement possession du bien,
          sauf transporteur choisi indépendamment par lui.
        </p>
      </LegalSection>

      <LegalSection title="7. Droit de rétractation">
        <p>
          Le consommateur dispose en principe de quatorze jours à compter de la
          réception pour notifier sa rétractation, sans avoir à la motiver. Il dispose
          ensuite de quatorze jours pour renvoyer le produit à {legal.address}. Les
          frais directs de retour restent à sa charge, sauf erreur de LAZURCO ou produit
          non conforme.
        </p>
        <p>
          Le produit doit être manipulé uniquement dans la mesure nécessaire pour en
          vérifier la nature et le fonctionnement. La responsabilité du client peut
          être engagée en cas de dépréciation résultant de manipulations excessives.
          Conformément à la loi, le droit de rétractation ne s’applique notamment pas
          aux biens confectionnés selon les spécifications du client ni aux biens
          scellés ne pouvant être renvoyés pour des raisons d’hygiène ou de protection
          de la santé lorsqu’ils ont été descellés après livraison.
        </p>
        <p>
          Pour se rétracter, le client peut écrire à{" "}
          <a href={`mailto:${legal.email}`}>{legal.email}</a> en indiquant son nom,
          son adresse, le numéro de commande, le produit concerné, la date et une
          déclaration claire de rétractation. LAZURCO rembourse les sommes dues,
          livraison standard comprise, dans le délai légal et peut différer le
          remboursement jusqu’à récupération du bien ou réception d’une preuve d’envoi.
        </p>
      </LegalSection>

      <LegalSection title="8. Garanties légales">
        <p>
          Le consommateur bénéficie de la garantie légale de conformité prévue par
          les articles L.217-3 et suivants du Code de la consommation pendant deux ans
          à compter de la délivrance, ainsi que de la garantie contre les vices cachés
          prévue par les articles 1641 et suivants du Code civil. Ces garanties sont
          indépendantes de toute garantie commerciale éventuelle.
        </p>
        <p>
          Toute demande doit être adressée à {legal.email} avec le numéro de commande,
          une description précise et, si utile, des photographies du défaut.
        </p>
      </LegalSection>

      <LegalSection title="9. Responsabilité et force majeure">
        <p>
          LAZURCO répond de ses obligations dans les limites prévues par la loi. Sa
          responsabilité ne peut être engagée pour un dommage résultant d’un usage
          contraire à la notice, aux consignes médicales, d’une modification du produit
          ou d’un événement de force majeure. Aucune clause ne limite les droits
          impératifs du consommateur.
        </p>
      </LegalSection>

      <LegalSection title="10. Données personnelles et propriété intellectuelle">
        <p>
          Les traitements de données sont décrits dans la politique de confidentialité.
          Les contenus, marques, modèles, logiciels et créations présentés sur le site
          ne peuvent être reproduits ou exploités sans autorisation préalable.
        </p>
      </LegalSection>

      <LegalSection title="11. Réclamations et médiation">
        <p>
          Toute réclamation doit d’abord être adressée à {legal.email}. Si le litige de
          consommation n’est pas résolu après cette démarche, le consommateur peut saisir
          gratuitement {legal.mediator.name}, {legal.mediator.address}, en ligne sur{" "}
          <a href={legal.mediator.website} rel="noreferrer" target="_blank">
            {legal.mediator.website}
          </a>
          , sous réserve des conditions de recevabilité du médiateur.
        </p>
      </LegalSection>

      <LegalSection title="12. Droit applicable et litiges">
        <p>
          Les présentes conditions sont soumises au droit français. Le consommateur
          conserve le bénéfice des règles impératives de son pays de résidence lorsque
          celles-ci sont applicables. À défaut de résolution amiable, les juridictions
          compétentes sont déterminées selon les règles légales ; aucune attribution
          exclusive au tribunal de commerce ne s’impose à un consommateur.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

