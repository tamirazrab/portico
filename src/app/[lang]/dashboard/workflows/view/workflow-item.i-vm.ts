// Using Prisma types for UI layer (presentation only)
type Workflow = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export default interface WorkflowItemIVM {
  workflow: Workflow;
  onRemove: () => void;
  isRemoving: boolean;
}
