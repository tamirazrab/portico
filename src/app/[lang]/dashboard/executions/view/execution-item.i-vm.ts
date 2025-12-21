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

export default interface ExecutionItemIVM {
  execution: Execution;
}

