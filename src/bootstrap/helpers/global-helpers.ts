import { constructor } from "tsyringe/dist/typings/types";

export const isServer = typeof window === "undefined";

/**
 * Checks if the given value is a class
 */
export function isClass(fn: unknown): fn is constructor<unknown> {
  return typeof fn === "function" && /^(class|function [A-Z])/.test(fn.toString());
}
