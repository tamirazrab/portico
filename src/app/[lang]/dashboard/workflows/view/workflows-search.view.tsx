"use client";

import { useQueryStates } from "nuqs";
import { EntitySearch } from "@/components/entity-components";
import { useSearchDebounce } from "../../hooks/use-search-debounce";
import { workflowsParams } from "../params/workflows-params";

export default function WorkflowsSearchView() {
  const [params, setParams] = useQueryStates(workflowsParams);
  const { searchValue, onSearchChange } = useSearchDebounce(params, setParams);

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search Workflows"
    />
  );
}
