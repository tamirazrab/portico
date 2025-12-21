"use client";

import { EntityPagination } from "@/components/entity-components";
import CredentialsPaginationVM from "../vm/credentials-pagination.vm";

export default function CredentialsPaginationView() {
  const vm = new CredentialsPaginationVM();
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

