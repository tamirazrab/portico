import { redirect } from "next/navigation";
import { defaultLocale, isAppLocale, routes } from "@/lib/routes";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function LangRootPage({ params }: Props) {
  const { lang } = await params;
  const locale = isAppLocale(lang) ? lang : defaultLocale();
  redirect(routes.home(locale));
}
