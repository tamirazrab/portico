"use client";

import { EntityPagination } from "@/components/entity-components";
import { useCredentials } from "../hooks/use-credentials-list";
import { usePagination } from "../../hooks/use-pagination";

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
