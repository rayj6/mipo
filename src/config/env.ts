/**
 * Centralized env/config for the app.
 * EAS build: set EXPO_PUBLIC_MIPO_SERVER_URL (or EXPO_PUBLIC_SERVER_URL) in eas.json for production.
 */
export function getServerBaseUrl(): string {
  const url =
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_MIPO_SERVER_URL) ||
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SERVER_URL) ||
    (typeof process !== 'undefined' && process.env?.MIPO_SERVER_URL);
  if (url && typeof url === 'string') {
    return url.replace(/\/$/, '');
  }
  // Never fall back to localhost in release builds (App Review devices cannot reach it).
  // Keep localhost only for local development.
  return typeof __DEV__ !== 'undefined' && __DEV__ ? 'http://localhost:3001' : 'https://mipoapi.scarlet-technology.com';
}
