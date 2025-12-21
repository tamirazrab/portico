import BaseFailure from "@/feature/common/failures/base.failure";

export default class CreateWorkflowFailure extends BaseFailure<
  { reason: unknown } | undefined
> {
  constructor(metadata?: { reason: unknown }) {
    super("create-workflow", "workflow", metadata);
  }
}

