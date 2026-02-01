import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

/**
 * Query client configuration with cache invalidation strategies.
 *
 * Cache invalidation:
 * - Queries are considered stale after 30 seconds
 * - Use queryClient.invalidateQueries() after mutations
 * - Use query tags for targeted invalidation (e.g., ['workflows'], ['credentials'])
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          // tRPC errors have data.httpStatus or code property
          if (error && typeof error === "object") {
            // Check for tRPC error structure
            if ("data" in error && error.data && typeof error.data === "object") {
              const { httpStatus } = error.data as { httpStatus?: number };
              if (httpStatus && httpStatus >= 400 && httpStatus < 500) {
                return false;
              }
            }
            // Check for error code (e.g., BAD_REQUEST, UNAUTHORIZED)
            if ("code" in error) {
              const code = error.code as string;
              if (code === "BAD_REQUEST" || code === "UNAUTHORIZED" || code === "FORBIDDEN" || code === "NOT_FOUND") {
                return false;
              }
            }
          }
          // Retry up to 2 times for other errors (5xx, network errors, etc.)
          // Exponential backoff is handled by React Query
          return failureCount < 2;
        },
        // Add timeout for queries
        networkMode: "online",
      },
      mutations: {
        retry: false, // Don't retry mutations by default
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}
