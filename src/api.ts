import type { Background, Template } from './types';

const getBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_MIPO_SERVER_URL) {
    return process.env.EXPO_PUBLIC_MIPO_SERVER_URL;
  }
  if (typeof process !== 'undefined' && process.env?.MIPO_SERVER_URL) {
    return process.env.MIPO_SERVER_URL;
  }
  // Development: use your machine IP or ngrok URL for device
  return 'http://localhost:3001';
};

export async function fetchTemplates(): Promise<Template[]> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/templates`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  const data = await res.json();
  return data;
}

export async function fetchBackgrounds(): Promise<Background[]> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/backgrounds`);
  if (!res.ok) throw new Error('Failed to fetch backgrounds');
  const data = await res.json();
  return data;
}

export function getTemplateImageUrl(template: Template): string | null {
  return template.imageUrl;
}

export function getBackgroundImageUrl(background: Background): string | null {
  return background.imageUrl;
}

export interface GenerateStripRequest {
  /** Template id (e.g. template_1, template_2) so server serves the right HTML. Optional; server defaults to first template. */
  templateId?: string;
  templateImageUrl: string | null;
  backgroundImageUrl: string | null;
  /** Number of frames in the selected template (2, 3, or 4) */
  slotCount: number;
  photoBase64s: string[];
  title: string;
  names: string;
  date: string;
}

export interface GenerateStripResponse {
  success: boolean;
  /** URL to strip.html with photos in frames (show in WebView) */
  stripUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  error?: string;
}

export async function generateStrip(request: GenerateStripRequest): Promise<GenerateStripResponse> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/generate-strip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      templateImageUrl: request.templateImageUrl,
      backgroundImageUrl: request.backgroundImageUrl,
      templateId: request.templateId,
      slotCount: request.slotCount,
      photoBase64s: request.photoBase64s,
      title: request.title,
      names: request.names,
      date: request.date,
    }),
  });
  const text = await res.text();
  let data: GenerateStripResponse;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    const msg = res.ok
      ? 'Server returned invalid response'
      : `Server error (${res.status}). Check that the server is running and the URL is correct.`;
    return { success: false, error: msg };
  }
  if (!res.ok) {
    return { success: false, error: (data as { error?: string }).error || res.statusText };
  }
  return data;
}

export async function uploadTempImage(imageBase64: string): Promise<{ imageUrl: string } | { error: string }> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/temp-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });
  const text = await res.text();
  let data: { imageUrl?: string; error?: string };
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    return { error: 'Invalid response' };
  }
  if (!res.ok) return { error: data.error || res.statusText };
  if (!data.imageUrl) return { error: 'No image URL returned' };
  return { imageUrl: data.imageUrl };
}

export function getSaveFrameUrl(imageUrl: string): string {
  const base = getBaseUrl();
  return `${base}/save-frame.html?imageUrl=${encodeURIComponent(imageUrl)}`;
}
