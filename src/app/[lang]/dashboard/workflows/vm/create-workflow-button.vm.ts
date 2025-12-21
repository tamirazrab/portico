"use client";

import { BaseVM } from "reactvvm";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import ButtonVm from "@/app/components/button/button.i-vm";

export default class CreateWorkflowButtonVM extends BaseVM<ButtonVm> {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): ButtonVm {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const router = useRouter();
    const { handleError, modal } = useUpgradeModal();

    const createWorkflow = useMutation(
      trpc.workflows.create.mutationOptions({
        onSuccess: (data) => {
          toast.success(`Workflow ${data.name} created successfully`);
          queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
          router.push(`/workflows/${data.id}`);
        },
        onError: (error) => {
          const handled = handleError(error);
          if (!handled) {
            toast.error(`Failed to create workflow: ${error.message}`);
          }
        },
      }),
    );

    return {
      props: {
        title: createWorkflow.isPending ? "Creating..." : "Create Workflow",
        isDisable: createWorkflow.isPending,
      },
      onClick: () => {
        createWorkflow.mutate(undefined);
      },
    };
  }
}

