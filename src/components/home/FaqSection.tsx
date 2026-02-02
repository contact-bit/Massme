"use client";

import "./FaqSection.css";
import { useMemo, useState } from "react";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

type Item = {
  q: string;
  a: string;
};

type FaqCopy = {
  title: string;
  intro: string;
  items: Item[];
};

const DATA: Record<Locale, FaqCopy> = {
  fr: {
    title: "FAQ vitrectomie, position bulle et VitectroMed",
    intro:
      "Retrouvez ici les réponses aux questions les plus fréquentes sur la récupération après vitrectomie, la position bulle, le sommeil face contre la table et l’utilisation du coussin VitectroMed.",
    items: [
      {
        q: "Qu’est‑ce qu’une vitrectomie et pourquoi doit‑on garder la position bulle ?",
        a: "La vitrectomie est une intervention chirurgicale au niveau de la cavité vitréenne de l’œil, souvent réalisée pour traiter un trou maculaire ou un décollement de rétine. Après l’opération, une bulle de gaz ou d’huile est parfois injectée afin de maintenir la rétine en place. La position dite “bulle” (tête penchée ou face contre la table) permet de garder cette bulle en appui sur la zone à traiter pour favoriser la cicatrisation. Seul votre chirurgien peut préciser la durée et l’orientation exactes à respecter.",
      },
      {
        q: "Combien de temps faut‑il garder la position après une vitrectomie ?",
        a: "La durée de la position bulle dépend du geste chirurgical, de la pathologie (trou maculaire, décollement de rétine, autres) et du type de gaz utilisé. Il est courant de devoir maintenir la position plusieurs jours, parfois plusieurs heures par jour pendant une à deux semaines. Suivez toujours les consignes écrites de votre ophtalmologue, qui restent la référence.",
      },
      {
        q: "Comment dormir après une vitrectomie avec injection de gaz ?",
        a: "Après une vitrectomie avec bulle de gaz, il est souvent recommandé de dormir en position face contre la table, en chien de fusil, ou avec la tête inclinée dans une direction précise. L’objectif est que la bulle reste au contact de la zone opérée, notamment la macula. Utiliser un coussin adapté comme VitectroMed peut aider à maintenir cette position pendant la nuit tout en limitant les douleurs cervicales. En cas de gêne importante, contactez votre équipe médicale.",
      },
      {
        q: "VitectroMed remplace‑t‑il les recommandations de mon chirurgien ?",
        a: "Non. VitectroMed est un dispositif d’aide au confort et au maintien de la position, mais il ne remplace jamais les recommandations de votre chirurgien ophtalmologiste. Les indications médicales (durée, orientation de la tête, contre‑indications) restent prioritaires. En cas de doute sur la position à adopter après votre vitrectomie, demandez toujours l’avis de votre spécialiste.",
      },
      {
        q: "Quand commander VitectroMed pour être prêt le jour de l’opération ?",
        a: "Il est conseillé de commander VitectroMed quelques jours avant votre vitrectomie, dès que la date d’intervention est confirmée. Vous pouvez ainsi préparer votre espace de convalescence (table, lit, fauteuil) et tester la position avant l’opération, ce qui réduit le stress au retour à domicile.",
      },
      {
        q: "VitectroMed est‑il un dispositif médical certifié CE ?",
        a: "VitectroMed est présenté comme un dispositif médical marqué CE. Pour vérifier la classe du dispositif, les indications exactes et les précautions d’emploi, référez‑vous toujours à la notice, au marquage sur l’emballage et aux informations fournies par le fabricant. En cas de question, n’hésitez pas à en parler à votre chirurgien ou à votre pharmacien.",
      },
      {
        q: "VitectroMed convient‑il aux personnes portant des lunettes ou un masque respiratoire ?",
        a: "Le design de VitectroMed est pensé pour laisser un espace respiratoire pour le nez et la bouche et pour limiter la pression sur l’arête du nez. Dans de nombreux cas, il peut être utilisé avec des lunettes. Si vous portez un masque respiratoire (CPAP, par exemple), parlez‑en à votre médecin afin de vérifier la compatibilité de la position et du dispositif avec votre traitement.",
      },
      {
        q: "Peut‑on utiliser VitectroMed pour le second œil ou le prêter à quelqu’un ?",
        a: "Le coussin peut généralement être réutilisé pour une autre intervention sur le même patient, sous réserve de respecter les consignes d’entretien de la housse et des matériaux. En revanche, le prêt à d’autres personnes n’est pas recommandé pour des raisons d’hygiène et parce que chaque indication post‑opératoire est spécifique. Vérifiez toujours la notice d’utilisation avant réemploi.",
      },
      {
        q: "Comment entretenir et nettoyer VitectroMed pendant la convalescence ?",
        a: "La housse en textile de bambou Oeko‑Tex® est en général déhoussable et lavable selon les recommandations du fabricant (température, séchage, produits ménagers compatibles). Un entretien régulier permet de garder un contact propre et agréable avec la peau, notamment en cas de transpiration liée à la position prolongée.",
      },
    ],
  },
  en: {
    title: "Vitrectomy, face‑down recovery & VitectroMed – FAQ",
    intro:
      "Here you’ll find answers to common questions about vitrectomy recovery, face‑down positioning, gas bubble duration and how to use the VitectroMed cushion at home.",
    items: [
      {
        q: "What is a vitrectomy and why is face‑down positioning needed?",
        a: "Vitrectomy is eye surgery performed on the vitreous cavity, often used to treat macular holes or retinal detachments. At the end of surgery, your doctor may inject a gas or oil bubble to support the retina. Face‑down or specific head positioning keeps this bubble in contact with the treated area, helping the retina heal correctly. Only your retinal surgeon can define the exact angle and duration to follow.",
      },
      {
        q: "How long do I need to keep the face‑down position after vitrectomy?",
        a: "The duration depends on your diagnosis (macular hole, retinal detachment, etc.) and on the type of gas used. Many patients are asked to keep the position for several days, sometimes for a set number of hours per day over one or two weeks. Always follow the written instructions your ophthalmologist provides, as they are tailored to your specific case.",
      },
      {
        q: "How can I sleep after vitrectomy with a gas bubble in the eye?",
        a: "After vitrectomy, you are often asked to sleep face‑down or with your head turned in a specific direction so that the gas bubble rests on the correct part of the retina. Using a dedicated vitrectomy recovery cushion like VitectroMed can make this position easier to tolerate at night and reduce neck and shoulder strain. If sleeping becomes very difficult or painful, contact your eye care team promptly.",
      },
      {
        q: "Does VitectroMed replace my surgeon’s medical advice?",
        a: "No. VitectroMed is a comfort and positioning aid, not a substitute for medical advice. Your surgeon’s instructions regarding how long and in which direction to position your head always take priority. If you are unsure whether a particular position is safe after surgery, ask your retinal specialist before using any device.",
      },
      {
        q: "When should I order VitectroMed before surgery?",
        a: "It is best to order VitectroMed once your surgery date is confirmed so that the cushion is ready at home by the time you are discharged. This gives you time to set up a comfortable recovery space and try the position before surgery, which can reduce stress and uncertainty.",
      },
      {
        q: "Is VitectroMed a CE‑marked medical device?",
        a: "VitectroMed is presented as a CE‑marked medical device. To check the exact device class, indications and precautions, always read the official product documentation, including the instructions for use and carton labelling, and discuss any questions with your surgeon or pharmacist.",
      },
      {
        q: "Can I use VitectroMed if I wear glasses or a CPAP mask?",
        a: "The ergonomic design of VitectroMed is intended to keep a free breathing area around the nose and mouth and reduce pressure on the bridge of the nose, which may be helpful for patients who wear glasses. If you use a CPAP or other respiratory device, ask your doctor whether your post‑vitrectomy positioning requirements are compatible with your usual treatment.",
      },
      {
        q: "Can VitectroMed be reused for a second vitrectomy or shared?",
        a: "In many cases, the cushion can be reused by the same patient for a second eye, provided it is in good condition and cleaned according to the manufacturer’s instructions. Sharing the device with other people is not recommended due to hygiene and because each patient has specific post‑operative instructions.",
      },
      {
        q: "How do I clean and care for VitectroMed during recovery?",
        a: "The bamboo Oeko‑Tex® cover is typically removable and machine‑washable according to the care label (temperature, spin, detergent). Regular cleaning helps keep the surface fresh and comfortable, especially when you spend long hours in face‑down position and may perspire more than usual.",
      },
    ],
  },
  // Tu peux décliner les mêmes questions/réponses en es/de/it/nl si tu veux,
  // en gardant la même structure FaqCopy (title, intro, items).
  es: {
    title: "Preguntas frecuentes sobre vitrectomía, posición boca abajo y VitectroMed",
    intro:
      "Resolvemos las dudas más habituales sobre la recuperación tras vitrectomía, la burbuja de gas, la posición boca abajo y el uso del cojín VitectroMed en casa.",
    items: [
      {
        q: "¿Qué es una vitrectomía y por qué debo mantener la posición boca abajo?",
        a: "La vitrectomía es una cirugía ocular que se realiza en la cavidad vítrea, a menudo para tratar un agujero macular o un desprendimiento de retina. Al final de la intervención, el cirujano puede inyectar una burbuja de gas para sostener la retina. Mantener la cabeza en cierta posición (boca abajo o inclinada) ayuda a que la burbuja apoye la zona tratada y favorezca la cicatrización.",
      },
      {
        q: "¿Cuánto tiempo debo mantener la posición después de una vitrectomía?",
        a: "La duración depende del diagnóstico y del tipo de gas utilizado. Muchos pacientes deben mantener la posición boca abajo durante varios días, y seguir un tiempo diario recomendado. Las indicaciones de su oftalmólogo son la referencia principal.",
      },
      {
        q: "¿Cómo dormir después de una vitrectomía con burbuja de gas?",
        a: "Tras la vitrectomía, suele ser necesario dormir en posición boca abajo o girando la cabeza hacia un lado específico. Un cojín de recuperación como VitectroMed puede ayudar a mantener esta postura y a reducir molestias en cuello y espalda. Si nota dolor intenso o dificultad para dormir, contacte con el equipo médico.",
      },
      {
        q: "¿VitectroMed sustituye las indicaciones de mi cirujano?",
        a: "No. VitectroMed es una ayuda de confort y posicionamiento, pero no sustituye nunca el consejo médico. Las recomendaciones escritas de su cirujano sobre la posición y la duración son prioritarias.",
      },
      {
        q: "¿Cuándo debo pedir VitectroMed?",
        a: "Es recomendable pedir VitectroMed en cuanto tenga la fecha de la cirugía, para tenerlo listo cuando vuelva a casa y poder preparar la zona de descanso donde mantendrá la posición boca abajo.",
      },
      {
        q: "¿VitectroMed es un dispositivo médico certificado CE?",
        a: "VitectroMed se presenta como dispositivo médico con marcado CE. Consulte siempre la documentación oficial del producto (etiquetado, instrucciones de uso) y resuelva cualquier duda con su oftalmólogo o farmacéutico.",
      },
      {
        q: "¿Puedo usar VitectroMed si llevo gafas o un dispositivo de respiración?",
        a: "El diseño de VitectroMed está pensado para dejar espacio para la respiración y reducir la presión sobre la cara. Si utiliza un dispositivo de respiración (como CPAP), consulte con su médico si es compatible con la posición recomendada tras la vitrectomía.",
      },
      {
        q: "¿Se puede reutilizar o prestar el cojín?",
        a: "Por lo general, puede reutilizarse para el mismo paciente si el cojín está en buen estado y se limpia según las instrucciones. No se recomienda prestarlo a otras personas por cuestiones de higiene y porque cada caso clínico es diferente.",
      },
      {
        q: "¿Cómo debo limpiar y mantener VitectroMed?",
        a: "La funda de bambú Oeko‑Tex® suele poder retirarse y lavarse siguiendo las indicaciones del fabricante. Un mantenimiento regular permite conservar una superficie limpia y agradable durante las horas que pase en posición boca abajo.",
      },
    ],
  },
  de: {
    title: "Häufige Fragen zu Vitrektomie, Bauchlage und VitectroMed",
    intro:
      "Hier beantworten wir typische Fragen zur Erholung nach Vitrektomie, zur Gasblase, zur Bauchlage und zur Verwendung des VitectroMed‑Kissens zu Hause.",
    items: [
      {
        q: "Was ist eine Vitrektomie und warum ist die Bauchlage wichtig?",
        a: "Bei der Vitrektomie handelt es sich um eine Operation im Glaskörperraum, häufig zur Behandlung eines Makulalochs oder einer Netzhautablösung. Am Ende der Operation kann eine Gasblase eingebracht werden, um die Netzhaut zu stützen. Die vom Arzt verordnete Kopfposition sorgt dafür, dass die Blase den behandelten Bereich optimal abdeckt.",
      },
      {
        q: "Wie lange muss ich die Position nach einer Vitrektomie einhalten?",
        a: "Die genaue Dauer hängt von der Grunderkrankung und der Art des verwendeten Gases ab. Viele Patienten sollen die Position über mehrere Tage, teilweise stundenweise über ein bis zwei Wochen, einhalten. Die individuellen Anweisungen Ihres Augenarztes sind maßgeblich.",
      },
      {
        q: "Wie kann ich nach einer Vitrektomie mit Gasblase schlafen?",
        a: "Oft wird empfohlen, in Bauchlage oder mit einer bestimmten Kopfneigung zu schlafen, damit die Gasblase auf der richtigen Netzhautstelle liegt. Ein spezielles Kissen wie VitectroMed kann helfen, diese Lage über längere Zeit bequemer einzuhalten. Bei starken Schmerzen oder Problemen sollten Sie umgehend Ihr Behandlungsteam kontaktieren.",
      },
      {
        q: "Ersetzt VitectroMed die Empfehlungen meines Chirurgen?",
        a: "Nein. VitectroMed ist eine Unterstützung für Komfort und Positionierung, aber kein Ersatz für medizinische Anweisungen. Die Empfehlungen Ihres Operateurs haben immer Vorrang, insbesondere bezüglich Dauer und Art der Haltung.",
      },
      {
        q: "Wann sollte ich VitectroMed bestellen?",
        a: "Idealerweise bestellen Sie VitectroMed, sobald der OP‑Termin feststeht, damit das Kissen bei Ihrer Rückkehr nach Hause bereitliegt und Sie Ihren Ruhebereich entsprechend einrichten können.",
      },
      {
        q: "Ist VitectroMed ein CE‑zertifiziertes Medizinprodukt?",
        a: "VitectroMed wird als Medizinprodukt mit CE‑Kennzeichnung beschrieben. Details zum Zulassungsstatus und zu den Indikationen entnehmen Sie bitte der offiziellen Produktdokumentation und besprechen Sie Fragen mit Ihrem Augenarzt.",
      },
      {
        q: "Kann ich VitectroMed mit Brille oder Atemgerät nutzen?",
        a: "Das ergonomische Design soll eine freie Atemzone und möglichst wenig Druck im Gesichtsbereich ermöglichen, was auch Brillenträgern zugutekommen kann. Wenn Sie ein Atemgerät (z. B. CPAP) verwenden, klären Sie mit Ihrem Arzt, ob dies mit der postoperativen Kopfposition vereinbar ist.",
      },
      {
        q: "Kann das Kissen wiederverwendet oder verliehen werden?",
        a: "Für denselben Patienten kann VitectroMed bei einer weiteren Operation oft wieder genutzt werden, sofern der Zustand und die Herstellerangaben dies erlauben. Eine Weitergabe an andere Personen ist aus hygienischen Gründen nicht zu empfehlen.",
      },
      {
        q: "Wie pflege ich VitectroMed während der Erholungsphase?",
        a: "Der Bezug aus Bambus‑Oeko‑Tex® ist in der Regel abnehmbar und kann gemäß Pflegehinweisen gewaschen werden. Eine regelmäßige Reinigung sorgt für ein angenehmes Gefühl auf der Haut – besonders wichtig bei längeren Phasen in Bauchlage.",
      },
    ],
  },
  it: {
    title: "Domande frequenti su vitrectomia, posizione a faccia in giù e VitectroMed",
    intro:
      "Qui trovi le risposte alle domande più comuni sul recupero dopo vitrectomia, sulla bolla di gas, sulla posizione a faccia in giù e sull’uso del cuscino VitectroMed.",
    items: [
      {
        q: "Che cos’è la vitrectomia e perché è richiesta la posizione a faccia in giù?",
        a: "La vitrectomia è un intervento chirurgico sul corpo vitreo dell’occhio, spesso eseguito per trattare foro maculare o distacco di retina. Alla fine dell’intervento, il chirurgo può iniettare una bolla di gas per sostenere la retina. La posizione a faccia in giù permette alla bolla di appoggiarsi sulla zona operata e favorire la guarigione.",
      },
      {
        q: "Per quanto tempo devo mantenere la posizione dopo una vitrectomia?",
        a: "La durata dipende dal quadro clinico e dal tipo di gas usato. In molti casi è necessario mantenere la posizione prescritta per diversi giorni, talvolta per alcune ore al giorno per una o due settimane. Le istruzioni scritte del tuo oculista restano il riferimento principale.",
      },
      {
        q: "Come posso dormire dopo una vitrectomia con bolla di gas?",
        a: "Di solito viene richiesto di dormire a faccia in giù o con la testa inclinata in una direzione precisa, affinché la bolla rimanga sulla parte di retina da trattare. Un cuscino dedicato come VitectroMed può rendere questa posizione più sopportabile durante la notte.",
      },
      {
        q: "VitectroMed sostituisce le indicazioni del mio chirurgo?",
        a: "No. VitectroMed è un supporto di comfort e posizionamento, ma non sostituisce mai le indicazioni mediche. La durata e l’angolo di inclinazione devono sempre essere decisi dal tuo chirurgo.",
      },
      {
        q: "Quando conviene ordinare VitectroMed?",
        a: "È consigliabile ordinarlo quando la data dell’intervento è confermata, così da averlo pronto a casa al rientro e predisporre con anticipo l’area di riposo.",
      },
      {
        q: "VitectroMed è un dispositivo medico con marcatura CE?",
        a: "VitectroMed viene presentato come dispositivo medico con marcatura CE. Per tutti i dettagli consulta la documentazione ufficiale e chiedi chiarimenti al tuo specialista.",
      },
      {
        q: "Posso usare VitectroMed con occhiali o dispositivi per la respirazione?",
        a: "Il design ergonomico mira a ridurre la pressione su viso e naso e a lasciare spazio per respirare, il che può aiutare chi porta gli occhiali. Se utilizzi un dispositivo per la respirazione, confrontati con il medico per verificarne la compatibilità con la posizione richiesta.",
      },
      {
        q: "Il cuscino può essere riutilizzato o prestato?",
        a: "In genere può essere riutilizzato dalla stessa persona, se in buono stato e secondo le indicazioni della scheda tecnica. Per motivi igienici e clinici non è consigliato prestarlo ad altri.",
      },
      {
        q: "Come si pulisce e mantiene VitectroMed?",
        a: "La fodera in bambù Oeko‑Tex® è solitamente rimovibile e lavabile seguendo le indicazioni di lavaggio. Un’igiene regolare aiuta a mantenere la superficie fresca e piacevole a contatto con la pelle.",
      },
    ],
  },
  nl: {
    title: "Veelgestelde vragen over vitrectomie, buikligging en VitectroMed",
    intro:
      "Op deze pagina beantwoorden we veelgestelde vragen over herstel na vitrectomie, de gasbel, de gezicht‑naar‑beneden houding en het gebruik van het VitectroMed‑kussen.",
    items: [
      {
        q: "Wat is een vitrectomie en waarom moet ik met mijn gezicht naar beneden liggen?",
        a: "Een vitrectomie is een oogoperatie aan het glasvocht, vaak om een maculagat of netvliesloslating te behandelen. Aan het einde van de operatie kan een gasbel worden ingebracht om het netvlies te ondersteunen. De voorgeschreven houding zorgt ervoor dat de gasbel op de juiste plek van het netvlies drukt.",
      },
      {
        q: "Hoe lang moet ik de houding aanhouden na een vitrectomie?",
        a: "De duur hangt af van de aandoening en het type gas. Vaak moet de houding meerdere dagen worden aangehouden, met een aantal uren per dag dat u met het gezicht naar beneden of schuin ligt. Volg steeds de schriftelijke instructies van uw oogarts.",
      },
      {
        q: "Hoe kan ik slapen met een gasbel na vitrectomie?",
        a: "Na de ingreep wordt meestal aangeraden om in buikligging of met het hoofd in een bepaalde richting te slapen, zodat de gasbel de behandelde zone bedekt. Een speciaal kussen zoals VitectroMed kan helpen deze houding comfortabeler vol te houden.",
      },
      {
        q: "Vervangt VitectroMed het advies van mijn chirurg?",
        a: "Nee. VitectroMed ondersteunt uw comfort en houding, maar vervangt het medisch advies nooit. De aanwijzingen van uw chirurg over houding en duur blijven leidend.",
      },
      {
        q: "Wanneer kan ik VitectroMed het beste bestellen?",
        a: "Bestel bij voorkeur zodra uw operatiedatum vastligt, zodat het kussen klaar is als u thuiskomt en u uw herstelplek tijdig kunt inrichten.",
      },
      {
        q: "Is VitectroMed een medisch hulpmiddel met CE‑markering?",
        a: "VitectroMed wordt gepresenteerd als medisch hulpmiddel met CE‑markering. Raadpleeg de officiële productdocumentatie en vraag uw arts of apotheker bij twijfel.",
      },
      {
        q: "Kan ik VitectroMed gebruiken met een bril of ademhalingsapparaat?",
        a: "Het ergonomische ontwerp is bedoeld om de druk op het gezicht te verminderen en voldoende ruimte te laten om te ademen. Draagt u een ademhalingsapparaat, overleg dan met uw arts over de combinatie met de noodzakelijke hoofdpositie.",
      },
      {
        q: "Mag het kussen opnieuw worden gebruikt of uitgeleend?",
        a: "Het kussen kan meestal opnieuw worden gebruikt door dezelfde patiënt, zolang het in goede staat is en volgens de gebruiksaanwijzing wordt onderhouden. Om hygiënische en medische redenen is uitlenen niet aan te raden.",
      },
      {
        q: "Hoe onderhoud ik VitectroMed tijdens de herstelperiode?",
        a: "De bamboe Oeko‑Tex® hoes kan doorgaans worden verwijderd en gewassen volgens de aanwijzingen op het etiket. Regelmatige reiniging zorgt voor een fris en aangenaam contact met de huid.",
      },
    ],
  },
};

export default function FaqSection({ locale }: Props) {
  const t = DATA[locale];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = useMemo(() => t.items, [t]);

  return (
    <section className="faq">
      <div className="faq-inner">
        <header className="faq-header">
          <h2 className="faq-title">{t.title}</h2>
          <p className="faq-intro">{t.intro}</p>
        </header>

        <div className="faq-list">
          {items.map((it, idx) => {
            const open = openIndex === idx;
            return (
              <article
                key={idx}
                className={`faq-item ${open ? "is-open" : ""}`}
              >
                <button
                  className="faq-btn"
                  type="button"
                  onClick={() => setOpenIndex(open ? null : idx)}
                  aria-expanded={open}
                >
                  <span className="faq-q">{it.q}</span>
                  <span className="faq-chevron" aria-hidden="true">
                    ▾
                  </span>
                </button>

                <div
                  className="faq-panel"
                  style={{ maxHeight: open ? 260 : 0 }}
                >
                  <div className="faq-a">{it.a}</div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
