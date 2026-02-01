import BaseFailure from "@/feature/common/failures/base.failure";

/**
 * Preserves existing BaseFailure instances to prevent losing error context.
 * If reason is already a BaseFailure, returns it; otherwise returns the provided fallback.
 *
 * @param reason - The error that was thrown (Error or BaseFailure instance)
 * @param failure - Fallback failure to return if reason is not a BaseFailure
 * @returns BaseFailure instance (either the original or the fallback)
 */
export function failureOr<T extends BaseFailure<unknown>>(
  reason: unknown,
  failure: T,
): BaseFailure<unknown> {
  if (reason instanceof BaseFailure) {
    return reason;
  }
  return failure;
}

/**
 * Curried version of failureOr for use in fp-ts tryCatch error handlers.
 */
export function failureOrCurry<T extends BaseFailure<unknown>>(
  failure: T,
): (reason: unknown) => BaseFailure<unknown> {
  return (reason: unknown): BaseFailure<unknown> => {
    if (reason instanceof BaseFailure) {
      return reason;
    }
    return failure;
  };
}

