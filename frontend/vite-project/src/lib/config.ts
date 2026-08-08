/**
 * Centralized environment configuration.
 * Configured via NEXT_PUBLIC_API_BASE_URL or VITE_API_BASE_URL,
 * with fallback to http://localhost:8000 for local development.
 */
const rawBaseUrl =
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_BASE_URL : undefined) ||
  (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE_URL : undefined) ||
  'http://localhost:8000';

export const config = {
  apiBaseUrl: rawBaseUrl.replace(/\/$/, ''),
  /** Default request timeout, in ms, for any API call that doesn't override it. */
  defaultTimeoutMs: 30_000,
} as const;