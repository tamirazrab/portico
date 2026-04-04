import { googleFormTriggerChannel } from "@/bootstrap/integrations/inngest/channels/google-form-trigger";
import type { NodeExecuter } from "@/feature/core/execution/infrastructure/executor/types/executor-types";

type GoogleFormTriggerData = Record<string, unknown>;

export const googleFormTriggerExecuter: NodeExecuter<
  GoogleFormTriggerData
> = async ({ nodeId, context, step, publish }) => {
  await publish(
    googleFormTriggerChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const result = await step.run("google-form-trigger", async () => context);

  await publish(
    googleFormTriggerChannel().status({
      nodeId,
      status: "success",
    }),
  );

  return result;
};
