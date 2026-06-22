import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

import CoussinProductExperience from "./CoussinProductExperience";
import "./products-page.css";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "fr";

  return {
    title:
      "Coussin après vitrectomie — Solution officielle VitrectoMed",
    description:
      "Fiche complète du coussin VitrectoMed après vitrectomie : prix, livraison, variantes, confort, position face vers le bas et informations produit.",
    alternates: {
      canonical: `/${locale}/convalescence/coussin`,
    },
  };
}

export default async function Page({
  params,
}: PageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return notFound();
  }

  const locale: Locale = rawLocale;

  return (
    <main className="coussin-page">
      <section className="coussin-hero">
        <div className="coussin-container">
          <div className="coussin-hero-card">
            <div className="coussin-hero-copy">
              <span className="coussin-kicker">
                Convalescence après vitrectomie
              </span>
              <h1>
                Coussin après vitrectomie
                <span>
                  la solution VitrectoMed pour la position face vers le bas
                </span>
              </h1>
              <p>
                Le dispositif officiel VitrectoMed accompagne les patients
                pendant la convalescence lorsque le chirurgien recommande une
                position face vers le bas après une chirurgie de la rétine.
              </p>
            </div>

            <div className="coussin-hero-media">
              <Image
                src="/brand/home-product.png"
                alt="Coussin VitrectoMed après vitrectomie"
                width={460}
                height={360}
                priority
              />
              <div>
                <CheckCircle2 size={20} />
                Position face vers le bas
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="coussin-product-section">
        <div className="coussin-container">
          <CoussinProductExperience locale={locale} />
        </div>
      </section>
    </main>
  );
}
