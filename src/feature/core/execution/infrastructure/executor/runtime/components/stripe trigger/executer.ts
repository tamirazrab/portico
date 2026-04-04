import { stripeTriggerChannel } from "@/bootstrap/integrations/inngest/channels/stripe-trigger";
import type { NodeExecuter } from "@/feature/core/execution/infrastructure/executor/types/executor-types";

type StripeTriggerData = Record<string, unknown>;

export const stripeTriggerExecuter: NodeExecuter<StripeTriggerData> = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    stripeTriggerChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const result = await step.run("stripe-trigger", async () => context);

  await publish(
    stripeTriggerChannel().status({
      nodeId,
      status: "success",
    }),
  );

  return result;
};
