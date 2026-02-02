// src/components/Navbar.tsx
"use client";

import type { FC, ReactNode } from "react";

type NavbarProps = {
  locale?: string;
  children?: ReactNode; // si tu en avais
};

const Navbar: FC<NavbarProps> = ({ locale }) => {
  const currentLocale = locale ?? "fr";

  return (
    <header className="navbar">
      {/* ton code existant, en utilisant currentLocale si besoin */}
    </header>
  );
};

export default Navbar;
