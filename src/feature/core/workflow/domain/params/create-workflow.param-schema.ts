import { z } from "zod";

const createWorkflowParamsSchema = z.object({
  name: z.string().min(1),
  userId: z.string().min(1),
});

export type CreateWorkflowParams = z.infer<typeof createWorkflowParamsSchema>;

export default createWorkflowParamsSchema;

