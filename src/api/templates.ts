import { getBaseUrl } from './client';
import type { Background, Template } from '../types';

export async function fetchTemplates(): Promise<Template[]> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/templates`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function fetchBackgrounds(): Promise<Background[]> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/backgrounds`);
  if (!res.ok) throw new Error('Failed to fetch backgrounds');
  return res.json();
}

export function getTemplateImageUrl(template: Template): string | null {
  return template.imageUrl;
}

export function getBackgroundImageUrl(background: Background): string | null {
  return background.imageUrl;
}
