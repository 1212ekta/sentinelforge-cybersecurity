import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes intelligently, resolving conflicts
 * (e.g. cn('p-2', 'p-4') => 'p-4', not both).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}