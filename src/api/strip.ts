import { getBaseUrl, fetchWithTimeout, DEFAULT_TIMEOUT_MS, STRIP_TIMEOUT_MS } from './client';

export interface GenerateStripRequest {
  templateId?: string;
  templateImageUrl: string | null;
  backgroundImageUrl: string | null;
  slotCount: number;
  photoBase64s: string[];
  title: string;
  names: string;
  date: string;
  /** If user is signed in, pass token so server can allow paid templates for paid users and admins. */
  token?: string | null;
}

export interface GenerateStripResponse {
  success: boolean;
  stripUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  error?: string;
}

export async function generateStrip(request: GenerateStripRequest): Promise<GenerateStripResponse> {
  const base = getBaseUrl();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (request.token) headers.Authorization = `Bearer ${request.token}`;
  let res: Response;
  try {
    res = await fetchWithTimeout(`${base}/api/generate-strip`, {
      method: 'POST',
      headers,
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
      timeoutMs: STRIP_TIMEOUT_MS,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Request failed';
    return { success: false, error: msg };
  }
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
  let res: Response;
  try {
    res = await fetchWithTimeout(`${base}/api/temp-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
      timeoutMs: DEFAULT_TIMEOUT_MS,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Upload failed' };
  }
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
