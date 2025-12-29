import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * ✅ Mets ici toutes tes langues supportées
 * (tu peux en ajouter/en retirer quand tu veux)
 */
const SUPPORTED_LOCALES = [
  "fr",
  "en",
  "es",
  "de",
  "it",
  "nl",
  "pt",
] as const;

const DEFAULT_LOCALE = "fr";

/** fichiers / routes à ignorer */
const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) Ignore next internals + fichiers statiques
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2) Récup locale depuis l'URL: /fr/...
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  // 3) Si pas de locale (ex: "/") => redirect vers "/fr"
  if (!maybeLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}`;
    return NextResponse.redirect(url);
  }

  // 4) Si la 1ère partie n'est pas une locale supportée => 404 (rewrite)
  const isSupported = (SUPPORTED_LOCALES as readonly string[]).includes(maybeLocale);

  if (!isSupported) {
    // ✅ rewrite vers une page 404 DANS une locale existante (fr)
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}/404`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

/**
 * ✅ Matcher: on applique le middleware à tout sauf _next/assets
 * (on garde quand même la logique d'ignore ci-dessus, double sécurité)
 */
export const config = {
  matcher: ["/((?!_next).*)"],
};
