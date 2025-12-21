"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import ExecutionDetailIVM from "./execution-detail.i-vm";
import ExecutionDetailVM from "../vm/execution-detail.vm";
import ExecutionStatus from "@/feature/core/execution/domain/enum/execution-status.enum";

// Using Prisma types for UI layer
type Execution = {
  id: string;
  workflowId: string;
  status: string;
  error: string | null;
  errorStack: string | null;
  startedAt: Date;
  completedAt: Date | null;
  inngestEventId: string;
  output: unknown;
  workflow: {
    id: string;
    name: string;
  };
};

interface ExecutionDetailViewProps {
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

export default function ExecutionDetailView({
  execution,
}: ExecutionDetailViewProps) {
  const vm = new ExecutionDetailVM(execution);
  const vmData = vm.useVM();

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon(vmData.execution.status)}
          <div>
            <CardTitle>{formatStatus(vmData.execution.status)}</CardTitle>
            <CardDescription>
              Execution for {vmData.execution.workflow.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Workflow
            </p>
            <Link
              prefetch
              className="text-sm hover:underline text-primary"
              href={`/workflows/${vmData.execution.workflowId}`}
            >
              {vmData.execution.workflow.name}
            </Link>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="text-sm">{formatStatus(vmData.execution.status)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Started</p>
            <p className="text-sm">
              {formatDistanceToNow(vmData.execution.startedAt, {
                addSuffix: true,
              })}
            </p>
          </div>
          {vmData.execution.completedAt ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <p className="text-sm">
                {formatDistanceToNow(vmData.execution.completedAt, {
                  addSuffix: true,
                })}
              </p>
            </div>
          ) : null}
          {vmData.duration !== null ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Duration
              </p>
              <p className="text-sm">{vmData.duration} seconds</p>
            </div>
          ) : null}

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Inngest Event ID
            </p>
            <p className="text-sm">{vmData.execution.inngestEventId}</p>
          </div>
        </div>
        {vmData.execution.error && (
          <div className="mt-6 p-4 bg-red-50 rounded-md space-y-3">
            <div>
              <p className="text-sm font-medium text-red-900 mb-2">
                Error Message
              </p>
              <p className="text-sm text-red-800 font-mono">
                {vmData.execution.error}
              </p>
            </div>

            {vmData.execution.errorStack && (
              <Collapsible
                open={vmData.showStackTrace}
                onOpenChange={vmData.onToggleStackTrace}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-900 hover:bg-red-100"
                  >
                    {vmData.showStackTrace ? "Hide" : "Show"} Stack Trace
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="text-xs text-red-800 p-2 mt-2 rounded bg-red-100 overflow-auto">
                    {vmData.execution.errorStack}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        {vmData.execution.output && (
          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm font-medium mb-2">Output</p>
            <pre className="text-xs font-mono overflow-auto">
              {JSON.stringify(vmData.execution.output, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

