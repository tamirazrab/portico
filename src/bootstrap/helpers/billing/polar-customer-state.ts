import "server-only";
import { Polar } from "@polar-sh/sdk";
import { unstable_cache } from "next/cache";

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: process.env.NODE_ENV !== "production" ? "sandbox" : "production",
});

/** Polar subscription lookup; TTL 60s (aligned with premiumProcedure). */
export const getPolarCustomerStateCached = unstable_cache(
  async (externalId: string) =>
    polarClient.customers.getStateExternal({
      externalId,
    }),
  ["polar-customer-state"],
  { revalidate: 60 },
);

export async function userHasActivePolarSubscription(
  userId: string,
): Promise<boolean> {
  const customer = await getPolarCustomerStateCached(userId);
  return Boolean(
    customer.activeSubscriptions && customer.activeSubscriptions.length > 0,
  );
}
