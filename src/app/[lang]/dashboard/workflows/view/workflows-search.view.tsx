"use client";

import { EntitySearch } from "@/components/entity-components";
import WorkflowsSearchVM from "../vm/workflows-search.vm";
import WorkflowsSearchIVM from "./workflows-search.i-vm";

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
