// @ts-ignore - toposort doesn't have types
import toposort from "toposort";
import { NonRetriableError } from "inngest";
import { createId } from "@paralleldrive/cuid2";
import { inngest } from "./client";

// Type definitions for topological sort
export type Node = {
  id: string;
  workflowId: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  credentialId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Connection = {
  id: string;
  workflowId: string;
  fromNodeId: string;
  toNodeId: string;
  fromOutput: string;
  toInput: string;
  createdAt: Date;
  updatedAt: Date;
};

export const topologicalsort = (
  nodes: Node[],
  connections: Connection[],
): Node[] => {
  if (connections.length === 0) {
    return nodes;
  }

  const edges: [string, string][] = connections.map((connection) => [
    connection.fromNodeId,
    connection.toNodeId,
  ]);

  const connectedNodeIds = new Set<string>();
  for (const conn of connections) {
    connectedNodeIds.add(conn.fromNodeId);
    connectedNodeIds.add(conn.toNodeId);
  }

  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  let sortedNodeIds: string[];
  try {
    sortedNodeIds = toposort(edges);
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new NonRetriableError("workflow contains a cyclic dependency");
    }
    throw error;
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
};

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: any;
}) =>
  inngest.send({
    name: "workflows/execute.workflow",
    data,
    id: createId(),
  });
