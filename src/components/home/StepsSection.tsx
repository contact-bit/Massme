import "./StepsSection.css";
import Image from "next/image";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const MINI_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2c995c35-dbef-45d8-a0b2-70075a919800/public";

type Step = {
  label: string;
  text?: string;
  textBefore?: string;
  brand?: string;
  textAfter?: string;
};

type Copy = {
  titleA: string;
  titleB: string;
  intro: string;
  steps: Step[];
};

const COPY: Record<Locale, Copy> = {
  fr: {
    titleA: "Votre récupération après vitrectomie en",
    titleB: "3 étapes simples",
    intro:
      "Après une vitrectomie, respecter la position bulle (face contre la table) est essentiel pour la cicatrisation de la rétine et le succès de l’opération. Cette séquence en 3 étapes vous explique comment le coussin VitectroMed s’intègre concrètement dans votre quotidien à la maison.",
    steps: [
      {
        label: "Étape 1",
        text:
          "Vous rentrez chez vous après votre opération de vitrectomie et devez adopter la position bulle recommandée par votre ophtalmologue afin que la bulle de gaz appuie correctement sur la macula.",
      },
      {
        label: "Étape 2",
        textBefore: "Vous installez ",
        brand: "VitectroMed",
        textAfter:
          " en quelques secondes sur votre lit, sur une table ou un bureau, pour créer une zone d’appui stable qui soulage la nuque, les épaules et le haut du dos.",
      },
      {
        label: "Étape 3",
        text:
          "Vous maintenez plus facilement la position prescrite pendant plusieurs heures, avec moins de douleurs cervicales, tout en pouvant dormir, manger, lire, utiliser votre téléphone ou regarder un écran sans perdre la position face contre la table.",
      },
    ],
  },
  en: {
    titleA: "Your vitrectomy recovery support in",
    titleB: "3 clear steps",
    intro:
      "After vitrectomy surgery, following face‑down positioning instructions is crucial for retinal healing and long‑term visual outcomes. This 3‑step sequence shows how the VitectroMed vitrectomy cushion fits into your everyday home routine.",
    steps: [
      {
        label: "Step 1",
        text:
          "You return home after your vitrectomy and are instructed to remain in a face‑down position so the gas bubble can stay in contact with the macula and support the retina.",
      },
      {
        label: "Step 2",
        textBefore: "You set up ",
        brand: "VitectroMed",
        textAfter:
          " in seconds on your bed or on a table, creating a stable, ergonomic support that reduces strain on your neck, shoulders and upper back during face‑down recovery.",
      },
      {
        label: "Step 3",
        text:
          "You maintain the prescribed position more comfortably for longer periods, with less pain, while still being able to sleep, eat, read, use your phone or tablet and focus on a safe vitrectomy recovery at home.",
      },
    ],
  },
  es: {
    titleA: "Su recuperación tras vitrectomía en",
    titleB: "3 pasos",
    intro:
      "Después de una vitrectomía, mantener la posición boca abajo es fundamental para que la retina cicatrice correctamente y la cirugía tenga buenos resultados. Estos 3 pasos le muestran cómo el cojín VitectroMed se utiliza en la vida diaria.",
    steps: [
      {
        label: "Paso 1",
        text:
          "Regresa a casa tras la cirugía de vitrectomía y debe mantener la posición boca abajo para que la burbuja de gas permanezca en contacto con la mácula y ayude a la retina a pegarse.",
      },
      {
        label: "Paso 2",
        textBefore: "Instala ",
        brand: "VitectroMed",
        textAfter:
          " en segundos sobre la cama o sobre una mesa, creando un apoyo cómodo que descarga el cuello, los hombros y la parte alta de la espalda.",
      },
      {
        label: "Paso 3",
        text:
          "Mantiene la posición prescrita con mayor comodidad durante más tiempo, con menos tensión cervical, mientras puede descansar, comer, leer, usar el móvil o la tableta y centrarse en su recuperación ocular.",
      },
    ],
  },
  de: {
    titleA: "Ihre Vitrektomie‑Nachsorge in",
    titleB: "3 Schritten",
    intro:
      "Nach einer Vitrektomie ist die Bauchlage entscheidend für die Heilung der Netzhaut und den langfristigen Operationserfolg. Die folgenden 3 Schritte zeigen, wie das VitectroMed‑Kissen Sie im Alltag zu Hause unterstützt.",
    steps: [
      {
        label: "Schritt 1",
        text:
          "Sie kehren nach Ihrer Vitrektomie nach Hause zurück und sollen die Gesicht‑nach‑unten‑Position einhalten, damit die Gasblase die Makula optimal stabilisiert.",
      },
      {
        label: "Schritt 2",
        textBefore: "Sie positionieren ",
        brand: "VitectroMed",
        textAfter:
          " in wenigen Sekunden auf Ihrem Bett oder einem Tisch, um eine stabile Auflage zu schaffen, die Nacken, Schultern und oberen Rücken entlastet.",
      },
      {
        label: "Schritt 3",
        text:
          "Sie halten die verordnete Position deutlich bequemer und länger ein – mit weniger Schmerzen – und können trotzdem schlafen, essen, lesen, Ihr Smartphone nutzen und sich auf eine sichere Vitrektomie‑Genesung konzentrieren.",
      },
    ],
  },
  it: {
    titleA: "Il tuo recupero dopo vitrectomia in",
    titleB: "3 passaggi",
    intro:
      "Dopo una vitrectomia, mantenere la posizione a faccia in giù è essenziale per la guarigione della retina e la riuscita dell’intervento. Questi 3 passaggi spiegano come utilizzare il cuscino VitectroMed nella vita di tutti i giorni.",
    steps: [
      {
        label: "Passaggio 1",
        text:
          "Torni a casa dopo l’intervento di vitrectomia e devi mantenere la posizione a faccia in giù affinché la bolla di gas resti a contatto con la macula e sostenga la retina.",
      },
      {
        label: "Passaggio 2",
        textBefore: "Posizioni ",
        brand: "VitectroMed",
        textAfter:
          " in pochi secondi sul letto o su un tavolo, creando un supporto stabile che riduce lo sforzo su collo, spalle e parte alta della schiena.",
      },
      {
        label: "Passaggio 3",
        text:
          "Mantieni la posizione prescritta in modo più confortevole e per periodi più lunghi, con meno tensioni cervicali, continuando a dormire, mangiare, leggere, usare il telefono e dedicarti al recupero visivo.",
      },
    ],
  },
  nl: {
    titleA: "Uw herstel na vitrectomie in",
    titleB: "3 stappen",
    intro:
      "Na een vitrectomie is de gezicht‑naar‑beneden houding belangrijk voor de genezing van het netvlies en een goed operatieresultaat. In deze 3 stappen ziet u hoe u het VitectroMed‑kussen praktisch thuis gebruikt.",
    steps: [
      {
        label: "Stap 1",
        text:
          "U komt na uw vitrectomie‑operatie thuis en moet de gezicht‑naar‑beneden houding aanhouden zodat de gasbel tegen de macula blijft en de retina ondersteunt.",
      },
      {
        label: "Stap 2",
        textBefore: "U plaatst ",
        brand: "VitectroMed",
        textAfter:
          " in enkele seconden op uw bed of op een tafel en creëert zo een comfortabele steun die nek, schouders en bovenrug ontlast.",
      },
      {
        label: "Stap 3",
        text:
          "U houdt de voorgeschreven houding veel comfortabeler en langer vol, met minder klachten, terwijl u kunt rusten, eten, lezen, uw gsm gebruiken en werken aan een veilig vitrectomie‑herstel.",
      },
    ],
  },
};

export default function StepsSection({ locale }: Props) {
  const t = COPY[locale];

  return (
    <section className="steps">
      <div className="steps-inner">
        <header className="steps-header">
          <h3 className="steps-title">
            {t.titleA} <span className="steps-accent">{t.titleB}</span>
          </h3>
          <p className="steps-intro">{t.intro}</p>
        </header>

        <div className="steps-list">
          {t.steps.map((step, index) => (
            <article key={index} className="step">
              <div className="step-label">{step.label}</div>
              <p className="step-text">
                {step.textBefore}
                {step.brand && (
                  <span className="step-brand">
                    {step.brand}
                    <Image
                      src={MINI_LOGO}
                      alt="VitectroMed"
                      width={18}
                      height={18}
                      className="step-mini"
                    />
                  </span>
                )}
                {step.textAfter}
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
