import BaseFailure from "@/feature/common/failures/base.failure";

export default class PremiumRequiredFailure extends BaseFailure<undefined> {
  constructor() {
    super("premium-required", "workflow", undefined);
  }
}
