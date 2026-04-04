import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import type {
  AiGenerateTextParams,
  AiProviderPort,
} from "../ports/ai-provider.port";

export class OpenAiProvider implements AiProviderPort {
  constructor(private apiKey: string) {}

  async generateText(params: AiGenerateTextParams): Promise<{ text: string }> {
    const openai = createOpenAI({ apiKey: this.apiKey });
    const { steps } = await generateText({
      model: openai(params.model),
      system: params.system,
      prompt: params.prompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const first = steps[0]?.content?.[0];
    const text = first?.type === "text" ? first.text : "";
    return { text };
  }
}
