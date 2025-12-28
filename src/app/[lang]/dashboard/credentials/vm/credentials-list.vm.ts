"use client";

import { BaseVM } from "reactvvm";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { credentialsParams } from "../params/credentials-params";
import CredentialsListIVM from "../view/credentials-list.i-vm";

export default class CredentialsListVM extends BaseVM<CredentialsListIVM> {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): CredentialsListIVM {
    const trpc = useTRPC();
    const [params] = useQueryStates(credentialsParams);

    const credentials = useSuspenseQuery(
      trpc.credentials.getMany.queryOptions(params),
    );

    const data = credentials.data as {
      items: CredentialsListIVM["credentials"];
      totalPages: number;
      page: number;
    };

    return {
      credentials: data.items,
      isLoading: credentials.isFetching,
      isEmpty: data.items.length === 0,
      totalPages: data.totalPages,
      currentPage: data.page,
    };
  }
}
