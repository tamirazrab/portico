import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/bootstrap/boundaries/db/prisma";
import { checkout, polar, portal } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: process.env.NODE_ENV !== "production" ? "sandbox" : "production",
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: process.env.POLAR_PRODUCT_ID || "c67d6306-d99a-472a-b082-633f7a2ea4aa",
              slug: "Nodebase-PRO",
            },
          ],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
  ],
});

