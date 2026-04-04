"use client";

import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  ReactFlowInstance,
} from "@xyflow/react";
import { addEdge, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { useSetAtom } from "jotai";
import { useTheme } from "next-themes";
import { useCallback, useMemo, useState } from "react";
import { BaseVM } from "reactvvm";
import { NodeType } from "@/generated/prisma/enums";
import { editorAtom } from "../store/atoms";
import type EditorIVM from "../view/editor.i-vm";

interface EditorVMProps {
  workflowId: string;
  initialNodes: Node[];
  initialEdges: Edge[];
}

export default class EditorVM extends BaseVM<EditorIVM> {
  private workflowId: string;

  private initialNodes: Node[];

  private initialEdges: Edge[];

  constructor({ workflowId, initialNodes, initialEdges }: EditorVMProps) {
    super();
    this.workflowId = workflowId;
    this.initialNodes = initialNodes;
    this.initialEdges = initialEdges;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method from reactvvm
  useVM(): EditorIVM {
    const setEditor = useSetAtom(editorAtom);
    const { theme } = useTheme();
    const colorMode = theme === "dark" ? "dark" : "light";

    const [nodes, setNodes] = useState<Node[]>(this.initialNodes);
    const [edges, setEdges] = useState<Edge[]>(this.initialEdges);

    const onNodesChange = useCallback(
      (changes: NodeChange[]) =>
        setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
      [],
    );

    const onEdgesChange = useCallback(
      (changes: EdgeChange[]) =>
        setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
      [],
    );

    const onConnect = useCallback(
      (params: Connection) =>
        setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
      [],
    );

    const onInit = useCallback(
      (instance: ReactFlowInstance) => {
        setEditor(instance);
      },
      [setEditor],
    );

    const hasManualTrigger = useMemo(
      () => nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER),
      [nodes],
    );

    return {
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      onInit,
      colorMode,
      hasManualTrigger,
      workflowId: this.workflowId,
    };
  }
}
