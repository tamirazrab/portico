import { z } from "zod";

export const workflowIdQuerySchema = z.object({
  workflowId: z.string().uuid(),
});
