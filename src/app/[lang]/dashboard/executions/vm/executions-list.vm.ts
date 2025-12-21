"use client";

import { BaseVM } from "reactvvm";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { executionsParams } from "../params/executions-params";
import ExecutionsListIVM from "../view/executions-list.i-vm";

export default class ExecutionsListVM extends BaseVM<ExecutionsListIVM> {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): ExecutionsListIVM {
    const trpc = useTRPC();
    const [params] = useQueryStates(executionsParams);

    const executions = useSuspenseQuery(
      trpc.executions.getMany.queryOptions(params),
    );

    const data = executions.data as {
      items: ExecutionsListIVM["executions"];
      totalPages: number;
      page: number;
    };

    return {
      executions: data.items,
      isLoading: executions.isFetching,
      isEmpty: data.items.length === 0,
      totalPages: data.totalPages,
      currentPage: data.page,
    };
  }
}

