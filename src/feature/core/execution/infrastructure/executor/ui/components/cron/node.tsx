import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { authClient } from "@/bootstrap/boundaries/auth/better-auth-client";
import { CRON_TRIGGER_CHANNEL_NAME } from "@/bootstrap/integrations/inngest/channels/cron";
import { BaseTriggerNode } from "@/components/nodes/base-trigger-node";
import { useNodeStatus } from "@/hooks/use-node-status";
import { fetchCronTriggerRealtimeToken } from "./actions";
import { createorupdatecron, removeCron } from "./croner";
import { CronTriggerDialog, type CronTriggerFormValues } from "./dialog";

type CronTriggerNodeData = {
  credentialId: string;
  cronExpression: string;
  timezone?: string;
  workflowId?: string;
};

type CronTriggerNodeType = Node<CronTriggerNodeData>;

export const CronTriggerNode = memo((props: NodeProps<CronTriggerNodeType>) => {
  const [DialogOpen, setDialogOpen] = useState(false);
  const { data: session } = authClient.useSession();

  const nodeData = props.data;

  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: CRON_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchCronTriggerRealtimeToken,
  });

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = async (values: CronTriggerFormValues) => {
    const userId = session?.user?.id;
    if (!userId) {
      // eslint-disable-next-line no-console
      console.error("createorupdatecron: missing session user");
      return;
    }
    try {
      await createorupdatecron(
        {
          cronExpression: values.cronExpression,
          credentialId: values.credentialId,
          workflowId: values.workflowId,
          userId,
          timezone: values.timezone,
        },
        props.id,
      );
    } catch (err) {
      // Log the error but continue to persist the node data locally
      // eslint-disable-next-line no-console
      console.error("createorupdatecron failed:", err);
    }

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      }),
    );
  };

  return (
    <>
      <CronTriggerDialog
        Open={DialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseTriggerNode
        {...props}
        id={props.id}
        icon="/cron.svg"
        name="Cron Trigger"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        onBeforeDelete={async () => {
          try {
            const userId = session?.user?.id;
            if (nodeData?.credentialId && nodeData?.workflowId && userId) {
              await removeCron({
                credentialId: nodeData.credentialId,
                workflowId: nodeData.workflowId,
                userId,
              });
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error("removeCron on delete failed:", err);
          }
        }}
      />
    </>
  );
});

CronTriggerNode.displayName = "CronTriggerNode";
