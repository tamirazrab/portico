import NodeType from "@/feature/core/workflow/domain/enum/node-type.enum";
import { anthropicExecuter } from "./runtime/components/Anthropic/executer";
import { discordExecuter } from "./runtime/components/discord/executer";
import { geminiExecuter } from "./runtime/components/gemini/executer";
import { googleFormTriggerExecuter } from "./runtime/components/google form trigger/executer";
import { HttpRequestExecuter } from "./runtime/components/http-request/executer";
import { manualTriggerExecuter } from "./runtime/components/manual-trigger/executer";
import { openaiExecuter } from "./runtime/components/Open-ai/executer";
import { slackExecuter } from "./runtime/components/slack/executer";
import { stripeTriggerExecuter } from "./runtime/components/stripe trigger/executer";
import type { NodeExecuter } from "./types/executor-types";

export const executorRegistry: Record<NodeType, NodeExecuter> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecuter,
  [NodeType.INITIAL]: manualTriggerExecuter,
  [NodeType.HTTP_REQUEST]: HttpRequestExecuter,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecuter,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecuter,
  [NodeType.GEMINI]: geminiExecuter,
  [NodeType.ANTHROPIC]: anthropicExecuter,
  [NodeType.OPENAI]: openaiExecuter,
  [NodeType.CRON]: manualTriggerExecuter,
  [NodeType.DISCORD]: discordExecuter,
  [NodeType.SLACK]: slackExecuter,
};

export const getExecutor = (type: NodeType): NodeExecuter => {
  const executer = executorRegistry[type];
  if (!executer) {
    throw new Error(`No executor found for type ${type}`);
  }

  return executer;
};
