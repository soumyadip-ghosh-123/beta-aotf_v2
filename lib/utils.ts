import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Escape special regex characters in a user-supplied string so it can be
 * safely interpolated into a RegExp / MongoDB `$regex` without risking
 * ReDoS (Regular-Expression Denial of Service).
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
