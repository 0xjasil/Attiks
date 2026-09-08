'use server';

import { revalidatePath } from 'next/cache';
import { safeBackendFetch, BACKEND_URL } from '@/lib/apiHelper';

export async function getProjectsAction(params?: Record<string, string>) {
  try {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await safeBackendFetch(`/api/projects${query}`, {
      cache: 'no-store',
    }, 150);

    if (!res || !res.ok) {
      return { success: false, data: [] };
    }

    const json = await res.json();
    const items =
      json.data?.items ||
      json.data?.projects ||
      (Array.isArray(json.data) ? json.data : []);

    return { success: true, data: items, pagination: json.data?.pagination };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function getProjectAction(idOrSlug: string) {
  try {
    const res = await safeBackendFetch(`/api/projects/${idOrSlug}`, {
      cache: 'no-store',
    }, 150);

    if (!res || !res.ok) {
      return { success: false, error: 'Project not found' };
    }

    const json = await res.json();
    return { success: true, data: json.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createProjectAction(projectData: any) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to create project' };
    }

    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/admin/projects');
    return { success: true, data: json.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProjectAction(id: string, projectData: any) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to update project' };
    }

    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    revalidatePath('/admin/projects');
    return { success: true, data: json.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
      method: 'DELETE',
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to delete project' };
    }

    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
