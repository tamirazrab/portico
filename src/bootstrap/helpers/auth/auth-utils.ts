import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/bootstrap/boundaries/auth/better-auth";
import { cookieName, fallbackLng, languages } from "@/bootstrap/i18n/settings";
import { routes } from "@/lib/routes";

async function preferredLocale(): Promise<string> {
  const store = await cookies();
  const raw = store.get(cookieName)?.value;
  if (raw && (languages as readonly string[]).includes(raw)) {
    return raw;
  }
  return fallbackLng;
}

export const requireAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(routes.login(await preferredLocale()));
  }

  return session;
};

export const requireUnauth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect(routes.home(await preferredLocale()));
  }
};
