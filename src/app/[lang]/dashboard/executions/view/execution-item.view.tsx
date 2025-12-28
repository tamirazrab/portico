"use client";

import { EntityItem } from "@/components/entity-components";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import ExecutionStatus from "@/feature/core/execution/domain/enum/execution-status.enum";
import ExecutionItemVM from "../vm/execution-item.vm";
import ExecutionItemIVM from "./execution-item.i-vm";

// Using Prisma types for UI layer
type Execution = {
  id: string;
  workflowId: string;
  status: string;
  error: string | null;
  startedAt: Date;
  completedAt: Date | null;
  workflow: {
    id: string;
    name: string;
  };
};

interface ExecutionItemViewProps {
  execution: Execution;
}

function getStatusIcon(status: string) {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-600" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600" />;
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-blue-600 animate-spin" />;
    default:
      return <ClockIcon className="size-5 text-muted-foreground" />;
  }
}

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function ExecutionItemView({
  execution,
}: ExecutionItemViewProps) {
  const vm = new ExecutionItemVM(execution);
  const vmData = vm.useVM();

  const duration = vmData.execution.completedAt
    ? Math.round(
        (vmData.execution.completedAt.getTime() -
          vmData.execution.startedAt.getTime()) /
          1000,
      )
    : null;

  const subtitle = (
    <>
      {vmData.execution.workflow.name} • Started{" "}
      {formatDistanceToNow(vmData.execution.startedAt, { addSuffix: true })}
      {duration ? ` • Took: ${duration}s` : ""}
    </>
  );

  return (
    <EntityItem
      href={`/executions/${vmData.execution.id}`}
      title={formatStatus(vmData.execution.status)}
      subtitle={subtitle}
      image={
        <div className="size-8 flex items-center justify-center">
          {getStatusIcon(vmData.execution.status)}
        </div>
      }
    />
  );
}
