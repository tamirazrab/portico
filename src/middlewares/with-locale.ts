import acceptLanguage from "accept-language";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import { cookieName, fallbackLng, languages } from "@/bootstrap/i18n/settings";
import { localizePathname, pathHasLocalePrefix } from "@/lib/locale-path";
import type { MiddlewareFactory } from "@/middlewares/middleware-factory";

acceptLanguage.languages(languages);

export const withLocale: MiddlewareFactory =
  (next) => async (req: NextRequest, evt: NextFetchEvent) => {
    let lng = fallbackLng;
    if (req.cookies.has(cookieName)) {
      const fromCookie = acceptLanguage.get(
        req.cookies.get(cookieName)?.value ?? undefined,
      );
      if (typeof fromCookie === "string" && fromCookie.length > 0) {
        lng = fromCookie;
      }
    }
    if (lng === fallbackLng) {
      const fromHeader = acceptLanguage.get(
        req.headers.get("Accept-Language") ?? undefined,
      );
      if (typeof fromHeader === "string" && fromHeader.length > 0) {
        lng = fromHeader;
      }
    }

    const pathname = req.nextUrl.pathname;

    if (!pathHasLocalePrefix(pathname) && !pathname.startsWith("/_next")) {
      const localized = localizePathname(pathname, lng);
      const url = new URL(localized + req.nextUrl.search, req.url);
      return NextResponse.redirect(url);
    }

    if (req.headers.has("referer")) {
      const refererUrl = new URL(req.headers.get("referer") ?? "", req.url);
      const lngInReferer = languages.find((l) =>
        refererUrl.pathname.startsWith(`/${l}`),
      );
      const response = NextResponse.next();
      if (lngInReferer) {
        response.cookies.set(cookieName, lngInReferer);
      }
      return response;
    }

    return next(req, evt);
  };
