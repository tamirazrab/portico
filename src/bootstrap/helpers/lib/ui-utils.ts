import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * To connect tailwind classes.
 * @param inputs Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
