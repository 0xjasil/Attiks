'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export interface LoginPayload {
  email: string;
  password: string;
}

export async function loginAction(payload: LoginPayload) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || data.message || 'Invalid email or password',
      };
    }

    if (data.data?.token) {
      const cookieStore = await cookies();
      cookieStore.set('attiks_admin_token', data.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    revalidatePath('/admin');
    return { success: true, user: data.data?.user };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An error occurred during authentication',
    };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('attiks_admin_token');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSessionAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('attiks_admin_token')?.value;

    if (!token) {
      return { success: false, authenticated: false };
    }

    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      cookieStore.delete('attiks_admin_token');
      return { success: false, authenticated: false };
    }

    const data = await res.json();
    return { success: true, authenticated: true, user: data.data };
  } catch (error: any) {
    return { success: false, authenticated: false, error: error.message };
  }
}

export async function changePasswordAction(payload: { currentPassword?: string; newPassword: string }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('attiks_admin_token')?.value;

    if (!token) {
      return { success: false, error: 'Unauthorized. Please login again.' };
    }

    const res = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || data.message || 'Failed to update password' };
    }

    return { success: true, message: 'Password updated successfully' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update password' };
  }
}

