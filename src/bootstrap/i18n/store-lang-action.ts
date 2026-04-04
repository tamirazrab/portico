"use server";

import { cookies } from "next/headers";
import type { LANGS } from "@/bootstrap/i18n/i18n";
import { cookieName } from "@/bootstrap/i18n/settings";

export default async function storeLang(lng: LANGS) {
  (await cookies()).set(cookieName, lng);
}
