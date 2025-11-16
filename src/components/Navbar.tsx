"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

import "@/styles/components/navbar.css";

/* ------------------------------------------
   🔥 TYPES STRICTS
------------------------------------------ */

type Locale = "fr" | "en";

type NeedSlug =
  | "vitrectomie"
  | "cervicales"
  | "domicile"
  | "pro"
  | "cadeaux"
  | "travail"
  | "dormir-ventre";

/* ------------------------------------------
   🔥 LINKS 100% TYPÉS
------------------------------------------ */

const NEEDS_LINKS: { slug: NeedSlug }[] = [
  { slug: "vitrectomie" },
  { slug: "cervicales" },
  { slug: "domicile" },
  { slug: "pro" },
  { slug: "cadeaux" },
  { slug: "travail" },
  { slug: "dormir-ventre" },
];

/* ------------------------------------------
   🔥 TRADUCTIONS 100% TYPÉES
------------------------------------------ */

const TRANSLATIONS: Record<
  Locale,
  {
    nav: {
      home: string;
      about: string;
      products: string;
      needs: string;
      blog: string;
      contact: string;
    };
    needs: Record<NeedSlug, string>;
  }
> = {
  fr: {
    nav: {
      home: "Accueil",
      about: "À propos",
      products: "Produits",
      needs: "Vos besoins",
      blog: "Blog",
      contact: "Contact",
    },
    needs: {
      vitrectomie: "Vitrectomie",
      cervicales: "Douleurs cervicales",
      domicile: "Bien-être à domicile",
      pro: "Usage professionnel",
      cadeaux: "Idées cadeaux",
      travail: "Bien-être au travail",
      "dormir-ventre": "Dormir sur le ventre",
    },
  },

  en: {
    nav: {
      home: "Home",
      about: "About",
      products: "Products",
      needs: "Your needs",
      blog: "Blog",
      contact: "Contact",
    },
    needs: {
      vitrectomie: "Vitrectomy recovery",
      cervicales: "Neck pain relief",
      domicile: "Home wellness",
      pro: "Professional use",
      cadeaux: "Gift ideas",
      travail: "Work wellness",
      "dormir-ventre": "Sleeping on stomach",
    },
  },
};

export default function Navbar() {
  const pathname = usePathname();

  // Extraire la locale depuis l’URL
  const raw = pathname?.split("/")[1];
  const locale: Locale = raw === "en" ? "en" : "fr";

  const { items, toggleCart } = useCart();
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const t = TRANSLATIONS[locale];

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* LOGO */}
        <Link href={`/${locale}`} className="navbar-logo">
          <div className="navbar-logo-badge">M</div>
          MassMe
        </Link>

        {/* DESKTOP NAV */}
        <div className="nav-links nav-desktop">
          <NavLink href={`/${locale}`}>{t.nav.home}</NavLink>
          <NavLink href={`/${locale}/a-propos`}>{t.nav.about}</NavLink>
          <NavLink href={`/${locale}/products`}>{t.nav.products}</NavLink>

          {/* DROPDOWN */}
          <div className="nav-dropdown">
            <button
              className="nav-dropdown-btn"
              onClick={() => setOpenDropdown(!openDropdown)}
            >
              {t.nav.needs}
              <span className={openDropdown ? "rotate-180" : "rotate-0"}>▼</span>
            </button>

            {openDropdown && (
              <div className="nav-dropdown-menu">
                {NEEDS_LINKS.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/${locale}/besoins/${item.slug}`}
                    className="nav-dropdown-item"
                    onClick={() => setOpenDropdown(false)}
                  >
                    {t.needs[item.slug]}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink href={`/${locale}/blog`}>{t.nav.blog}</NavLink>
          <NavLink href={`/${locale}/contact`}>{t.nav.contact}</NavLink>

          {/* LANG TOGGLE */}
          <Link
            href={pathname.replace(
              `/${locale}`,
              locale === "fr" ? "/en" : "/fr"
            )}
            className="nav-lang"
          >
            {locale === "fr" ? "EN" : "FR"}
          </Link>

          {/* PANIER */}
          <button className="nav-cart-btn" onClick={toggleCart}>
            <ShoppingCart size={22} />
            {items.length > 0 && (
              <span className="nav-cart-badge">{items.length}</span>
            )}
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="navbar-mobile-btn nav-mobile-only"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="mobile-menu nav-mobile-only">
          <MobileLink href={`/${locale}`} label={t.nav.home} />
          <MobileLink href={`/${locale}/a-propos`} label={t.nav.about} />
          <MobileLink href={`/${locale}/products`} label={t.nav.products} />

          <details className="mobile-dropdown">
            <summary>{t.nav.needs}</summary>
            <div className="mobile-dropdown-content">
              {NEEDS_LINKS.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${locale}/besoins/${item.slug}`}
                  className="mobile-link"
                >
                  {t.needs[item.slug]}
                </Link>
              ))}
            </div>
          </details>

          <MobileLink href={`/${locale}/blog`} label={t.nav.blog} />
          <MobileLink href={`/${locale}/contact`} label={t.nav.contact} />

          <div className="mobile-lang">
            <Link
              href={pathname.replace(
                `/${locale}`,
                locale === "fr" ? "/en" : "/fr"
              )}
            >
              {locale === "fr" ? "Switch to English" : "Passer en Français"}
            </Link>
          </div>

          <button className="mobile-cart" onClick={toggleCart}>
            <ShoppingCart size={22} />
            <span>
              {locale === "fr" ? "Panier" : "Cart"} ({items.length})
            </span>
          </button>
        </div>
      )}
    </nav>
  );
}

/* Small reusable components */

const NavLink = ({ href, children }: { href: string; children: any }) => (
  <Link href={href} className="nav-link">
    {children}
  </Link>
);

const MobileLink = ({
  href,
  label,
}: {
  href: string;
  label: string;
}) => <Link href={href} className="mobile-link">{label}</Link>;
