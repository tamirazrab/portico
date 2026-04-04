"use client";

import { useQueryStates } from "nuqs";
import { EntitySearch } from "@/components/entity-components";
import { useSearchDebounce } from "../../hooks/use-search-debounce";
import { credentialsParams } from "../params/credentials-params";

export default function CredentialsSearchView() {
  const [params, setParams] = useQueryStates(credentialsParams);
  const { searchValue, onSearchChange } = useSearchDebounce(params, setParams);

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search Credentials"
    />
  );
}
