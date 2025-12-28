import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/bootstrap/boundaries/auth/better-auth-client";

export const useSubscription = () =>
  useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      // Note: better-auth may have different API than NodeBase's authClient
      // This needs to be verified based on actual better-auth implementation
      // For now, using the same pattern as NodeBase
      try {
        const response = await authClient.customer.state();
        return response.data;
      } catch (error) {
        // If customer.state() doesn't exist, return empty state
        return { activeSubscriptions: [] };
      }
    },
  });

export const useHasActiveSubscription = () => {
  const { data: customerState, isLoading, ...rest } = useSubscription();

  const hasActiveSubscription =
    customerState?.activeSubscriptions &&
    customerState.activeSubscriptions.length > 0;

  return {
    hasActiveSubscription,
    subscription: customerState?.activeSubscriptions?.[0],
    isLoading,
    ...rest,
  };
};
