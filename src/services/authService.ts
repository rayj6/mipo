import * as authApi from '../api/auth';
import { getStoredToken, setStoredToken, getStoredUser, setStoredUser } from '../storage/secureStorage';

export type User = authApi.User;

export async function getToken(): Promise<string | null> {
  return getStoredToken();
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getStoredToken();
  if (!token) return null;
  try {
    const user = await authApi.getMe(token);
    await setStoredUser(user);
    return user;
  } catch {
    await setStoredToken(null);
    await setStoredUser(null);
    return null;
  }
}

export async function login(email: string, password: string): Promise<User> {
  const { user, token } = await authApi.login(email, password);
  await setStoredToken(token);
  await setStoredUser(user);
  return user;
}

export async function register(email: string, password: string, displayName: string): Promise<User> {
  const { user, token } = await authApi.register(email, password, displayName);
  await setStoredToken(token);
  await setStoredUser(user);
  return user;
}

export async function logout(): Promise<void> {
  await setStoredToken(null);
  await setStoredUser(null);
}

export async function forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
  return authApi.forgotPassword(email);
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return authApi.resetPassword(token, newPassword);
}

export async function deleteAccount(password: string): Promise<void> {
  const token = await getStoredToken();
  if (!token) throw new Error('Not signed in');
  await authApi.deleteAccount(token, password);
  await setStoredToken(null);
  await setStoredUser(null);
}

export async function updateProfile(data: { language?: string; planId?: string; subscriptionExpiresAt?: string | null }): Promise<User> {
  const token = await getStoredToken();
  if (!token) throw new Error('Not signed in');
  const user = await authApi.updateProfile(token, data);
  await setStoredUser(user);
  return user;
}
