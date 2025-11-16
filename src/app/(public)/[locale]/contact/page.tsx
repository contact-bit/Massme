import BesoinPageTemplate from "@/components/BesoinPage";

export default function CadeauxPage() {
  return (
    <BesoinPageTemplate
      title="Idées cadeaux bien-être"
      subtitle="Offrez du confort, de la relaxation et de la récupération."
      paragraphs={[
        "MassMe est un cadeau qui a du sens : il apporte du bien-être immédiat à tous ceux qui en ont besoin.",
        "Contrairement aux accessoires classiques, MassMe offre un véritable soutien ergonomique permettant de se détendre profondément.",
        "Que ce soit pour un proche sportif, stressé, souffrant de tensions cervicales ou en phase de convalescence, MassMe devient rapidement un indispensable.",
      ]}
    />
  );
}
