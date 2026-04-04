export type AiGenerateTextParams = {
  model: string;
  system: string;
  prompt: string;
};

export interface AiProviderPort {
  generateText(params: AiGenerateTextParams): Promise<{ text: string }>;
}
