import { getServerBaseUrl } from '../config/env';

const BASE = getServerBaseUrl();

export function getBaseUrl(): string {
  return BASE;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: object;
  token?: string | null;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; status: number }> {
  const { method = 'GET', body, token, headers: customHeaders = {} } = options;
  const url = path.startsWith('http') ? path : `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    method,
    headers,
    ...(body != null && { body: JSON.stringify(body) }),
  });
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
