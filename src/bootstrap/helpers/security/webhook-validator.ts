import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { logger } from "../logging/logger";

export interface WebhookValidationResult {
  isValid: boolean;
  error?: string;
}

const STRIPE_SIGNATURE_TOLERANCE_SEC = 300;

function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) {
    return false;
  }
  let timestamp: string | null = null;
  const signatures: string[] = [];
  for (const part of signatureHeader.split(",")) {
    const [k, v] = part.split("=");
    const key = k?.trim();
    const value = v?.trim();
    if (key === "t") {
      timestamp = value ?? null;
    }
    if (key === "v1" && value) {
      signatures.push(value);
    }
  }
  if (!timestamp || signatures.length === 0) {
    return false;
  }
  const ts = Number.parseInt(timestamp, 10);
  if (
    Number.isNaN(ts) ||
    Math.abs(Date.now() / 1000 - ts) > STRIPE_SIGNATURE_TOLERANCE_SEC
  ) {
    return false;
  }
  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  return signatures.some((sig) => {
    try {
      const sigBuf = Buffer.from(sig, "hex");
      if (sigBuf.length !== expectedBuf.length) {
        return false;
      }
      return timingSafeEqual(sigBuf, expectedBuf);
    } catch {
      return false;
    }
  });
}

/**
 * Validates Stripe webhook using signed payload (no extra runtime dependency).
 * Call with the raw request body string; do not parse JSON before this.
 */
export function validateStripeWebhookPayload(
  rawBody: string,
  request: NextRequest,
): WebhookValidationResult {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return {
      isValid: false,
      error: "STRIPE_WEBHOOK_SECRET is not configured",
    };
  }
  const signature = request.headers.get("stripe-signature");
  if (!verifyStripeSignature(rawBody, signature, secret)) {
    return { isValid: false, error: "Invalid Stripe signature" };
  }
  return { isValid: true };
}

/**
 * Google Apps Script / custom integrations must send this header.
 */
export function validateGoogleFormWebhookAuth(
  request: NextRequest,
): WebhookValidationResult {
  const secret = process.env.GOOGLE_FORM_WEBHOOK_SECRET;
  if (!secret) {
    return {
      isValid: false,
      error: "GOOGLE_FORM_WEBHOOK_SECRET is not configured",
    };
  }
  const token = request.headers.get("x-google-form-webhook-secret");
  if (!token) {
    return { isValid: false, error: "Invalid or missing webhook secret" };
  }
  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(secret, "utf8");
  if (a.length !== b.length) {
    return { isValid: false, error: "Invalid or missing webhook secret" };
  }
  if (!timingSafeEqual(a, b)) {
    return { isValid: false, error: "Invalid or missing webhook secret" };
  }
  return { isValid: true };
}

/**
 * Cron triggers: prefer Authorization: Bearer CRON_WEBHOOK_SECRET.
 * Also accepts ?secret= for providers that only support GET URL (e.g. some schedulers).
 */
export function validateCronBearer(
  request: NextRequest,
): WebhookValidationResult {
  const secret = process.env.CRON_WEBHOOK_SECRET;
  if (!secret) {
    return {
      isValid: false,
      error: "CRON_WEBHOOK_SECRET is not configured",
    };
  }
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) {
    return { isValid: true };
  }
  const url = new URL(request.url);
  const q = url.searchParams.get("secret");
  if (q && q === secret) {
    return { isValid: true };
  }
  return { isValid: false, error: "Unauthorized" };
}

/**
 * Basic webhook validation — required query parameters present.
 */
export function validateWebhookRequest(
  request: NextRequest,
  requiredParams: string[],
): WebhookValidationResult {
  if (request.method !== "POST" && request.method !== "GET") {
    return {
      isValid: false,
      error: "Invalid request method",
    };
  }

  const url = new URL(request.url);
  for (const param of requiredParams) {
    if (!url.searchParams.has(param)) {
      logger.warn("Webhook validation failed: missing parameter", {
        namespace: "webhook-validator",
        metadata: {
          missingParam: param,
          url: request.url,
        },
      });
      return {
        isValid: false,
        error: `Missing required parameter: ${param}`,
      };
    }
  }

  return { isValid: true };
}
