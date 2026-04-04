import { languages } from "@/bootstrap/i18n/settings";

export function pathHasLocalePrefix(pathname: string): boolean {
  return languages.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
}

/**
 * Maps legacy unprefixed URLs (/workflows, /login, …) to /[lang]/… canonical paths.
 */
export function localizePathname(pathname: string, lng: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (
    first &&
    !(languages as readonly string[]).includes(first) &&
    /^[a-z]{2}$/i.test(first)
  ) {
    const tail = segments.length > 1 ? `/${segments.slice(1).join("/")}` : "/";
    return localizePathname(tail, lng);
  }

  if (pathHasLocalePrefix(pathname)) {
    return pathname;
  }
  if (pathname === "/") {
    return `/${lng}/dashboard/workflows`;
  }
  if (pathname === "/login") {
    return `/${lng}/login`;
  }
  if (pathname === "/signup") {
    return `/${lng}/signup`;
  }

  const parts = pathname.split("/").filter(Boolean);
  const head = parts[0];

  if (head === "workflows") {
    if (parts.length === 1) {
      return `/${lng}/dashboard/workflows`;
    }
    return `/${lng}/dashboard/workflows/${parts[1]}`;
  }
  if (head === "credentials") {
    if (parts.length === 1) {
      return `/${lng}/dashboard/credentials`;
    }
    if (parts[1] === "new") {
      return `/${lng}/dashboard/credentials/new`;
    }
    return `/${lng}/dashboard/credentials/${parts[1]}`;
  }
  if (head === "executions") {
    if (parts.length === 1) {
      return `/${lng}/dashboard/executions`;
    }
    return `/${lng}/dashboard/executions/${parts[1]}`;
  }

  return `/${lng}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
