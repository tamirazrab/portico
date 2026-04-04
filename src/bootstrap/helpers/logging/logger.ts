import "server-only";
import * as Sentry from "@sentry/nextjs";
import { isServer } from "../global-helpers";

const SENSITIVE_KEY_RE =
  /token|secret|password|authorization|cookie|set-cookie|api[_-]?key|encryption|bearer/i;

function redactValue(value: unknown): unknown {
  if (typeof value === "string") {
    if (/^Bearer\\s+/i.test(value)) return "[REDACTED]";
    return value;
  }
  return value;
}

function redactSensitive(input: unknown): unknown {
  if (!input || typeof input !== "object") return redactValue(input);
  if (Array.isArray(input)) return input.map(redactSensitive);

  const obj = input as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEY_RE.test(k)) {
      out[k] = "[REDACTED]";
      continue;
    }
    out[k] = redactSensitive(v);
  }
  return out;
}

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LogContext {
  namespace?: string;
  metadata?: Record<string, unknown>;
  tags?: Record<string, string>;
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const safeContext = redactSensitive(context) as LogContext | undefined;

    // In production, only log errors and warnings to console
    // In development, log everything
    if (isServer) {
      if (level === LogLevel.ERROR || level === LogLevel.WARN) {
        // eslint-disable-next-line no-console
        console[level === LogLevel.ERROR ? "error" : "warn"](
          `[${level.toUpperCase()}] ${message}`,
          safeContext,
        );
      } else if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log(`[${level.toUpperCase()}] ${message}`, safeContext);
      }
    }

    // Send to Sentry for errors
    if (level === LogLevel.ERROR && isServer) {
      Sentry.captureMessage(message, {
        level: "error",
        tags: safeContext?.tags,
        extra: {
          ...safeContext,
          message,
        },
      });
    }
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: LogContext) {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Log a failure with structured context
   */
  failure(
    message: string,
    namespace: string,
    metadata?: Record<string, unknown>,
  ) {
    this.error(message, {
      namespace,
      metadata,
      tags: {
        failure: "true",
        namespace,
      },
    });
  }

  /**
   * Log an exception with full stack trace and context
   */
  exception(error: Error | unknown, context?: LogContext) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    if (isServer) {
      Sentry.captureException(error, {
        level: "error",
        tags: context?.tags,
        extra: {
          ...context,
          stack: errorStack,
        },
      });
    }

    this.error(errorMessage, {
      ...context,
      stack: errorStack,
      error: error instanceof Error ? error.name : typeof error,
    });
  }
}

export const logger = new Logger();
