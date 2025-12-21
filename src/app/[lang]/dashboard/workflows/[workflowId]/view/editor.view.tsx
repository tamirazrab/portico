"use client";

import { ReactFlow, Background, Controls, MiniMap, Panel } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeComponents } from "@/config/node-components";
import { AddNodeButton } from "../components/add-node-button";
import { ExecuteWorkflowButton } from "../components/execute-workflow-button";
import EditorIVM from "./editor.i-vm";
import EditorVM from "../vm/editor.vm";

interface EditorViewProps {
  workflowId: string;
  initialNodes: any[];
  initialEdges: any[];
}

export default function EditorView({
  workflowId,
  initialNodes,
  initialEdges,
}: EditorViewProps) {
  const vm = new EditorVM({ workflowId, initialNodes, initialEdges });
  const vmData = vm.useVM();

  return (
    <div className="size-full">
      <ReactFlow
        nodes={vmData.nodes}
        edges={vmData.edges}
        onNodesChange={vmData.onNodesChange}
        onEdgesChange={vmData.onEdgesChange}
        onConnect={vmData.onConnect}
        onInit={vmData.onInit}
        snapGrid={[10, 10]}
        snapToGrid
        colorMode={vmData.colorMode}
        fitView
        nodeTypes={nodeComponents}
        proOptions={{
          hideAttribution: true,
        }}
      >
        <Background />
        <Controls />
        <MiniMap className="border border-black/20" pannable zoomable />
        <Panel position="top-right">
          <AddNodeButton />
        </Panel>
        {vmData.hasManualTrigger && (
          <Panel position="bottom-center">
            <ExecuteWorkflowButton workflowId={vmData.workflowId} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

