"use client";

import { EntityPagination } from "@/components/entity-components";
import { usePagination } from "../../hooks/use-pagination";
import { useWorkflows } from "../hooks/use-workflows";

export default function WorkflowsPaginationView() {
  const { page, totalPages, isLoading, params, setParams } = useWorkflows();
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
