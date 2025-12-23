import BesoinPageTemplate from "@/components/BesoinPage";

export default function CervicalesPage() {
  return (
    <BesoinPageTemplate
      title="Douleurs cervicales après vitrectomie"
      subtitle="Un inconfort fréquent lié au maintien prolongé de la position post-opératoire."
      paragraphs={[
        // INTRO
        "Après une vitrectomie avec injection de gaz, le maintien prolongé de la position post-opératoire peut entraîner des douleurs cervicales importantes.",
        "Ces douleurs sont généralement liées à la posture imposée, au maintien de la tête orientée vers le sol et à la sollicitation continue des muscles du cou et des épaules.",

        // CONTEXTE POST-OP
        "La position dite « position bulle » est indispensable pour permettre au gaz intraoculaire d’agir correctement sur la rétine.",
        "Cependant, sans support adapté, cette posture peut rapidement provoquer des tensions cervicales, des raideurs et une fatigue musculaire marquée.",

        // ROLE D’OCULAREST
        "OculaRest a été conçu pour accompagner les patients durant cette phase de convalescence en facilitant le maintien de la position prescrite.",
        "En offrant un appui stable et mieux réparti, il aide à limiter les contraintes exercées sur les cervicales pendant les périodes prolongées en position.",

        // CONFORT & STABILITE
        "Le dispositif vise à améliorer le confort global du patient en réduisant les compensations posturales souvent responsables des douleurs cervicales.",
        "Il permet de maintenir la tête dans une position plus stable, ce qui contribue à diminuer la sollicitation excessive des muscles du cou.",

        // USAGES QUOTIDIENS
        "Pendant la convalescence, OculaRest peut être utilisé lors des temps de repos compatibles avec les recommandations médicales.",
        "Il aide le patient à conserver une posture plus constante, de jour comme de nuit, sans multiplier les ajustements inconfortables.",

        // LIMITES & RAPPEL MEDICAL
        "Les douleurs cervicales peuvent varier d’un patient à l’autre en fonction de la durée de la position prescrite et de la condition physique individuelle.",
        "OculaRest n’a pas vocation à traiter une pathologie cervicale en dehors du cadre post-opératoire.",

        // CONCLUSION
        "En facilitant le maintien de la position post-vitrectomie, OculaRest contribue à réduire l’inconfort cervical lié à la posture.",
        "Il s’inscrit comme un dispositif d’accompagnement destiné à améliorer le confort pendant la période de récupération.",
        "Pour toute douleur persistante ou inhabituelle, il est essentiel de consulter un professionnel de santé."
      ]}
    />
  );
}
