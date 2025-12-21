"use client";

import { EntitySearch } from "@/components/entity-components";
import CredentialsSearchVM from "../vm/credentials-search.vm";

export default function CredentialsSearchView() {
  const vm = new CredentialsSearchVM();
  const vmData = vm.useVM();

  return (
    <EntitySearch
      value={vmData.searchValue}
      onChange={vmData.onSearchChange}
      placeholder={vmData.placeholder}
    />
  );
}

