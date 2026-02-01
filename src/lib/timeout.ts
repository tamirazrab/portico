/**
 * Timeout utilities for async operations.
 * Ensures operations complete within specified time limits.
 */

export class TimeoutError extends Error {
  constructor(message: string = "Operation timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Wraps a promise with a timeout.
 * 
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Custom error message
 * @returns The promise result or throws TimeoutError
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string,
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(errorMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Creates a timeout configuration for different operation types.
 */
export const TIMEOUTS = {
  SHORT: 5000, // 5 seconds - for quick operations
  MEDIUM: 15000, // 15 seconds - for standard API calls
  LONG: 30000, // 30 seconds - for complex operations
  VERY_LONG: 60000, // 60 seconds - for long-running operations
} as const;

