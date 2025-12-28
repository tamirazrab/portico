"use client";

import { EntityPagination } from "@/components/entity-components";
import ExecutionsPaginationVM from "../vm/executions-pagination.vm";

export default function ExecutionsPaginationView() {
  const vm = new ExecutionsPaginationVM();
  const vmData = vm.useVM();

  return (
    <EntityPagination
      page={vmData.page}
      totalPages={vmData.totalPages}
      onPageChange={vmData.onPageChange}
      disabled={vmData.isDisabled}
    />
  );
}
