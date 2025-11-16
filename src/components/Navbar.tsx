"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  // 🔥 Correction : sécuriser le locale
  const rawLocale = pathname?.split("/")[1];
  const locale = rawLocale === "fr" || rawLocale === "en" ? rawLocale : "fr";

  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const { items, toggleCart } = useCart();

  const t = TRANSLATIONS[locale];

  return (
    <nav className="border-b bg-white z-50 relative">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={`/${locale}`} className="text-xl font-semibold">
          MassMe
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink href={`/${locale}`}>{t.nav.home}</NavLink>
          <NavLink href={`/${locale}/a-propos`}>{t.nav.about}</NavLink>
          <NavLink href={`/${locale}/products`}>{t.nav.products}</NavLink>

          <div className="relative">
            <button
              onClick={() => setOpenDropdown(!openDropdown)}
              className="flex items-center gap-1 hover:opacity-70 transition"
            >
              {t.nav.needs}
              <span
                className={`transition-transform duration-200 ${
                  openDropdown ? "rotate-180" : "rotate-0"
                }`}
              >
                ▼
              </span>
            </button>

            {openDropdown && (
              <div className="absolute left-0 mt-3 bg-white shadow-xl border rounded-xl py-2 w-64 z-50">
                {NEEDS_LINKS.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/${locale}/besoins/${item.slug}`}
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setOpenDropdown(false)}
                  >
                    {t.needs[item.slug as keyof typeof t.needs]}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink href={`/${locale}/blog`}>{t.nav.blog}</NavLink>
          <NavLink href={`/${locale}/contact`}>{t.nav.contact}</NavLink>

          <Link
            className="ml-4 px-3 py-1 border rounded hover:bg-gray-100"
            href={pathname.replace(
              `/${locale}`,
              locale === "fr" ? "/en" : "/fr"
            )}
          >
            {locale === "fr" ? "EN" : "FR"}
          </Link>

          {/* Cart Button */}
          <button onClick={toggleCart} className="relative hover:opacity-70 transition">
            <ShoppingCart size={22} />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </button>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>☰</button>
      </div>
      
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <MobileLink href={`/${locale}`} label={t.nav.home} />
          <MobileLink href={`/${locale}/a-propos`} label={t.nav.about} />
          <MobileLink href={`/${locale}/products`} label={t.nav.products} />

          <details className="px-4 py-2">
            <summary className="cursor-pointer py-2">{t.nav.needs}</summary>
            <div className="pl-4 flex flex-col gap-2 mt-2">
              {NEEDS_LINKS.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${locale}/besoins/${item.slug}`}
                  className="py-1 hover:underline"
                >
                  {t.needs[item.slug as keyof typeof t.needs]}
                </Link>
              ))}
            </div>
          </details>

          <MobileLink href={`/${locale}/blog`} label={t.nav.blog} />
          <MobileLink href={`/${locale}/contact`} label={t.nav.contact} />

          <div className="px-4 py-3 border-t">
            <Link
              href={pathname.replace(
                `/${locale}`,
                locale === "fr" ? "/en" : "/fr"
              )}
              className="underline"
            >
              {locale === "fr" ? "Switch to English" : "Passer en Français"}
            </Link>
          </div>

          <button onClick={toggleCart} className="px-4 py-3 flex items-center gap-2">
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

const NavLink = ({ href, children }: any) => (
  <Link href={href} className="hover:opacity-60 transition">
    {children}
  </Link>
);

const MobileLink = ({ href, label }: any) => (
  <Link href={href} className="block px-4 py-2 border-b hover:bg-gray-50">
    {label}
  </Link>
);

const NEEDS_LINKS = [
  { slug: "vitrectomie" },
  { slug: "cervicales" },
  { slug: "domicile" },
  { slug: "pro" },
  { slug: "cadeaux" },
  { slug: "travail" },
  { slug: "dormir-ventre" },
];

const TRANSLATIONS = {
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
      vitrectomie: "Convalescence après vitrectomie",
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
