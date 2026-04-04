"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { BaseVM } from "reactvvm";
import { toast } from "sonner";
import type ButtonVm from "@/app/components/button/button.i-vm";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useTRPC } from "@/trpc/client";
import { invalidateWorkflows } from "@/trpc/helpers/query-invalidation";

export default class CreateWorkflowButtonVM extends BaseVM<ButtonVm> {
  // BaseVM pattern: useVM is called from a React component, hooks are valid here
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useVM(): ButtonVm {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const router = useRouter();
    const params = useParams();
    const lang = (params?.lang as string) || "en";
    const { handleError } = useUpgradeModal();

    const createWorkflow = useMutation(
      trpc.workflows.create.mutationOptions({
        onSuccess: (data) => {
          toast.success(`Workflow ${data.name} created successfully`);
          invalidateWorkflows(queryClient);
          router.push(`/${lang}/dashboard/workflows/${data.id}`);
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
