import BesoinPageTemplate from "@/components/BesoinPage";

export default function VitrectomiePage() {
  return (
    <BesoinPageTemplate
      title="Vitrectomie"
      subtitle="Vitrectomed est un dispositif conçu pour aider au maintien de la position prescrite après une vitrectomie avec injection de gaz."
      paragraphs={[
        // INTRO
        "Après une vitrectomie avec injection de gaz, le respect strict de la position post-opératoire est essentiel pour favoriser la bonne cicatrisation de la rétine.",
        "Cette position, souvent appelée « position bulle », consiste à maintenir la tête orientée vers le sol afin que le gaz intraoculaire exerce la pression nécessaire sur la zone traitée.",

        // SECTION 1
        "Maintenir cette posture pendant plusieurs jours peut s’avérer difficile dans la vie quotidienne. L’inconfort, les tensions cervicales et la fatigue rendent parfois la convalescence éprouvante.",

        // SECTION 2 : rôle d’Vitrectomed
        "Vitrectomed a été conçu pour accompagner les patients durant cette période délicate. Il aide à maintenir la position prescrite plus facilement, tout en améliorant le confort au repos, de jour comme de nuit.",

        // SECTION 3 : usages quotidiens
        "Intégré à l’environnement domestique, Vitrectomed permet de conserver une posture plus stable pendant les activités du quotidien compatibles avec la convalescence, tout en respectant les recommandations médicales.",

        // SECTION 4 : conception & confort
        "Sa conception vise à réduire les contraintes au niveau du cou et des épaules, fréquemment sollicitées lors du maintien prolongé de la position post-opératoire.",
        "Chaque élément a été pensé pour être simple à installer, facile à utiliser et rassurant pendant toute la durée de la récupération.",

        // SECTION 5 : accompagnement de la récupération
        "En facilitant le respect de la position prescrite par le chirurgien, Vitrectomed contribue à créer de meilleures conditions pour la phase de récupération après une vitrectomie.",
        "Il s’inscrit comme un outil d’accompagnement destiné à améliorer le confort du patient durant cette période.",

        // SECTION 6 : questions fréquentes (neutres)
        "Combien de temps faut-il maintenir la position post-opératoire ? La durée dépend de la pathologie et des indications données par le chirurgien.",
        "Est-il possible de dormir après une vitrectomie ? Oui, à condition de respecter la position prescrite. Vitrectomed aide à maintenir cette posture plus confortablement.",
        "Quand se préparer ? Il est recommandé d’organiser son environnement et son matériel avant l’intervention afin d’aborder la convalescence plus sereinement.",

        // SECTION 7 : conclusion
        "Vitrectomed est conçu pour accompagner les patients durant la convalescence après vitrectomie, en facilitant le maintien de la position post-opératoire.",
        "Pour toute question concernant votre situation personnelle, il est essentiel de suivre les recommandations de votre chirurgien ou de votre équipe médicale."
      ]}
    />
  );
}
