"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  CreditCard,
  ClipboardList,
  Star,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";

import { LOGO_URL } from "@/components/navbar/navbar.data";

import "../styles/admin-navbar.css";

type AdminRole = "admin" | "logistics";

type Tab = {
  href: string;
  label: string;
  short: string;
  icon: React.ReactNode;
};

function getStoredTheme(): "dark" | "light" {
  if (typeof window === "undefined") {
    return "dark";
  }

  return localStorage.getItem("admin_theme") ===
    "light"
    ? "light"
    : "dark";
}

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<
    "dark" | "light"
  >(getStoredTheme);

  const [role, setRole] =
    useState<AdminRole>("admin");

  useEffect(() => {
    document.documentElement.dataset.adminTheme =
      theme;

    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [theme]);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unauthorized");
        return response.json() as Promise<{ role?: AdminRole }>;
      })
      .then((data) => {
        setRole(data.role === "logistics" ? "logistics" : "admin");
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [router]);

  const tabs: Tab[] = useMemo(() => {
    if (role === "logistics") {
      return [
        {
          href: "/admin/logistics",
          label: "Logistique",
          short: "Logistique",
          icon: <Truck size={17} />,
        },
      ];
    }

    return [
      {
        href: "/admin",
        label: "Dashboard",
        short: "Dashboard",
        icon: <LayoutDashboard size={17} />,
      },

      {
        href: "/admin/orders",
        label: "Commandes",
        short: "Commandes",
        icon: <ShoppingCart size={17} />,
      },

      {
        href: "/admin/products",
        label: "Produits",
        short: "Produits",
        icon: <Package size={17} />,
      },

      {
        href: "/admin/annuaire",
        label: "Annuaire",
        short: "Annuaire",
        icon: <ClipboardList size={17} />,
      },

      {
        href: "/admin/logistics",
        label: "Logistique",
        short: "Logistique",
        icon: <Truck size={17} />,
      },

      {
        href: "/admin/shipping",
        label: "Livraison",
        short: "Livraison",
        icon: <Truck size={17} />,
      },

      {
        href: "/admin/payment-methods",
        label: "Paiement",
        short: "Paiement",
        icon: <CreditCard size={17} />,
      },

      {
        href: "/admin/reviews",
        label: "Avis clients",
        short: "Avis",
        icon: <Star size={17} />,
      },

    ];
  }, [role]);

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null);
    router.replace("/admin/login");
    router.refresh();
  }

  function toggleTheme() {
    const nextTheme =
      theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    localStorage.setItem(
      "admin_theme",
      nextTheme
    );
    document.documentElement.dataset.adminTheme =
      nextTheme;
  }

  return (
    <>
      <header
        className={`admin-navbar ${scrolled ? "scrolled" : ""}`}
      >
        <div className="admin-navbar-inner">

          {/* LEFT */}
          <div className="admin-navbar-left">

            <Link
              href={
                role === "logistics"
                  ? "/admin/logistics"
                  : "/admin"
              }
              className="admin-logo"
            >
              <div className="admin-logo-mark">
                <img
                  src={LOGO_URL}
                  alt="Vitrectomed"
                  className="admin-logo-image"
                />
              </div>
            </Link>

          </div>

          {/* CENTER */}
          <div className="admin-navbar-center">
            <nav className="admin-nav">
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`admin-nav-link ${
                    isActive(tab.href)
                      ? "active"
                      : ""
                  }`}
                >
                  <span className="admin-nav-icon">
                    {tab.icon}
                  </span>

                  <span>{tab.short}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* RIGHT */}
          <div className="admin-navbar-right">
            <button
              type="button"
              className="admin-theme-toggle"
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? "Activer le mode clair"
                  : "Activer le mode sombre"
              }
              aria-label={
                theme === "dark"
                  ? "Activer le mode clair"
                  : "Activer le mode sombre"
              }
            >
              {theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            <button
              className="admin-logout"
              onClick={logout}
            >
              <LogOut size={16} />
              <span>Déconnexion</span>
            </button>

            <button
              className="admin-burger"
              onClick={() => setOpen(true)}
            >
              <Menu size={22} />
            </button>

          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <aside
        className={`admin-mobile-menu ${
          open ? "open" : ""
        }`}
      >

        <div className="admin-mobile-top">

          <div className="admin-mobile-brand">
            <div className="admin-logo-mark">
              <img
                src={LOGO_URL}
                alt="Vitrectomed"
                className="admin-logo-image"
              />
            </div>

            
          </div>

          <button
            className="admin-mobile-close"
            onClick={() => setOpen(false)}
          >
            <X size={22} />
          </button>

        </div>

        <div className="admin-mobile-links">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setOpen(false)}
              className={`admin-mobile-link ${
                isActive(tab.href)
                  ? "active"
                  : ""
              }`}
            >
              <div className="admin-mobile-link-left">
                {tab.icon}

                <span>{tab.label}</span>
              </div>

              <ChevronRight size={16} />
            </Link>
          ))}
        </div>

        <button
          className="admin-mobile-logout"
          onClick={logout}
        >
          <LogOut size={17} />
          <span>Déconnexion</span>
        </button>

      </aside>

      {/* BACKDROP */}
      <div
        className={`admin-backdrop ${
          open ? "show" : ""
        }`}
        onClick={() => setOpen(false)}
      />
    </>
  );
}
