import { InitialNode } from "@/components/initial-node";
import { HttpRequestNode } from "@/feature/core/execution/domain/executor/components/http-request/node";
import { ManualTriggerNode } from "@/feature/core/execution/domain/executor/components/manual-trigger/node";
import { GoogleFormTrigger } from "@/feature/core/execution/domain/executor/components/google form trigger/node";
import { StripeTriggerNode } from "@/feature/core/execution/domain/executor/components/stripe trigger/node";
import { GeminiNode } from "@/feature/core/execution/domain/executor/components/gemini/node";
import { OpenaiNode } from "@/feature/core/execution/domain/executor/components/Open-ai/node";
import { AnthropicNode } from "@/feature/core/execution/domain/executor/components/Anthropic/node";
import { CronTriggerNode } from "@/feature/core/execution/domain/executor/components/cron/node";
import { DiscordNode } from "@/feature/core/execution/domain/executor/components/discord/node";
import { SlackNode } from "@/feature/core/execution/domain/executor/components/slack/node";
import { NodeType } from "@/generated/prisma/enums";
import type { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenaiNode,
  [NodeType.ANTHROPIC]: AnthropicNode,
  [NodeType.CRON]: CronTriggerNode,
  [NodeType.DISCORD]: DiscordNode,
  [NodeType.SLACK]: SlackNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;

