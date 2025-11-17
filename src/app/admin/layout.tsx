// src/app/admin/layout.tsx
import type { ReactNode } from "react";

// 🎨 On importe aussi les styles GLOBALS du site
import "@/styles/tokens.css";
import "@/styles/utilities.css";
import "@/styles/components.css";

// 🎨 Puis les styles ADMIN
import "./styles/admin.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-wrapper">{children}</div>;
}
