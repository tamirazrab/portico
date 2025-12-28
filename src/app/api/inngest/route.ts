import { serve } from "inngest/next";
import { inngest } from "@/bootstrap/integrations/inngest/client";
import { executeWorkflow } from "@/bootstrap/integrations/inngest/functions";

// Create an API that serves Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [executeWorkflow],
});
