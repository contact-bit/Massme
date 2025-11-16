"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/styles/components/footer.css";

export default function Footer() {
  const pathname = usePathname();
  const rawLocale = pathname?.split("/")[1];
  const locale = rawLocale === "fr" || rawLocale === "en" ? rawLocale : "fr";

  const T = {
    fr: {
      col1: {
        title: "À propos de MassMe",
        p1: "LazurCo est une société Française basée à Nice qui conçoit, industrialise et distribue ses créations autour de valeurs fondatrices éco-responsables.",
        p2: "Savoir-faire Français | Production raisonnée | Développement durable",
        p3: "MassMe est une création LazurCo",
      },
      col2: {
        title: "Informations légales",
        rgpd: "Règlement Général de la Protection des Données (RGPD)",
        cgv: "Conditions Générales de Vente (CGV)",
      },
      col3: {
        title: "Navigation",
        prod: "Appui-tête Universel – MassMe",
        vitrec: "Le coussin vitrectomie MassMe",
        pay: "Paiement",
        contact: "Contact",
      },
      copyright: "© Copyright Massme — Tous droits réservés",
      photos: "Photos Alexis Machairas",
    },

    en: {
      col1: {
        title: "About MassMe",
        p1: "LazurCo is a French company based in Nice designing and manufacturing eco-responsible wellness products.",
        p2: "French craftsmanship | Sustainable production | Eco-design",
        p3: "MassMe is a creation of LazurCo",
      },
      col2: {
        title: "Legal",
        rgpd: "Privacy Policy (GDPR)",
        cgv: "Terms & Conditions",
      },
      col3: {
        title: "Navigation",
        prod: "Universal Headrest – MassMe",
        vitrec: "Vitrectomy Head Cushion",
        pay: "Payment",
        contact: "Contact",
      },
      copyright: "© Copyright Massme — All Rights Reserved",
      photos: "Photos Alexis Machairas",
    },
  }[locale];

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* COL 1 */}
        <div className="footer-col">
          <h3>{T.col1.title}</h3>
          <p>{T.col1.p1}</p>
          <p>{T.col1.p2}</p>
          <p>{T.col1.p3}</p>
        </div>

        {/* COL 2 */}
        <div className="footer-col">
          <h3>{T.col2.title}</h3>
          <Link href="/rgpd">{T.col2.rgpd}</Link>
          <Link href="/cgv">{T.col2.cgv}</Link>
        </div>

        {/* COL 3 */}
        <div className="footer-col">
          <h3>{T.col3.title}</h3>
          <Link href={`/${locale}/products`}>{T.col3.prod}</Link>
          <Link href={`/${locale}/besoins/vitrectomie`}>{T.col3.vitrec}</Link>
          <Link href={`/${locale}/checkout`}>{T.col3.pay}</Link>
          <Link href={`/${locale}/contact`}>{T.col3.contact}</Link>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <p>{T.copyright} | {T.photos}</p>

        <div className="footer-socials">
          <Link href="https://facebook.com" target="_blank">📘</Link>
          <Link href="https://youtube.com" target="_blank">▶️</Link>
          <Link href="https://instagram.com" target="_blank">📸</Link>
        </div>
      </div>
    </footer>
  );
}
