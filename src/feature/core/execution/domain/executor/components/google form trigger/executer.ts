import type { NodeExecuter } from "@/feature/core/execution/domain/types/executor-types";
import { googleFormTriggerChannel } from "@/bootstrap/integrations/inngest/channels/google-form-trigger";

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
