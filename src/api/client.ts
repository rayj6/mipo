import { getServerBaseUrl } from '../config/env';

const BASE = getServerBaseUrl();

export const DEFAULT_TIMEOUT_MS = 30000;
export const STRIP_TIMEOUT_MS = 120000;

export function getBaseUrl(): string {
  return BASE;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: object;
  token?: string | null;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

function createAbortSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const signal = controller.signal as AbortSignal & { _clear?: () => void };
  signal._clear = () => clearTimeout(id);
  return signal;
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;
  const signal = createAbortSignal(timeoutMs);
  try {
    const res = await fetch(url, { ...fetchOptions, signal });
    (signal as AbortSignal & { _clear?: () => void })._clear?.();
    return res;
  } catch (e) {
    (signal as AbortSignal & { _clear?: () => void })._clear?.();
    throw e;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; status: number }> {
  const { method = 'GET', body, token, headers: customHeaders = {}, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const url = path.startsWith('http') ? path : `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetchWithTimeout(url, {
      method,
      headers,
      timeoutMs,
      ...(body != null && { body: JSON.stringify(body) }),
    });
  } catch (e) {
    const isAbort = e instanceof Error && e.name === 'AbortError';
    const isNetworkError =
      isAbort ||
      e instanceof TypeError ||
      (e instanceof Error && (e.message === 'Failed to fetch' || e.message?.toLowerCase().includes('network')));
    const msg = isAbort
      ? 'Request timed out. Please try again.'
      : isNetworkError
        ? 'Unable to connect. Please check your internet connection and try again.'
        : (e instanceof Error ? e.message : 'Connection failed.');
    throw new Error(msg);
  }
  const text = await res.text();
  let data: T;
  try {
    data = text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    if (res.ok) {
      data = {} as T;
    } else {
      throw new Error(text || res.statusText || 'Request failed');
    }
  }
  return { data, status: res.status };
}
