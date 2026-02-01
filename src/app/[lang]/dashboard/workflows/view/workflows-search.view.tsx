"use client";

import { EntitySearch } from "@/components/entity-components";
import { useQueryStates } from "nuqs";
import { workflowsParams } from "../params/workflows-params";
import { useSearchDebounce } from "../../hooks/use-search-debounce";

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
