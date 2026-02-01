"use client";

import { EntityPagination } from "@/components/entity-components";
import { useExecutions } from "../hooks/use-executions-list";
import { usePagination } from "../../hooks/use-pagination";

export default function ExecutionsPaginationView() {
  const { page, totalPages, isLoading, params, setParams } = useExecutions();
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
