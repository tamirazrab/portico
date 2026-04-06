"use server";

import {
  createorupdatecron as createOrUpdateCronImpl,
  removeCron as removeCronImpl,
} from "../../../runtime/components/cron/croner";

export async function createorupdatecron(
  ...args: Parameters<typeof createOrUpdateCronImpl>
) {
  return createOrUpdateCronImpl(...args);
}

export async function removeCron(...args: Parameters<typeof removeCronImpl>) {
  return removeCronImpl(...args);
}
