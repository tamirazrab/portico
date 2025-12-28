import BaseFailure from "@/feature/common/failures/base.failure";

export default class WorkflowNotFoundFailure extends BaseFailure<
  { workflowId: string } | undefined
> {
  constructor(metadata?: { workflowId: string }) {
    super("workflow-not-found", "workflow", metadata);
  }
}
