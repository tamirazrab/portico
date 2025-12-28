"use client";

import { BaseVM } from "reactvvm";
import { useEffect, useState } from "react";
import { PAGINATION } from "@/config/constraints";
import { useQueryStates } from "nuqs";
import { credentialsParams } from "../params/credentials-params";
import CredentialsSearchIVM from "../view/credentials-search.i-vm";

export default class CredentialsSearchVM extends BaseVM<CredentialsSearchIVM> {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): CredentialsSearchIVM {
    const [params, setParams] = useQueryStates(credentialsParams);
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
      placeholder: "Search Credentials",
    };
  }
}
