"use client";

import { useEffect, useState } from "react";
import { PAGINATION } from "@/config/constraints";

const SEARCH_DEBOUNCE_MS = 500;

type SearchParams = {
  search?: string;
  page: number;
};

/**
 * Shared hook for search debounce logic.
 * Extracts duplicate search debounce logic from search views.
 */
export function useSearchDebounce(
  params: SearchParams,
  setParams: (params: SearchParams) => void,
  debounceMs: number = SEARCH_DEBOUNCE_MS,
) {
  const [localSearch, setLocalSearch] = useState(params.search || "");

  useEffect(() => {
    if (localSearch === "" && params.search !== "") {
      setParams({ ...params, search: "", page: PAGINATION.DEFAULT_PAGE });
      return;
    }

    const timer = setTimeout(() => {
      if (localSearch !== params.search) {
        setParams({
          ...params,
          search: localSearch,
          page: PAGINATION.DEFAULT_PAGE,
        });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localSearch, params, setParams, debounceMs]);

  useEffect(() => {
    setLocalSearch(params.search || "");
  }, [params.search]);

  return {
    searchValue: localSearch,
    onSearchChange: setLocalSearch,
  };
}

