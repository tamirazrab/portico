"use client";

import { BaseVM } from "reactvvm";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { workflowsParams } from "../params/workflows-params";
import WorkflowsListIVM from "../view/workflows-list.i-vm";

export default class WorkflowsListVM extends BaseVM<WorkflowsListIVM> {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): WorkflowsListIVM {
    const trpc = useTRPC();
    const [params] = useQueryStates(workflowsParams);

    const workflows = useSuspenseQuery(
      trpc.workflows.getMany.queryOptions(params),
    );

    return {
      workflows: workflows.data.items,
      isLoading: workflows.isFetching,
      isEmpty: workflows.data.items.length === 0,
      totalPages: workflows.data.totalPages,
      currentPage: workflows.data.page,
    };
  }
}
