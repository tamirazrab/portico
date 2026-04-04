import { AppSidebar } from "@/app/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/app/components/ui/sidebar";
import { requireAuth } from "@/bootstrap/helpers/auth/auth-utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-accent/20">{children}</SidebarInset>
    </SidebarProvider>
  );
}
