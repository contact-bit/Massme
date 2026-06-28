import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/server/adminSession";

const SUPPORTED_LOCALES = ["fr", "en", "es", "de", "it", "nl"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: Locale = "fr";
const PUBLIC_FILE = /\.(.*)$/;

function isLogisticsAdminPath(pathname: string) {
  return (
    pathname === "/admin/logistics" ||
    pathname.startsWith("/admin/logistics/")
  );
}

function isLogisticsApiRequest(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method.toUpperCase();

  if (pathname === "/api/admin/session") return true;
  if (pathname === "/api/admin/orders" && method === "GET") return true;
  if (pathname === "/api/admin/orders/delivery-note" && method === "GET") {
    return true;
  }
  if (
    /^\/api\/admin\/orders\/[^/]+$/.test(pathname) &&
    method === "PATCH"
  ) {
    return true;
  }
  return false;
}

function hasInvalidMutationOrigin(req: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method.toUpperCase())) {
    return false;
  }

  const origin = req.headers.get("origin");
  return Boolean(origin && origin !== req.nextUrl.origin);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin/")) {
    const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = await verifyAdminSessionToken(token);

    if (pathname === "/admin/login") {
      if (!session) return NextResponse.next();

      const url = req.nextUrl.clone();
      url.pathname =
        session.role === "logistics" ? "/admin/logistics" : "/admin";
      return NextResponse.redirect(url);
    }

    if (!session) {
      if (pathname.startsWith("/api/admin/")) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (
      pathname.startsWith("/api/admin/") &&
      hasInvalidMutationOrigin(req)
    ) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    if (session.role === "logistics") {
      if (pathname.startsWith("/api/admin/")) {
        if (!isLogisticsApiRequest(req)) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } else if (!isLogisticsAdminPath(pathname)) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/logistics";
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (pathname === "/" || !maybeLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}`;
    return NextResponse.redirect(url);
  }

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
