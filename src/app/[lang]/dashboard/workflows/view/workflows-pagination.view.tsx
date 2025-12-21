"use client";

import { EntityPagination } from "@/components/entity-components";
import WorkflowsPaginationVM from "../vm/workflows-pagination.vm";

export default function WorkflowsPaginationView() {
  const vm = new WorkflowsPaginationVM();
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
