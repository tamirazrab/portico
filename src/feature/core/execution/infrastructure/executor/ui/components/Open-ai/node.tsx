"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { OPENAI_CHANNEL_NAME } from "@/bootstrap/integrations/inngest/channels/openai";
import { BaseExecutionNode } from "@/components/nodes/base-execution-node";
import { useNodeStatus } from "@/hooks/use-node-status";
import { fetchOpenaiRealtimeToken } from "./actions";
import { OpenaiDialog, type OpenaiFormValues } from "./dialog";

type OpenaiNodeData = {
  credentialId?: string;
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

type OpenaiNodeType = Node<OpenaiNodeData>;

export const OpenaiNode = memo((props: NodeProps<OpenaiNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { setNodes } = useReactFlow();

  const nodeData = props.data;
  // const description = nodeData?.userPrompt
  //     ? `${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0, 50)}...`
  //     : "Not Configured";
  const description = nodeData?.userPrompt
    ? `${nodeData.model || "gpt-4.1-mini"}: ${nodeData.userPrompt.slice(0, 50)}...`
    : "Not Configured";

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: OPENAI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchOpenaiRealtimeToken,
  });

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: OpenaiFormValues) => {
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
      <OpenaiDialog
        Open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/openai.svg"
        name="Openai"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

OpenaiNode.displayName = "OpenaiNode";
