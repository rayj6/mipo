import { apiRequest } from './client';

export interface User {
  id: number;
  email: string;
  displayName: string;
  language?: string;
  planId?: string;
  subscriptionExpiresAt?: string | null;
  hasPaidAccess?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data, status } = await apiRequest<LoginResponse | ApiError>('/api/auth/login', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
  });
  if (status !== 200) {
    throw new Error((data as ApiError).error || 'Login failed');
  }
  return data as LoginResponse;
}

export async function register(
  email: string,
  password: string,
  displayName: string
): Promise<RegisterResponse> {
  const { data, status } = await apiRequest<RegisterResponse | ApiError>('/api/auth/register', {
    method: 'POST',
    body: {
      email: email.trim().toLowerCase(),
      password,
      displayName: displayName.trim() || email.trim().split('@')[0],
    },
  });
  if (status !== 201 && status !== 200) {
    throw new Error((data as ApiError).error || 'Registration failed');
  }
  return data as RegisterResponse;
}

export async function getMe(token: string): Promise<User> {
  const { data, status } = await apiRequest<User | ApiError>('/api/auth/me', {
    method: 'GET',
    token,
  });
  if (status !== 200) {
    throw new Error((data as ApiError).error || 'Session expired');
  }
  return data as User;
}

export async function forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
  const { data, status } = await apiRequest<{ message: string; resetToken?: string } | ApiError>(
    '/api/auth/forgot-password',
    { method: 'POST', body: { email: email.trim().toLowerCase() } }
  );
  if (status !== 200) {
    throw new Error((data as ApiError).error || 'Request failed');
  }
  return data as { message: string; resetToken?: string };
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const { data, status } = await apiRequest<{ message: string } | ApiError>(
    '/api/auth/reset-password',
    { method: 'POST', body: { token, newPassword } }
  );
  if (status !== 200) {
    throw new Error((data as ApiError).error || 'Reset failed');
  }
  return data as { message: string };
}

export async function deleteAccount(token: string, password: string): Promise<{ message: string }> {
  const { data, status } = await apiRequest<{ message: string } | ApiError>(
    '/api/auth/delete-account',
    { method: 'POST', token, body: { password } }
  );
  if (status !== 200) {
    throw new Error((data as ApiError).error || 'Failed to delete account');
  }
  return data as { message: string };
}

export async function updateProfile(token: string, data: { language?: string; planId?: string; subscriptionExpiresAt?: string | null }): Promise<User> {
  const { data: res, status } = await apiRequest<User | ApiError>('/api/auth/profile', {
    method: 'PATCH',
    token,
    body: data,
  });
  if (status !== 200) {
    throw new Error((res as ApiError).error || 'Update failed');
  }
  return res as User;
}
