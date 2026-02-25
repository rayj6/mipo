/**
 * Centralized env/config for the app.
 * Use EXPO_PUBLIC_MIPO_SERVER_URL or MIPO_SERVER_URL for the API base URL.
 */
export function getServerBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_MIPO_SERVER_URL) {
    return process.env.EXPO_PUBLIC_MIPO_SERVER_URL.replace(/\/$/, '');
  }
  if (typeof process !== 'undefined' && process.env?.MIPO_SERVER_URL) {
    return process.env.MIPO_SERVER_URL.replace(/\/$/, '');
  }
  return 'http://localhost:3001';
}
