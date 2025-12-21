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

export default interface ExecutionsListIVM {
  executions: Execution[];
  isLoading: boolean;
  isEmpty: boolean;
  totalPages: number;
  currentPage: number;
}

