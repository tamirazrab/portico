"use client";

import { EntitySearch } from "@/components/entity-components";
import { useQueryStates } from "nuqs";
import { credentialsParams } from "../params/credentials-params";
import { useSearchDebounce } from "../../hooks/use-search-debounce";

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
