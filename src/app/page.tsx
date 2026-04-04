import { redirect } from "next/navigation";
import { defaultLocale, routes } from "@/lib/routes";

export default function RootPage() {
  redirect(routes.home(defaultLocale()));
}
