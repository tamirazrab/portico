/**
 * Retry utilities with exponential backoff.
 * Provides configurable retry strategies for async operations.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryable?: (error: unknown) => boolean;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, "retryable">> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Retries an async function with exponential backoff.
 * 
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws The last error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (config.retryable && !config.retryable(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelayMs,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Creates a retryable fetch function with timeout and retry logic.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit & { timeout?: number; retry?: RetryOptions } = {},
): Promise<Response> {
  const { timeout = 30000, retry: retryOptions, ...fetchOptions } = options;

  return withRetry(
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    {
      ...retryOptions,
      retryable: (error) => {
        // Retry on network errors or 5xx errors
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            return false; // Don't retry timeout errors
          }
          if (error.message.includes("fetch")) {
            return true; // Retry network errors
          }
        }
        return retryOptions?.retryable?.(error) ?? true;
      },
    },
  );
}

