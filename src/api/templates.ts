import { getBaseUrl, fetchWithTimeout, DEFAULT_TIMEOUT_MS } from './client';
import type { Background, Template } from '../types';

export async function fetchTemplates(): Promise<Template[]> {
  const base = getBaseUrl();
  const res = await fetchWithTimeout(`${base}/api/templates`, { timeoutMs: DEFAULT_TIMEOUT_MS });
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function fetchBackgrounds(): Promise<Background[]> {
  const base = getBaseUrl();
  const res = await fetchWithTimeout(`${base}/api/backgrounds`, { timeoutMs: DEFAULT_TIMEOUT_MS });
  if (!res.ok) throw new Error('Failed to fetch backgrounds');
  return res.json();
}

export function getTemplateImageUrl(template: Template): string | null {
  return template.imageUrl;
}

export function getBackgroundImageUrl(background: Background): string | null {
  return background.imageUrl;
}
