"use client";

import { BaseVM } from "reactvvm";
import { useEffect, useState } from "react";
import { PAGINATION } from "@/config/constraints";
import { useQueryStates } from "nuqs";
import { workflowsParams } from "../params/workflows-params";
import WorkflowsSearchIVM from "../view/workflows-search.i-vm";

export default class WorkflowsSearchVM extends BaseVM<WorkflowsSearchIVM> {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): WorkflowsSearchIVM {
    const [params, setParams] = useQueryStates(workflowsParams);
    const [localSearch, setLocalSearch] = useState(params.search || "");

    useEffect(() => {
      if (localSearch === "" && params.search !== "") {
        setParams({ ...params, search: "", page: PAGINATION.DEFAULT_PAGE });
        return undefined;
      }

      const timer = setTimeout(() => {
        if (localSearch !== params.search) {
          setParams({
            ...params,
            search: localSearch,
            page: PAGINATION.DEFAULT_PAGE,
          });
        }
      }, 500);

      return () => clearTimeout(timer);
    }, [localSearch, params, setParams]);

    useEffect(() => {
      setLocalSearch(params.search || "");
    }, [params.search]);

    return {
      searchValue: localSearch,
      onSearchChange: setLocalSearch,
      placeholder: "Search Workflows",
    };
  }
}

