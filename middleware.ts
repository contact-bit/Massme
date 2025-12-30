// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * ✅ Langues supportées
 */
const SUPPORTED_LOCALES = ["fr", "en", "es", "de", "it", "nl", "pt"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: Locale = "fr";

/** fichiers / routes à ignorer */
const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ 0) Autoriser en priorité toutes les routes techniques / admin
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 1) Récup locale depuis l'URL: /fr/...
  const segments = pathname.split("/");
  const maybeLocale = segments[1]; // ex: "fr" dans "/fr/checkout"

  // 2) Si URL racine "/" => redirect vers "/fr"
  if (pathname === "/" || !maybeLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}`;
    return NextResponse.redirect(url);
  }

  // 3) Si la 1ère partie n'est pas une locale supportée => 404
  const isSupported = (SUPPORTED_LOCALES as readonly string[]).includes(
    maybeLocale
  );

  if (!isSupported) {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}/404`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next).*)"],
};
