"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import type { CredentialType } from "@/generated/prisma/enums";

/**
 * Hook to fetch credentials by type.
 * Used in executor component dialogs to filter credentials by provider type.
 */
export const useCredentialsByType = (type: CredentialType) => {
  const trpc = useTRPC();
  return useQuery(trpc.credentials.getByType.queryOptions({ type }));
};

