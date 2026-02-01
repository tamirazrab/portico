import HomeIcon from "@/app/components/icons/home";
import { FolderOpenIcon, KeyIcon, HistoryIcon } from "lucide-react";
import { usePathname, useParams } from "next/navigation";
import { useMemo } from "react";
import type React from "react";
import type { LucideIcon } from "lucide-react";

type LinkItem = {
  name: string;
  href: string;
  icon: LucideIcon | ((props: { className?: string }) => React.ReactElement);
};

/**
 * Beside of reusable vm each View can have it's own personal vm to handle it's ownlogics.
 * Difference between personal vm and other vms which extends BaseVM, is that
 * personal vm directly will be called inside of view and instinctly connected to the view,
 *  so they come together always and there is no need to be connected with interface for reusable
 *  vms.
 */
export default function useNavLinkPersonalVM() {
  const pathname = usePathname();
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  // Map of links to display in the side navigation.
  // Links are language-aware and include the language prefix.
  const links = useMemo<LinkItem[]>(
    () => [
      { name: "Home", href: `/${lang}/dashboard`, icon: HomeIcon },
      {
        name: "Workflows",
        href: `/${lang}/dashboard/workflows`,
        icon: FolderOpenIcon,
      },
      {
        name: "Credentials",
        href: `/${lang}/dashboard/credentials`,
        icon: KeyIcon,
      },
      {
        name: "Executions",
        href: `/${lang}/dashboard/executions`,
        icon: HistoryIcon,
      },
    ],
    [lang],
  );

  return {
    links,
    isLinkActive: (link: LinkItem) =>
      pathname === link.href || pathname.startsWith(`${link.href}/`),
  };
}
