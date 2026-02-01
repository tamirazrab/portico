"use client";

import { TRPCReactProvider } from "@/trpc/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Provider } from "jotai";
import { Toaster } from "sonner";

/**
 * Client-side providers wrapper.
 * This component should only be used in client components or Server Components
 * that need to provide client-side context to their children.
 *
 * Usage: Wrap client components that need tRPC, Jotai, or Nuqs functionality.
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <NuqsAdapter>
        <Provider>
          {children}
          <Toaster />
        </Provider>
      </NuqsAdapter>
    </TRPCReactProvider>
  );
}
