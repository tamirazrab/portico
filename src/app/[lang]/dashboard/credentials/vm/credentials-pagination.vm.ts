"use client";

import { BaseVM } from "reactvvm";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { credentialsParams } from "../params/credentials-params";
import CredentialsPaginationIVM from "../view/credentials-pagination.i-vm";

export default class CredentialsPaginationVM extends BaseVM<CredentialsPaginationIVM> {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): CredentialsPaginationIVM {
    const trpc = useTRPC();
    const [params, setParams] = useQueryStates(credentialsParams);

    const credentials = useSuspenseQuery(
      trpc.credentials.getMany.queryOptions(params),
    );

    const data = credentials.data as {
      page: number;
      totalPages: number;
    };

    return {
      page: data.page,
      totalPages: data.totalPages,
      isDisabled: credentials.isFetching,
      onPageChange: (page: number) => {
        setParams({ ...params, page });
      },
    };
  }
}

