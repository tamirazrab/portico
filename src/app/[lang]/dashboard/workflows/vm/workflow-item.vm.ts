"use client";

import { BaseVM } from "reactvvm";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import WorkflowItemIVM from "../view/workflow-item.i-vm";

// Using Prisma types for UI layer
type Workflow = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export default class WorkflowItemVM extends BaseVM<WorkflowItemIVM> {
  private workflow: Workflow;

  constructor(workflow: Workflow) {
    super();
    this.workflow = workflow;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): WorkflowItemIVM {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const removeWorkflow = useMutation(
      trpc.workflows.remove.mutationOptions({
        onSuccess: (data) => {
          toast.success(`Workflow "${data.name}" removed successfully`);
          queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
          queryClient.invalidateQueries(
            trpc.workflows.getOne.queryFilter({ id: data.id }),
          );
        },
        onError: (error) => {
          toast.error(`Failed to remove workflow: ${error.message}`);
        },
      }),
    );

    return {
      workflow: this.workflow,
      onRemove: () => {
        removeWorkflow.mutate({ id: this.workflow.id });
      },
      isRemoving: removeWorkflow.isPending,
    };
  }
}

