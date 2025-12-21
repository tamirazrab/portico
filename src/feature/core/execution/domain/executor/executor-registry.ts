import NodeType from "@/feature/core/workflow/domain/enum/node-type.enum";
import { NodeExecuter } from "../types/executor-types";
import { manualTriggerExecuter } from "./components/manual-trigger/executer";
import { HttpRequestExecuter } from "./components/http-request/executer";
import { googleFormTriggerExecuter } from "./components/google form trigger/executer";
import { stripeTriggerExecuter } from "./components/stripe trigger/executer";
import { geminiExecuter } from "./components/gemini/executer";
import { openaiExecuter } from "./components/Open-ai/executer";
import { anthropicExecuter } from "./components/Anthropic/executer";
import { discordExecuter } from "./components/discord/executer";
import { slackExecuter } from "./components/slack/executer";

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

