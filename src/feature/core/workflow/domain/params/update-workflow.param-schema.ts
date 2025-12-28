import { z } from "zod";

const updateWorkflowParamsSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1).optional(),
  nodes: z
    .array(
      z.object({
        id: z.string(),
        type: z.string().nullable().optional(),
        position: z.object({
          x: z.number(),
          y: z.number(),
        }),
        data: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .optional(),
  edges: z
    .array(
      z.object({
        source: z.string(),
        target: z.string(),
        sourceHandle: z.string().nullable().optional(),
        targetHandle: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

export type UpdateWorkflowParams = z.infer<typeof updateWorkflowParamsSchema>;

export default updateWorkflowParamsSchema;
