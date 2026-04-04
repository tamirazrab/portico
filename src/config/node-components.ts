import type { NodeTypes } from "@xyflow/react";
import { InitialNode } from "@/components/initial-node";
import { AnthropicNode } from "@/feature/core/execution/infrastructure/executor/ui/components/Anthropic/node";
import { CronTriggerNode } from "@/feature/core/execution/infrastructure/executor/ui/components/cron/node";
import { DiscordNode } from "@/feature/core/execution/infrastructure/executor/ui/components/discord/node";
import { GeminiNode } from "@/feature/core/execution/infrastructure/executor/ui/components/gemini/node";
import { GoogleFormTrigger } from "@/feature/core/execution/infrastructure/executor/ui/components/google form trigger/node";
import { HttpRequestNode } from "@/feature/core/execution/infrastructure/executor/ui/components/http-request/node";
import { ManualTriggerNode } from "@/feature/core/execution/infrastructure/executor/ui/components/manual-trigger/node";
import { OpenaiNode } from "@/feature/core/execution/infrastructure/executor/ui/components/Open-ai/node";
import { SlackNode } from "@/feature/core/execution/infrastructure/executor/ui/components/slack/node";
import { StripeTriggerNode } from "@/feature/core/execution/infrastructure/executor/ui/components/stripe trigger/node";
import { NodeType } from "@/generated/prisma/enums";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTrigger,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenaiNode,
  [NodeType.ANTHROPIC]: AnthropicNode,
  [NodeType.CRON]: CronTriggerNode,
  [NodeType.DISCORD]: DiscordNode,
  [NodeType.SLACK]: SlackNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
