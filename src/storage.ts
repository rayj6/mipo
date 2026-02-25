import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_WELCOME = '@mipo/welcome_seen';
const KEY_GALLERY = '@mipo/gallery_entries';
const KEY_PERMISSIONS_DONE = '@mipo/permissions_done';
const KEY_CURRENT_USER = '@mipo/current_user';
const KEY_USERS = '@mipo/users';

export interface User {
  email: string;
  displayName: string;
}

interface StoredUser extends User {
  password: string;
}

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

export async function getCurrentUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_CURRENT_USER);
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u && typeof u.email === 'string' ? u : null;
  } catch {
    return null;
  }
}

export async function setCurrentUser(user: User | null): Promise<void> {
  try {
    if (user) await AsyncStorage.setItem(KEY_CURRENT_USER, JSON.stringify(user));
    else await AsyncStorage.removeItem(KEY_CURRENT_USER);
  } catch {}
}

async function getStoredUsers(): Promise<StoredUser[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_USERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function registerUser(email: string, password: string, displayName: string): Promise<{ success: boolean; error?: string }> {
  const users = await getStoredUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'An account with this email already exists.' };
  }
  users.push({ email: email.trim(), password, displayName: displayName.trim() || email.split('@')[0] });
  await AsyncStorage.setItem(KEY_USERS, JSON.stringify(users));
  const user: User = { email: email.trim(), displayName: displayName.trim() || email.split('@')[0] };
  await setCurrentUser(user);
  return { success: true };
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const users = await getStoredUsers();
  const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!u || u.password !== password) {
    return { success: false, error: 'Invalid email or password.' };
  }
  await setCurrentUser({ email: u.email, displayName: u.displayName });
  return { success: true };
}

export async function logoutUser(): Promise<void> {
  await setCurrentUser(null);
}
