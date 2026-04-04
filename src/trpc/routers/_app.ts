import { createTRPCRouter } from "../init";
import { credentialsRouter } from "./credentials";
import { executionsRouter } from "./executions";
import { workflowsRouter } from "./workflows";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialsRouter,
  executions: executionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
