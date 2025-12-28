import { createTRPCRouter } from "../init";
import { workflowsRouter } from "./workflows";
import { credentialsRouter } from "./credentials";
import { executionsRouter } from "./executions";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialsRouter,
  executions: executionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
