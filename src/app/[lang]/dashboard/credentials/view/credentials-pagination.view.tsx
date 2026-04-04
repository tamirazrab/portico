"use client";

import { EntityPagination } from "@/components/entity-components";
import { usePagination } from "../../hooks/use-pagination";
import { useCredentials } from "../hooks/use-credentials-list";

export default function CredentialsPaginationView() {
  const { page, totalPages, isLoading, params, setParams } = useCredentials();
  const handlePageChange = usePagination(params, setParams);

  return (
    <EntityPagination
      page={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      disabled={isLoading}
    />
  );
}
