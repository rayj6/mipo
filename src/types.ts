export type TemplateCount = 1 | 2 | 3 | 4;

/** Template from server: image + how many photos it can have (1, 2, 3, or 4) */
export interface Template {
  id: string;
  name: string;
  imageUrl: string | null;
  /** Default number of photo slots when using this template */
  slotCount: number;
  /** Allowed slot counts for this template (1, 2, 3, or 4). If present, user can choose. */
  slotOptions?: TemplateCount[];
}

/** Background from server: image */
export interface Background {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface StripOptions {
  templateCount: TemplateCount;
  templateId: string;
  backgroundId: string;
  backgroundImageUrl: string | null;
  title?: string;
  names?: string;
  date?: string;
}

export interface PhotoboothState {
  step: 'welcome' | 'templates' | 'background' | 'capture' | 'result';
  template: Template | null;
  background: Background | null;
  title: string;
  names: string;
  date: string;
  photos: string[];
}
