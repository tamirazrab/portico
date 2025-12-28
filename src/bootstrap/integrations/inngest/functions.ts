import { NonRetriableError } from "inngest";
import ExecutionStatus from "@/feature/core/execution/domain/enum/execution-status.enum";
import NodeType from "@/feature/core/workflow/domain/enum/node-type.enum";
import { getExecutor } from "@/feature/core/execution/domain/executor/executor-registry";
import getWorkflowUseCase from "@/feature/core/workflow/domain/usecase/get-workflow.usecase";
import createExecutionUseCase from "@/feature/core/execution/domain/usecase/create-execution.usecase";
import updateExecutionStatusUseCase from "@/feature/core/execution/domain/usecase/update-execution-status.usecase";
import updateExecutionStatusByInngestEventIdUseCase from "@/feature/core/execution/domain/usecase/update-execution-status-by-inngest-event-id.usecase";
import { isLeft } from "fp-ts/lib/Either";
import prisma from "@/bootstrap/boundaries/db/prisma";
import { inngest } from "./client";
import { topologicalsort } from "./util";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { openaiChannel } from "./channels/openai";
import { anthropicChannel } from "./channels/anthropic";
import { cronTriggerChannel } from "./channels/cron";
import { DiscordChannel } from "./channels/discord";
import { SlackChannel } from "./channels/slack";
import type { Node, Connection } from "./util";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 1,
    onFailure: async ({ event, step }) => {
      const inngestEventId = event.data.event.id;
      const result = await updateExecutionStatusByInngestEventIdUseCase({
        inngestEventId,
        status: ExecutionStatus.FAILED,
        error: event.data.error.message || "Unknown error",
        errorStack: event.data.error.stack || "",
      })();

      // If update fails, we can't do much - this is a fallback
      if (isLeft(result)) {
        console.error(
          "Failed to update execution status on failure",
          result.left,
        );
      }
    },
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openaiChannel(),
      anthropicChannel(),
      cronTriggerChannel(),
      DiscordChannel(),
      SlackChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const inngestEventId = event.id;
    const { workflowId } = event.data;

    if (!workflowId || !inngestEventId) {
      throw new NonRetriableError("workflowId is required");
    }

    // Get workflow with nodes and connections
    // First get workflow to find userId, then get full workflow
    const workflowForUserId = await step.run("find-user-id", async () => {
      const wf = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: { userId: true },
      });
      return wf.userId;
    });

    const workflowResult = await step.run("get-workflow", async () => {
      const result = await getWorkflowUseCase({
        id: workflowId,
        userId: workflowForUserId,
      })();

      if (isLeft(result)) {
        throw new NonRetriableError("Workflow not found");
      }

      return result.right;
    });

    // Create execution using usecase
    let executionId: string;
    await step.run("create-execution", async () => {
      const result = await createExecutionUseCase({
        workflowId,
        inngestEventId,
      })();

      if (isLeft(result)) {
        throw new NonRetriableError("Failed to create execution");
      }

      executionId = result.right.id;
    });

    // Sort nodes topologically
    const sortedNodes = await step.run("prepare-workflow", async () =>
      topologicalsort(
        workflowResult.nodes.map((n) => ({
          id: n.id,
          workflowId: n.workflowId,
          name: n.name,
          type: n.type,
          position: n.position as { x: number; y: number },
          data: n.data as Record<string, unknown>,
          credentialId: n.credentialId || null,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt,
        })) as Node[],
        workflowResult.connections.map((c) => ({
          id: c.id,
          workflowId: c.workflowId,
          fromNodeId: c.fromNodeId,
          toNodeId: c.toNodeId,
          fromOutput: c.fromOutput,
          toInput: c.toInput,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })) as Connection[],
      ),
    );

    // Use userId we already fetched
    const userId = workflowForUserId;

    let context = event.data.initialData || {};

    // Execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        userId,
        context,
        step,
        publish,
      });
    }

    // Finalize execution using usecase
    await step.run("finalize-execution", async () => {
      const result = await updateExecutionStatusByInngestEventIdUseCase({
        inngestEventId,
        status: ExecutionStatus.SUCCESS,
        output: context,
      })();

      if (isLeft(result)) {
        throw new Error("Failed to finalize execution");
      }
    });

    return {
      workflowId,
      context,
    };
  },
);
