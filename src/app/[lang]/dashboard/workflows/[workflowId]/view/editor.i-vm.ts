import type { Node, Edge, NodeChange, EdgeChange, Connection } from "@xyflow/react";

export default interface EditorIVM {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
  onInit: (instance: any) => void;
  colorMode: "dark" | "light";
  hasManualTrigger: boolean;
  workflowId: string;
}

