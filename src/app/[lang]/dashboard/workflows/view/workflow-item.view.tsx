"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { WorkflowIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { EntityItem } from "@/components/entity-components";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { routes } from "@/lib/routes";
import { useTRPC } from "@/trpc/client";
import {
  invalidateWorkflow,
  invalidateWorkflows,
} from "@/trpc/helpers/query-invalidation";
import type { Workflow } from "../types";

interface WorkflowItemViewProps {
  workflow: Workflow;
}

export default function WorkflowItemView({ workflow }: WorkflowItemViewProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { handleError } = useUpgradeModal();

  const removeWorkflow = useMutation(
    trpc.workflows.remove.mutationOptions({
      onSuccess: (_data) => {
        toast.success(`Workflow "${workflow.name}" removed successfully`);
        invalidateWorkflows(queryClient);
        invalidateWorkflow(queryClient, workflow.id);
      },
      onError: (error) => {
        const handled = handleError(error);
        if (!handled) {
          toast.error(`Failed to remove workflow: ${error.message}`);
        }
      },
    }),
  );

  return (
    <EntityItem
      href={routes.workflow(lang, workflow.id)}
      title={workflow.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(workflow.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(workflow.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={() => removeWorkflow.mutate({ id: workflow.id })}
      isRemoving={removeWorkflow.isPending}
    />
  );
}
