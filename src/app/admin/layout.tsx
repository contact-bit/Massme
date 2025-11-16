// src/app/admin/layout.tsx

import type { ReactNode } from "react";

// On importe UNIQUEMENT admin.css
import "./styles/admin.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-wrapper">{children}</div>;
}
