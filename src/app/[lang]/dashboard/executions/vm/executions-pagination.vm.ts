"use client";

import { BaseVM } from "reactvvm";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { executionsParams } from "../params/executions-params";
import ExecutionsPaginationIVM from "../view/executions-pagination.i-vm";

export default class ExecutionsPaginationVM extends BaseVM<ExecutionsPaginationIVM> {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): ExecutionsPaginationIVM {
    const trpc = useTRPC();
    const [params, setParams] = useQueryStates(executionsParams);

    const executions = useSuspenseQuery(
      trpc.executions.getMany.queryOptions(params),
    );

    const data = executions.data as {
      page: number;
      totalPages: number;
    };

    return {
      page: data.page,
      totalPages: data.totalPages,
      isDisabled: executions.isFetching,
      onPageChange: (page: number) => {
        setParams({ ...params, page });
      },
    };
  }
}
