"use client";

import { BaseVM } from "reactvvm";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { workflowsParams } from "../params/workflows-params";
import WorkflowsPaginationIVM from "../view/workflows-pagination.i-vm";

export default class WorkflowsPaginationVM extends BaseVM<WorkflowsPaginationIVM> {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): WorkflowsPaginationIVM {
    const trpc = useTRPC();
    const [params, setParams] = useQueryStates(workflowsParams);

    const workflows = useSuspenseQuery(
      trpc.workflows.getMany.queryOptions(params),
    );

    const data = workflows.data as {
      page: number;
      totalPages: number;
      items: unknown[];
    };

    return {
      page: data.page,
      totalPages: data.totalPages,
      isDisabled: workflows.isFetching,
      onPageChange: (page: number) => {
        setParams({ ...params, page });
      },
    };
  }
}
