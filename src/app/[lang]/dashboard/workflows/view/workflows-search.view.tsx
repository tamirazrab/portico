"use client";

import WorkflowsSearchIVM from "./workflows-search.i-vm";
import WorkflowsSearchVM from "../vm/workflows-search.vm";
import { EntitySearch } from "@/components/entity-components";

export default function WorkflowsSearchView() {
  const vm = new WorkflowsSearchVM();
  const vmData = vm.useVM();

  return (
    <EntitySearch
      value={vmData.searchValue}
      onChange={vmData.onSearchChange}
      placeholder={vmData.placeholder}
    />
  );
}

