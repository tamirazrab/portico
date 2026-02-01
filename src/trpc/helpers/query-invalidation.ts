import type { QueryClient } from "@tanstack/react-query";

/**
 * Query invalidation helpers for common patterns.
 * Use these after mutations to ensure UI stays in sync with server state.
 */

/**
 * Invalidate all workflow-related queries
 */
export function invalidateWorkflows(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: [["workflows"]],
  });
}

/**
 * Invalidate a specific workflow query
 */
export function invalidateWorkflow(
  queryClient: QueryClient,
  workflowId: string,
) {
  return queryClient.invalidateQueries({
    queryKey: [["workflows", "getOne"], { input: { id: workflowId } }],
  });
}

/**
 * Invalidate all credential-related queries
 */
export function invalidateCredentials(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: [["credentials"]],
  });
}

/**
 * Invalidate a specific credential query
 */
export function invalidateCredential(
  queryClient: QueryClient,
  credentialId: string,
) {
  return queryClient.invalidateQueries({
    queryKey: [["credentials", "getOne"], { input: { id: credentialId } }],
  });
}

/**
 * Invalidate all execution-related queries
 */
export function invalidateExecutions(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: [["executions"]],
  });
}

/**
 * Invalidate a specific execution query
 */
export function invalidateExecution(
  queryClient: QueryClient,
  executionId: string,
) {
  return queryClient.invalidateQueries({
    queryKey: [["executions", "getOne"], { input: { id: executionId } }],
  });
}

/**
 * Invalidate all queries (use sparingly, prefer specific invalidation)
 */
export function invalidateAll(queryClient: QueryClient) {
  return queryClient.invalidateQueries();
}

