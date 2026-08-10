import { config } from '@/lib/config';
import { getOrCreateGuestId } from '@/lib/guestId';
import { ApiError, type RequestOptions } from '@/types/api.types';


/**
 * Combines an internal timeout controller with an optional external signal,
 * so a caller-provided AbortSignal (e.g. a "Stop" button) and our own
 * timeout can both cancel the same request.
 */
function createCombinedSignal(
  externalSignal: AbortSignal | undefined,
  timeoutMs: number
): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const onExternalAbort = () => controller.abort();
  externalSignal?.addEventListener('abort', onExternalAbort);

  const cleanup = () => {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  };

  return { signal: controller.signal, cleanup };
}

/**
 * POSTs a JSON body to `path` and parses the JSON response as TRes.
 * The only place in the app that touches fetch() directly.
 */
export async function postJson<TReq, TRes>(
  path: string,
  body: TReq,
  options: RequestOptions = {}
): Promise<TRes> {
  const timeoutMs = options.timeoutMs ?? config.defaultTimeoutMs;
  const { signal, cleanup } = createCombinedSignal(options.signal, timeoutMs);

  let response: Response;
  try {
    const guestId = getOrCreateGuestId();
    response = await fetch(`${config.apiBaseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Guest-ID': guestId,
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {

    cleanup();
    if (err instanceof DOMException && err.name === 'AbortError') {
      const wasTimeout = !options.signal?.aborted;
      throw new ApiError(
        wasTimeout ? 'Request timed out.' : 'Request was cancelled.',
        undefined,
        wasTimeout ? 'timeout' : 'aborted'
      );
    }
    throw new ApiError(
      'Could not reach the server. Is the backend running?',
      undefined,
      'network'
    );
  }
  cleanup();

  if (!response.ok) {
    const detail = await safeReadErrorDetail(response);
    throw new ApiError(
      detail ?? `Request failed with status ${response.status}.`,
      response.status,
      'http'
    );
  }

  try {
    return (await response.json()) as TRes;
  } catch {
    throw new ApiError('Received an invalid response from the server.', response.status, 'parse');
  }
}

async function safeReadErrorDetail(response: Response): Promise<string | null> {
  try {
    const data = await response.json();
    return typeof data?.detail === 'string' ? data.detail : null;
  } catch {
    return null;
  }
}