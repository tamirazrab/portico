import { SidebarTrigger } from "@/app/components/ui/sidebar";

export function AppHeader() {
  return (
    <header className="flex h-14 shrink-4 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />
    </header>
  );
}
