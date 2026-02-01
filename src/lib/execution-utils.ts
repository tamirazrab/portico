import type { ReactElement } from "react";
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import { ExecutionStatus } from "@/generated/prisma/enums";

const MILLISECONDS_PER_SECOND = 1000;

/**
 * Formats execution status string to title case.
 * Example: "SUCCESS" -> "Success"
 */
export function formatStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

/**
 * Returns the appropriate icon component for an execution status.
 */
export function getStatusIcon(status: string): ReactElement {
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

/**
 * Calculates the duration of an execution in seconds.
 * Returns null if the execution hasn't completed.
 */
export function calculateDuration(
  startedAt: Date,
  completedAt: Date | null,
): number | null {
  if (!completedAt) {
    return null;
  }
  return Math.round(
    (completedAt.getTime() - startedAt.getTime()) / MILLISECONDS_PER_SECOND,
  );
}

