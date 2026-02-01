export type Locale = "fr" | "en" | "es" | "de" | "it" | "nl";

export type Post = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  content: string;
};

export type BlogContent = {
  title: string;
  subtitle: string;
  posts: Post[];
  readMore: string;
};

export const CONTENT: Record<Locale, BlogContent> = {
  fr: {
    title: "Blog",
    subtitle: "Explorez nos articles, conseils et actualités.",
    posts: [
      {
        id: "1",
        title: "Bien dormir après une opération",
        date: "12 Janvier 2024",
        excerpt:
          "Découvrez nos conseils pour mieux dormir et accélérer votre récupération.",
        image:
          "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/ea307ae1-14e7-4c1c-0c4a-e2a98ae07e00/public",
        content: `
<h2>Pourquoi le sommeil est essentiel après une opération</h2>
<p>Après une intervention chirurgicale, le sommeil joue un rôle clé dans la cicatrisation des tissus, la réduction de la douleur et la stabilité émotionnelle. Un sommeil de mauvaise qualité peut au contraire augmenter la fatigue, le stress et ralentir la récupération.</p>

<h2>Respecter les consignes de votre chirurgien</h2>
<p>Avant tout, suivez scrupuleusement les recommandations de votre équipe médicale : position recommandée, durée de port d’un corset ou d’une minerve, médicaments à prendre et à éviter. Ces consignes tiennent compte de votre type d’opération, de vos antécédents et de vos traitements en cours.</p>

<h2>Choisir la bonne position pour dormir</h2>
<ul>
  <li><strong>Sur le dos</strong> : souvent la position la plus neutre. Placez un oreiller sous vos genoux pour soulager le bas du dos et un oreiller ergonomique sous la tête pour garder la nuque alignée.</li>
  <li><strong>Sur le côté</strong> : gardez la colonne la plus droite possible, avec un oreiller entre les genoux et un oreiller qui comble bien l’espace entre la tête et l’épaule.</li>
  <li><strong>Position semi-assise</strong> : après certaines opérations (thorax, ventre, colonne), dormir légèrement incliné peut diminuer la douleur et faciliter la respiration.</li>
</ul>

<h2>Bien utiliser les oreillers</h2>
<ul>
  <li>Un <strong>oreiller cervical</strong> peut aider à maintenir la courbure naturelle de la nuque et réduire les tensions.</li>
  <li>Mettez un oreiller <strong>sous les genoux</strong> si vous êtes sur le dos, ou <strong>entre les jambes</strong> si vous êtes sur le côté, pour aligner bassin et colonne.</li>
  <li>Évitez les piles de coussins instables qui vous font glisser ou tordre le cou pendant la nuit.</li>
</ul>

<h2>Gérer la douleur pour mieux dormir</h2>
<ul>
  <li>Prenez vos <strong>antalgiques</strong> comme prescrits, sans attendre que la douleur soit insupportable. Une douleur mal contrôlée est l’une des premières causes d’insomnie après une opération.</li>
  <li>Demandez à votre médecin si certains médicaments peuvent perturber le sommeil et s’il est possible d’adapter les doses ou les horaires.</li>
  <li>Complétez avec des moyens non médicamenteux : froid ou chaud selon avis médical, relaxation, respiration profonde.</li>
</ul>

<h2>Créer un environnement propice au sommeil</h2>
<ul>
  <li>Gardez la chambre <strong>fraîche, sombre et calme</strong> (environ 18–19°C, lumière tamisée, bouchons d’oreilles ou masque si besoin).</li>
  <li>Évitez les écrans et réseaux sociaux au moins 30–60 minutes avant le coucher, pour limiter la lumière bleue et la stimulation mentale.</li>
  <li>Installez à portée de main tout ce dont vous avez besoin : eau, médicaments, télécommande du lit, téléphone, afin d’éviter les mouvements brusques.</li>
</ul>

<h2>Rituels et relaxation avant de dormir</h2>
<ul>
  <li>Pratiquez une <strong>respiration profonde</strong> : inspirez par le nez sur 4 secondes, bloquez 2 secondes, expirez doucement par la bouche sur 6 secondes, pendant 5–10 minutes.</li>
  <li>Essayez la <strong>relaxation musculaire progressive</strong> : contractez puis relâchez chaque groupe musculaire, des pieds jusqu’au visage.</li>
  <li>Écoutez une musique douce, un podcast calme, ou faites quelques minutes de méditation guidée.</li>
</ul>

<h2>Gérer les réveils nocturnes</h2>
<p>Les réveils fréquents sont très courants après une opération. Si vous ne vous rendormez pas, ne regardez pas l’heure en boucle. Restez dans le noir, faites quelques respirations profondes ou une courte méditation. Si la douleur vous réveille régulièrement, parlez-en à votre médecin pour ajuster votre traitement.</p>

<h2>Quand consulter à nouveau ?</h2>
<p>Si malgré tous vos efforts, la douleur reste intense, que vous ne dormez presque plus ou que vous avez d’autres symptômes (fièvre, essoufflement inhabituel, douleurs thoraciques), contactez rapidement un professionnel de santé.</p>
`,
      },
      {
        id: "2",
        title: "Soulager les douleurs cervicales efficacement",
        date: "28 Décembre 2023",
        excerpt:
          "Les meilleures postures et accessoires pour réduire les tensions du cou.",
        image:
          "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/978ffb45-aa25-444c-a2cd-6cf1ab2e9f00/public",
        content: `
<h2>Comprendre les douleurs cervicales</h2>
<p>Les douleurs cervicales sont très fréquentes et touchent aussi bien les personnes sédentaires que les personnes actives. Elles sont souvent liées à de mauvaises postures, au stress, à un travail prolongé sur écran ou à un oreiller inadapté.</p>

<h2>Les causes les plus fréquentes</h2>
<ul>
  <li><strong>Posture tête en avant</strong> (téléphone, ordinateur, conduite) qui augmente fortement la pression sur les vertèbres du cou.</li>
  <li><strong>Tensions musculaires</strong> liées au stress, au manque de mouvement ou à des gestes répétitifs.</li>
  <li><strong>Oreiller ou matelas inadapté</strong> qui casse l’alignement tête–cou–dos pendant la nuit.</li>
  <li>Parfois, une <strong>pathologie sous-jacente</strong> (arthrose, hernie, traumatisme) qui nécessite un avis médical.</li>
</ul>

<h2>Premiers gestes pour soulager la douleur</h2>
<ul>
  <li>Alternez <strong>froid et chaud</strong> : le froid peut diminuer l’inflammation au début, la chaleur détend les muscles raides ensuite.</li>
  <li>Utilisez si besoin des <strong>antalgiques légers</strong> sur avis médical.</li>
  <li>Évitez de garder le cou complètement immobile pendant plusieurs jours : le mouvement doux favorise la récupération.</li>
</ul>

<h2>Améliorer votre posture au quotidien</h2>
<ul>
  <li><strong>Devant l’ordinateur</strong> : l’écran au niveau des yeux, le dos contre le dossier, les épaules relâchées, les avant-bras soutenus et les pieds à plat.</li>
  <li><strong>Avec le téléphone</strong> : remontez le téléphone vers vos yeux au lieu de pencher la tête vers le bas.</li>
  <li><strong>En voiture</strong> : rapprochez le siège pour éviter d’avancer la tête vers le volant, réglez l’appuie-tête à la bonne hauteur.</li>
</ul>

<h2>Étirements doux pour la nuque</h2>
<p>Réalisez ces exercices sans à-coups et sans aller dans la douleur. Arrêtez immédiatement si les symptômes s’aggravent.</p>
<ul>
  <li><strong>Flexion/extension</strong> : penchez lentement la tête en avant, maintenez 5–10 secondes, puis revenez au centre. Ensuite, penchez doucement la tête vers l’arrière si cela ne réveille pas de douleur.</li>
  <li><strong>Inclinaisons latérales</strong> : penchez l’oreille vers l’épaule, maintenez 10–15 secondes, puis changez de côté.</li>
  <li><strong>Rotations</strong> : tournez doucement la tête pour regarder par-dessus l’épaule, maintenez quelques secondes, puis de l’autre côté.</li>
  <li><strong>Rentrer le menton</strong> : assis, regard droit, rentrez légèrement le menton vers la gorge comme pour faire un double menton, maintenez 5 secondes et répétez 8–10 fois.</li>
</ul>

<h2>Choisir un bon oreiller pour la nuque</h2>
<ul>
  <li>Optez pour un <strong>oreiller de hauteur moyenne</strong> qui garde la tête dans l’alignement de la colonne.</li>
  <li>En cas de douleurs chroniques, un <strong>oreiller ergonomique ou cervical</strong> peut apporter un soutien plus précis.</li>
  <li>Évitez de dormir sur le ventre, position qui tord fortement la nuque pendant plusieurs heures.</li>
</ul>

<h2>Adapter votre espace de travail</h2>
<ul>
  <li>Placez l’écran à une distance d’environ un bras, avec le haut de l’écran à hauteur des yeux.</li>
  <li>Assurez-vous que la chaise soutient bien le bas du dos et permet aux pieds de rester à plat.</li>
  <li>Faites de courtes pauses toutes les 45–60 minutes pour marcher, rouler les épaules et étirer la nuque.</li>
</ul>

<h2>Quand consulter un professionnel de santé ?</h2>
<p>Demandez un avis médical rapidement si la douleur est très intense, si elle dure plus de quelques semaines malgré vos efforts, si elle descend dans le bras avec engourdissements ou perte de force, ou si vous avez de la fièvre ou un traumatisme récent.</p>
`,
      },
    ],
    readMore: "Lire la suite",
  },

  // Autres langues simplifiées pour l’instant
  en: {
    title: "Blog",
    subtitle: "Explore our articles, tips and latest updates.",
    posts: [
      {
        id: "1",
        title: "Sleeping well after surgery",
        date: "January 12, 2024",
        excerpt:
          "Discover our tips to sleep better and speed up your recovery.",
        image:
          "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/ea307ae1-14e7-4c1c-0c4a-e2a98ae07e00/public",
        content: `
<h2>Why sleep matters after surgery</h2>
<p>After surgery, your body relies on quality sleep to repair tissues, regulate inflammation and stabilize your mood.</p>
`,
      },
      {
        id: "2",
        title: "How to relieve cervical pain efficiently",
        date: "December 28, 2023",
        excerpt:
          "The best positions and tools to reduce neck tension.",
        image:
          "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/978ffb45-aa25-444c-a2cd-6cf1ab2e9f00/public",
        content: `
<h2>Understanding neck pain</h2>
<p>Neck pain is often linked to poor posture, stress, prolonged screen time or an unsuitable pillow.</p>
`,
      },
    ],
    readMore: "Read more",
  },

  es: {
    title: "Blog",
    subtitle: "Explora nuestros artículos, consejos y noticias.",
    posts: [
      {
        id: "1",
        title: "Dormir bien después de una operación",
        date: "12 de enero de 2024",
        excerpt:
          "Descubre nuestros consejos para dormir mejor y acelerar tu recuperación.",
        image:
          "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/ea307ae1-14e7-4c1c-0c4a-e2a98ae07e00/public",
        content: `
<h2>Por qué el sueño es importante tras una cirugía</h2>
<p>Después de una operación, el cuerpo necesita un sueño reparador para recuperarse correctamente.</p>
`,
      },
      {
        id: "2",
        title: "Aliviar el dolor cervical de forma eficaz",
        date: "28 de diciembre de 2023",
        excerpt:
          "Las mejores posturas y accesorios para reducir la tensión en el cuello.",
        image:
          "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/978ffb45-aa25-444c-a2cd-6cf1ab2e9f00/public",
        content: `
<h2>Comprender el dolor cervical</h2>
<p>El dolor de cuello suele deberse a malas posturas, estrés o muchas horas frente a pantallas.</p>
`,
      },
    ],
    readMore: "Leer más",
  },

  de: {
    title: "Blog",
    subtitle: "Entdecken Sie unsere Artikel, Tipps und Neuigkeiten.",
    posts: [
      {
        id: "1",
        title: "Gut schlafen nach einer Operation",
        date: "12. Januar 2024",
        excerpt:
          "Entdecken Sie unsere Tipps, um besser zu schlafen und Ihre Genesung zu beschleunigen.",
        image:
          "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/ea307ae1-14e7-4c1c-0c4a-e2a98ae07e00/public",
        content: `
<h2>Warum Schlaf nach einer Operation wichtig ist</h2>
<p>Nach einer Operation unterstützt erholsamer Schlaf die Heilung und reduziert Stress.</p>
`,
      },
      {
        id: "2",
        title: "Nackenschmerzen effektiv lindern",
        date: "28. Dezember 2023",
        excerpt:
          "Die besten Positionen und Hilfsmittel zur Reduzierung von Nackenverspannungen.",
        image:
          "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/978ffb45-aa25-444c-a2cd-6cf1ab2e9f00/public",
        content: `
<h2>Nackenschmerzen verstehen</h2>
<p>Nackenschmerzen werden häufig durch schlechte Haltung oder lange Bildschirmarbeit verursacht.</p>
`,
      },
    ],
    readMore: "Weiterlesen",
  },

  it: {
    title: "Blog",
    subtitle: "Scopri i nostri articoli, consigli e novità.",
    posts: [
      {
        id: "1",
        title: "Dormire bene dopo un intervento",
        date: "12 gennaio 2024",
        excerpt:
          "Scopri i nostri consigli per dormire meglio e velocizzare il recupero.",
        image:
          "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/ea307ae1-14e7-4c1c-0c4a-e2a98ae07e00/public",
        content: `
<h2>Perché il sonno è importante dopo un intervento</h2>
<p>Dopo un’operazione, il sonno aiuta il corpo a guarire e recuperare le energie.</p>
`,
      },
      {
        id: "2",
        title: "Alleviare il dolore cervicale in modo efficace",
        date: "28 dicembre 2023",
        excerpt:
          "Le migliori posizioni e accessori per ridurre la tensione al collo.",
        image:
          "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/978ffb45-aa25-444c-a2cd-6cf1ab2e9f00/public",
        content: `
<h2>Capire il dolore cervicale</h2>
<p>Il dolore al collo è spesso legato a postura scorretta, stress o lavoro al computer.</p>
`,
      },
    ],
    readMore: "Leggi di più",
  },

  nl: {
    title: "Blog",
    subtitle: "Ontdek onze artikels, tips en nieuwtjes.",
    posts: [
      {
        id: "1",
        title: "Goed slapen na een operatie",
        date: "12 januari 2024",
        excerpt:
          "Ontdek onze tips om beter te slapen en je herstel te versnellen.",
        image:
          "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/ea307ae1-14e7-4c1c-0c4a-e2a98ae07e00/public",
        content: `
<h2>Waarom slaap belangrijk is na een operatie</h2>
<p>Na een operatie helpt goede slaap uw lichaam sneller te herstellen.</p>
`,
      },
      {
        id: "2",
        title: "Nekpijn efficiënt verlichten",
        date: "28 december 2023",
        excerpt:
          "De beste houdingen en hulpmiddelen om nekspanning te verminderen.",
        image:
          "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/978ffb45-aa25-444c-a2cd-6cf1ab2e9f00/public",
        content: `
<h2>Nekpijn begrijpen</h2>
<p>Nekpijn heeft vaak te maken met slechte houding, stress of langdurig schermwerk.</p>
`,
      },
    ],
    readMore: "Lees meer",
  },
} as const;
