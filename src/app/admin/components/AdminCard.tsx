"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface AdminCardProps {
  title: string;
  icon?: ReactNode;
  href?: string;         // Si présent → la carte devient cliquable
  description?: string;
}

export default function AdminCard({ title, icon, href, description }: AdminCardProps) {
  const content = (
    <div className="admin-card">
      <div className="admin-card-icon">{icon}</div>

      <div className="admin-card-info">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
    </div>
  );

  // Si un lien est fourni → on transforme en <Link>
  if (href) {
    return (
      <Link href={href} className="admin-card-link">
        {content}
      </Link>
    );
  }

  // Sinon → simple card
  return content;
}
