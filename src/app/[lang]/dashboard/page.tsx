import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function DashboardIndexPage({ params }: Props) {
  const { lang } = await params;
  redirect(routes.home(lang));
}
