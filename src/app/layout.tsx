import type { ReactNode } from "react";

import {
  isLocale,
} from "@/components/navbar/navbar.data";

interface LocaleLayoutProps {
  children: ReactNode;

  params: Promise<{
    locale: string;
  }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } =
    await params;

  const currentLocale =
    isLocale(locale)
      ? locale
      : "fr";

  return (
    <html
      lang={currentLocale}
      suppressHydrationWarning
    >
      <body>
        {children}
      </body>
    </html>
  );
}