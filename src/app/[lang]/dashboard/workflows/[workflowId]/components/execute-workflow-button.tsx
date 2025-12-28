"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { FlaskConicalIcon } from "lucide-react";
import { toast } from "sonner";

export function ExecuteWorkflowButton({ workflowId }: { workflowId: string }) {
  const trpc = useTRPC();
  const executeWorkflow = useMutation(
    trpc.workflows.execute.mutationOptions({
      onSuccess: () => {
        toast.success("Workflow execution started");
      },
      onError: (error) => {
        toast.error(`Failed to execute workflow: ${error.message}`);
      },
    }),
  );

  const handleExecute = () => {
    executeWorkflow.mutate({ id: workflowId });
  };

  return (
    <Button
      size="lg"
      onClick={handleExecute}
      disabled={executeWorkflow.isPending}
      className="bg-primary"
    >
      <FlaskConicalIcon className="size-4" />
      Execute Workflow
    </Button>
  );
}
