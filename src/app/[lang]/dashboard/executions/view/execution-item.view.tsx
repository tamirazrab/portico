"use client";

import { EntityItem } from "@/components/entity-components";
import { formatDistanceToNow } from "date-fns";
import { useParams } from "next/navigation";
import {
  formatStatus,
  getStatusIcon,
  calculateDuration,
} from "@/lib/execution-utils";
import type { Execution } from "../types";

interface ExecutionItemViewProps {
  execution: Execution;
}

export default function ExecutionItemView({
  execution,
}: ExecutionItemViewProps) {
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  const duration = calculateDuration(
    execution.startedAt,
    execution.completedAt,
  );

  const subtitle = (
    <>
      {execution.workflow.name} • Started{" "}
      {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
      {duration ? ` • Took: ${duration}s` : ""}
    </>
  );

  return (
    <EntityItem
      href={`/${lang}/dashboard/executions/${execution.id}`}
      title={formatStatus(execution.status)}
      subtitle={subtitle}
      image={
        <div className="size-8 flex items-center justify-center">
          {getStatusIcon(execution.status)}
        </div>
      }
    />
  );
}
