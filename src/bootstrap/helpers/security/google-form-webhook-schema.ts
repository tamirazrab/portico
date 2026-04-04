import "server-only";
import { z } from "zod";

export const googleFormWebhookBodySchema = z
  .object({
    formId: z.string().optional(),
    formTitle: z.string().optional(),
    responseId: z.string().optional(),
    timestamp: z.union([z.string(), z.number()]).optional(),
    respondentEmail: z.string().optional(),
    responses: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export type GoogleFormWebhookBody = z.infer<typeof googleFormWebhookBodySchema>;
