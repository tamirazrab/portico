import { z } from "zod";
import baseUserParamsSchema from "@/feature/core/user/domain/params/base-user-param-schema";

const updateUserParamsSchema = z.object({
  id: z.string().trim(),
  ...baseUserParamsSchema.shape,
});

export type UpdateUserParams = z.infer<typeof updateUserParamsSchema>;

export default updateUserParamsSchema;
