import "server-only"; // <-- ensure this file cannot be imported from the client
import {
  dehydrate,
  HydrationBoundary,
  type QueryClient,
} from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

export const caller = appRouter.createCaller(createTRPCContext);

type PrefetchQueryOptions = Parameters<QueryClient["prefetchQuery"]>[0];
type PrefetchInfiniteQueryOptions = Parameters<
  QueryClient["prefetchInfiniteQuery"]
>[0];

export function prefetch(
  queryOptions: PrefetchQueryOptions | PrefetchInfiniteQueryOptions,
) {
  const queryClient = getQueryClient();
  const meta = queryOptions.queryKey[1];
  const isInfinite =
    meta !== null &&
    typeof meta === "object" &&
    "type" in meta &&
    meta.type === "infinite";
  if (isInfinite) {
    void queryClient.prefetchInfiniteQuery(
      queryOptions as PrefetchInfiniteQueryOptions,
    );
  } else {
    void queryClient.prefetchQuery(queryOptions as PrefetchQueryOptions);
  }
}

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}
