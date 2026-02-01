/**
 * Shared types for executions feature.
 * These types represent the UI layer's view of execution data.
 */

export type Execution = {
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

export type ExecutionsData = {
  items: Execution[];
  page: number;
  totalPages: number;
};

