/**
 * Canonical URL scheme: locale-first App Router paths only.
 * All dashboard and auth UI lives under /[lang]/...
 *
 * Legacy unprefixed paths (/workflows, /login, …) are redirected in middleware.
 */
import { fallbackLng, languages } from "@/bootstrap/i18n/settings";

export type AppLocale = (typeof languages)[number];

export function isAppLocale(value: string): value is AppLocale {
  return (languages as readonly string[]).includes(value);
}

export function defaultLocale(): AppLocale {
  return fallbackLng as AppLocale;
}

export const routes = {
  dashboardRoot: (lang: string) => `/${lang}/dashboard`,
  home: (lang: string) => `/${lang}/dashboard/workflows`,
  login: (lang: string) => `/${lang}/login`,
  signup: (lang: string) => `/${lang}/signup`,
  workflows: (lang: string) => `/${lang}/dashboard/workflows`,
  workflow: (lang: string, id: string) => `/${lang}/dashboard/workflows/${id}`,
  credentials: (lang: string) => `/${lang}/dashboard/credentials`,
  credentialNew: (lang: string) => `/${lang}/dashboard/credentials/new`,
  credential: (lang: string, id: string) =>
    `/${lang}/dashboard/credentials/${id}`,
  executions: (lang: string) => `/${lang}/dashboard/executions`,
  execution: (lang: string, id: string) =>
    `/${lang}/dashboard/executions/${id}`,
} as const;
