import type { NodeExecuter } from "@/feature/core/execution/domain/types/executor-types";
import { manualTriggerChannel } from "@/bootstrap/integrations/inngest/channels/manual-trigger";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecuter: NodeExecuter<ManualTriggerData> = async ({
    nodeId,
    context,
    step,
    publish,
}) => {

    await publish(
        manualTriggerChannel().status({
            nodeId,
            status: "loading",
        })
    );



    const result = await step.run("manual-trigger", async () => context);

    await publish(
        manualTriggerChannel().status({
            nodeId,
            status: "success",
        })
    );

    return result;
}
