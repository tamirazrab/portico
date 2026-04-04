import { DocumentIcon } from "@heroicons/react/24/outline";
import type { ReactElement } from "react";
import HomeIcon from "@/app/components/icons/home";
import langKey from "@/feature/common/lang-keys/common.lang-key";

type RouteItem = {
  langKey: string;
  icon?:
    | ((
        props: {
          className?: string;
        } & Record<string, unknown>,
      ) => ReactElement)
    | typeof DocumentIcon;
  path: string;
};

const routeConfig: Record<string, RouteItem> = {
  home: {
    langKey: langKey.global.home,
    path: "/",
    icon: HomeIcon,
  },
  dashboard: {
    langKey: langKey.global.dashboard,
    path: "/dashboard",
    icon: DocumentIcon,
  },
};

export default routeConfig;
