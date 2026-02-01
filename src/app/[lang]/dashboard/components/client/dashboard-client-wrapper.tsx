"use client";

import dashboardAppModule from "@/app/[lang]/dashboard/module/dashboard.app-module";
import { useRef } from "react";
import { ReactVVMDiProvider } from "reactvvm";
import { ClientProviders } from "@/app/[lang]/dashboard/components/client/providers";

/**
 * Client boundary component for dashboard.
 * This component wraps all client-side providers and DI container,
 * allowing the parent layout to remain a Server Component.
 */
export function DashboardClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const di = useRef(dashboardAppModule());
  return (
    <ClientProviders>
      <ReactVVMDiProvider diContainer={di.current}>
        {children}
      </ReactVVMDiProvider>
    </ClientProviders>
  );
}
