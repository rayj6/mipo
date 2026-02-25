import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_WELCOME = '@mipo/welcome_seen';
const KEY_GALLERY = '@mipo/gallery_entries';
const KEY_PERMISSIONS_DONE = '@mipo/permissions_done';
const KEY_HAS_PAID_PLAN = '@mipo/has_paid_plan';

export interface GalleryEntry {
  id: string;
  uri: string;
  createdAt: string;
  templateName?: string;
}

export async function getWelcomeSeen(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY_WELCOME);
    return v === '1';
  } catch {
    return false;
  }
}

export async function setWelcomeSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_WELCOME, '1');
  } catch {}
}

export async function getGalleryEntries(): Promise<GalleryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_GALLERY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addGalleryEntry(entry: Omit<GalleryEntry, 'id'>): Promise<GalleryEntry> {
  const full: GalleryEntry = {
    ...entry,
    id: `g_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
  };
  const list = await getGalleryEntries();
  list.unshift(full);
  await AsyncStorage.setItem(KEY_GALLERY, JSON.stringify(list));
  return full;
}

export async function removeGalleryEntry(id: string): Promise<void> {
  const list = await getGalleryEntries();
  const next = list.filter((e) => e.id !== id);
  await AsyncStorage.setItem(KEY_GALLERY, JSON.stringify(next));
}

export async function getPermissionsDone(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY_PERMISSIONS_DONE);
    return v === '1';
  } catch {
    return false;
  }
}

export async function setPermissionsDone(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_PERMISSIONS_DONE, '1');
  } catch {}
}

export async function getHasPaidPlan(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY_HAS_PAID_PLAN);
    return v === '1';
  } catch {
    return false;
  }
}

export async function setHasPaidPlan(has: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_HAS_PAID_PLAN, has ? '1' : '0');
  } catch {}
}
