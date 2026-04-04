import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";

interface AuthLayoutViewProps {
  children: React.ReactNode;
  lang: string;
}

export default function AuthLayoutView({
  children,
  lang,
}: AuthLayoutViewProps) {
  return (
    <div className="bg-muted flex min-h-svh flex-col justify-center gap-6 p-6 md:p-10 items-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href={routes.home(lang)}
          className="flex items-center gap-2 self-center font-medium"
        >
          <Image src="/logo.svg" alt="Nodebase" width={30} height={30} />
          Nodebase
        </Link>
        {children}
      </div>
    </div>
  );
}
