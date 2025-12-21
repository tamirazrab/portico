"use client";

import { BaseView } from "reactvvm";
import WorkflowItemIVM from "./workflow-item.i-vm";
import WorkflowItemVM from "../vm/workflow-item.vm";
import { EntityItem } from "@/components/entity-components";
import { WorkflowIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Using Prisma types for UI layer
type Workflow = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

interface WorkflowItemViewProps {
  workflow: Workflow;
}

export default function WorkflowItemView({ workflow }: WorkflowItemViewProps) {
  const vm = new WorkflowItemVM(workflow);
  const vmData = vm.useVM();

  return (
    <EntityItem
      href={`/workflows/${vmData.workflow.id}`}
      title={vmData.workflow.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(vmData.workflow.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(vmData.workflow.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={vmData.onRemove}
      isRemoving={vmData.isRemoving}
    />
  );
}

