"use server";

import { isLeft } from "fp-ts/lib/Either";
import { decrypt } from "@/bootstrap/helpers/encryption/encryption";
import { logger } from "@/bootstrap/helpers/logging/logger";
import getCredentialUseCase from "@/feature/core/credential/domain/usecase/get-credential.usecase";
import { FastCronVendor } from "../../adapters/fastcron-vendor";

export async function createorupdatecron(
  data: {
    cronExpression: string;
    credentialId: string;
    workflowId: string;
    userId: string;
    timezone?: string;
  },
  _id?: string,
): Promise<void> {
  const credentialResult = await getCredentialUseCase({
    id: data.credentialId,
    userId: data.userId,
  });

  if (isLeft(credentialResult)) {
    throw new Error("Credential not found");
  }

  const credentialValue = credentialResult.right;

  const baseUrl =
    process.env.NGROK_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  const cronSecret = process.env.CRON_WEBHOOK_SECRET;
  const secretQuery =
    cronSecret !== undefined && cronSecret !== ""
      ? `&secret=${encodeURIComponent(cronSecret)}`
      : "";
  const webhookUrl = `${baseUrl}/api/workflows/cron?workflowId=${encodeURIComponent(data.workflowId)}${secretQuery}`;

  if (!credentialValue) {
    throw new Error("Credential not found");
  }

  const vendor = new FastCronVendor();
  const entries = await vendor.list(credentialValue.value);
  const matching = entries.find((e) => e.name === data.workflowId) ?? null;

  if (matching) {
    await vendor.update({
      token: decrypt(credentialValue.value),
      id: matching.id ?? "",
      expression: data.cronExpression,
      ...(data.timezone ? { timezone: data.timezone } : {}),
    });
  } else {
    await vendor.create({
      token: decrypt(credentialValue.value),
      timezone: data.timezone || "UTC",
      name: data.workflowId,
      expression: data.cronExpression,
      url: webhookUrl,
    });
  }
}

export async function removeCron(data: {
  credentialId: string;
  workflowId: string;
  userId: string;
}): Promise<void> {
  try {
    const credentialResult = await getCredentialUseCase({
      id: data.credentialId,
      userId: data.userId,
    });

    if (isLeft(credentialResult)) {
      logger.warn("removeCron: credential not found", {
        namespace: "fastcron",
        metadata: { workflowId: data.workflowId },
      });
      return;
    }

    const credentialValue = credentialResult.right;

    const vendor = new FastCronVendor();
    const entries = await vendor.list(credentialValue.value);
    const matching = entries.find((e) => e.name === data.workflowId) ?? null;
    if (!matching) {
      // nothing to remove
      return;
    }
    await vendor.remove({
      token: decrypt(credentialValue.value),
      id: matching.id,
    });
  } catch (err) {
    logger.exception(err, {
      namespace: "fastcron",
      tags: { op: "removeCron" },
      metadata: { workflowId: data.workflowId },
    });
  }
}
