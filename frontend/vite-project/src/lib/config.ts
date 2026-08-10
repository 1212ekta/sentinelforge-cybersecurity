/**
 * Centralized environment configuration for SentinelForge frontend.
 * Configured via NEXT_PUBLIC_API_BASE_URL or VITE_API_BASE_URL,
 * with fallback to http://localhost:8000 for local development.
 */
const rawBaseUrl =
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_BASE_URL : undefined) ||
  (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE_URL : undefined) ||
  'http://localhost:8000';

const rawAiTimeoutMs =
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_AI_TIMEOUT_MS : undefined) ||
  (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_AI_TIMEOUT_MS : undefined);

const parsedAiTimeoutMs = rawAiTimeoutMs ? parseInt(rawAiTimeoutMs, 10) : 60_000;

export const config = {
  apiBaseUrl: rawBaseUrl.replace(/\/$/, ''),
  /** Default request timeout, in ms, for REST API metadata operations (30s). */
  defaultTimeoutMs: 30_000,
  /** Configurable timeout, in ms, for AI completion and security analysis calls (default 60s). */
  aiTimeoutMs: Number.isNaN(parsedAiTimeoutMs) ? 60_000 : parsedAiTimeoutMs,
} as const;