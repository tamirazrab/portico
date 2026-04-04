import Link from "next/link";
import { defaultLocale, routes } from "@/lib/routes";

export default function NotFound() {
  const home = routes.home(defaultLocale());
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-lg font-semibold">Page not found</h2>
      <Link href={home} className="text-sm text-primary underline">
        Back to workflows
      </Link>
    </div>
  );
}
