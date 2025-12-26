"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

import "@/styles/components/navbar.css";

/* ------------------------------------------
   🔥 LOGO CLOUDFlARE
------------------------------------------ */
const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2456d5ba-af23-4219-7115-f54286a7c600/public";

/* ------------------------------------------
   🔥 TYPES STRICTS
------------------------------------------ */
type Locale = "fr" | "en";

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
      contact: string;
    };
    cartLabel: string;
  }
> = {
  fr: {
    nav: {
      home: "Accueil",
      about: "Fonctionnement",
      products: "Commander",
      contact: "Contact",
    },
    cartLabel: "Panier",
  },
  en: {
    nav: {
      home: "Home",
      about: "How it works",
      products: "Order",
      contact: "Contact",
    },
    cartLabel: "Cart",
  },
};

export default function Navbar() {
  const pathname = usePathname();

  const raw = pathname?.split("/")[1];
  const locale: Locale = raw === "en" ? "en" : "fr";

  const { items, toggleCart } = useCart();
  const [open, setOpen] = useState(false);

  const t = TRANSLATIONS[locale];

  const langHref = pathname
    ? pathname.replace(`/${locale}`, locale === "fr" ? "/en" : "/fr")
    : `/${locale === "fr" ? "en" : "fr"}`;

  return (
    <nav className="navbar">
      {/* 🔧 BANDEAU INFO */}
<div className="site-notice">
  {locale === "fr"
    ? "🚧 Site en construction — certaines fonctionnalités peuvent être indisponibles."
    : "🚧 Website under construction — some features may be unavailable."}
</div>


      <div className="navbar-container">
        {/* LOGO */}
        <Link href={`/${locale}`} className="navbar-logo">
          <img
            src={LOGO_URL}
            alt="OculaRest logo"
            className="navbar-logo-img"
            loading="eager"
          />
        </Link>

        {/* DESKTOP NAV */}
        <div className="nav-links nav-desktop">
          <NavLink href={`/${locale}`}>{t.nav.home}</NavLink>
          <NavLink href={`/${locale}/a-propos`}>{t.nav.about}</NavLink>
          <NavLink href={`/${locale}/products`}>{t.nav.products}</NavLink>
          <NavLink href={`/${locale}/contact`}>{t.nav.contact}</NavLink>

          {/* LANG TOGGLE */}
          <Link href={langHref} className="nav-lang">
            {locale === "fr" ? "EN" : "FR"}
          </Link>

          {/* PANIER */}
          <button className="nav-cart-btn" onClick={toggleCart} type="button">
            <ShoppingCart size={22} />
            {items.length > 0 && (
              <span className="nav-cart-badge">{items.length}</span>
            )}
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="navbar-mobile-btn nav-mobile-only"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="mobile-menu nav-mobile-only">
          <MobileLink
            href={`/${locale}`}
            label={t.nav.home}
            onClick={() => setOpen(false)}
          />
          <MobileLink
            href={`/${locale}/a-propos`}
            label={t.nav.about}
            onClick={() => setOpen(false)}
          />
          <MobileLink
            href={`/${locale}/products`}
            label={t.nav.products}
            onClick={() => setOpen(false)}
          />
          <MobileLink
            href={`/${locale}/contact`}
            label={t.nav.contact}
            onClick={() => setOpen(false)}
          />

          <div className="mobile-lang">
            <Link href={langHref} onClick={() => setOpen(false)}>
              {locale === "fr" ? "Switch to English" : "Passer en Français"}
            </Link>
          </div>

          <button className="mobile-cart" onClick={toggleCart} type="button">
            <ShoppingCart size={22} />
            <span>
              {t.cartLabel} ({items.length})
            </span>
          </button>
        </div>
      )}
    </nav>
  );
}

const NavLink = ({ href, children }: { href: string; children: any }) => (
  <Link href={href} className="nav-link">
    {children}
  </Link>
);

const MobileLink = ({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) => (
  <Link href={href} className="mobile-link" onClick={onClick}>
    {label}
  </Link>
);
