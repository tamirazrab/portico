"use client";

/**
 * Shared hook for pagination handlers.
 * Extracts duplicate pagination logic from list views.
 */
export function usePagination<T extends { page: number }>(
  params: T,
  setParams: (params: T) => void,
) {
  return (newPage: number) => {
    setParams({ ...params, page: newPage });
  };
}

