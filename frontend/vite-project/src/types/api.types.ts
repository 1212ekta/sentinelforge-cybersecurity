/** Normalized error shape every service throws, regardless of failure cause. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly cause?: 'network' | 'timeout' | 'aborted' | 'http' | 'parse'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  /** Caller-provided signal (e.g. from a "Stop" button) — merged with the internal timeout. */
  signal?: AbortSignal;
  /** Overrides config.defaultTimeoutMs for this call. */
  timeoutMs?: number;
}