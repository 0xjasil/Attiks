'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { GalleryPost, defaultGalleryPosts } from '@/data/gallery';
import { safeBackendFetch, BACKEND_URL } from '@/lib/apiHelper';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'gallery-posts.json');

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('attiks_admin_token')?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function readPostsInternal(): Promise<GalleryPost[]> {
  try {
    const content = await readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Return default posts if JSON file not yet created
  }
  return defaultGalleryPosts;
}

async function writePostsInternal(posts: GalleryPost[]): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to update local gallery backup file:', err);
  }
}

/**
 * Public action: Returns only active gallery posts from DB
 */
export async function getGalleryPostsAction(): Promise<GalleryPost[]> {
  try {
    const backendRes = await safeBackendFetch('/api/gallery', { cache: 'no-store' }, 150);
    if (backendRes && backendRes.ok) {
      const json = await backendRes.json();
      const list = Array.isArray(json.data) ? json.data : json.data?.items || [];
      if (list.length > 0) {
        return list;
      }
    }
  } catch {
    // Fallback to local data
  }

  try {
    const posts = await readPostsInternal();
    return posts.filter((p) => p.active !== false);
  } catch {
    return defaultGalleryPosts;
  }
}

/**
 * Admin action: Returns all gallery posts (active & inactive) from DB
 */
export async function getAllGalleryPostsAdminAction(): Promise<GalleryPost[]> {
  try {
    const authHeaders = await getAuthHeader();
    const backendRes = await fetch(`${BACKEND_URL}/api/gallery?admin=true`, {
      cache: 'no-store',
      headers: authHeaders,
      signal: AbortSignal.timeout(3000),
    });
    if (backendRes.ok) {
      const json = await backendRes.json();
      const list = Array.isArray(json.data) ? json.data : json.data?.items || [];
      if (list.length > 0) {
        return list;
      }
    }
  } catch {
    // Fallback to local data
  }

  try {
    return await readPostsInternal();
  } catch {
    return defaultGalleryPosts;
  }
}

/**
 * Create single gallery post in PostgreSQL DB
 */
export async function createGalleryPostAction(data: Partial<GalleryPost>) {
  try {
    if (!data.image) {
      return { success: false, error: 'Image is required' };
    }

    const authHeaders = await getAuthHeader();
    const payload = {
      image: data.image,
      caption: data.caption || 'Architectural Highlight',
      altText: data.altText || data.caption || 'Attiks architectural showcase detail',
      description: data.description || '',
      location: data.location || '',
      aspectRatio: data.aspectRatio || 'auto',
      active: data.active !== undefined ? data.active : true,
    };

    let createdPost: GalleryPost | null = null;
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000),
      });

      if (backendRes.ok) {
        const json = await backendRes.json();
        createdPost = json.data || json;
      }
    } catch {
      // Fallback to local file creation if backend unreachable
    }

    if (!createdPost) {
      const posts = await readPostsInternal();
      createdPost = {
        id: `post-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString().split('T')[0],
        order: posts.length + 1,
      };
      const updated = [createdPost, ...posts];
      await writePostsInternal(updated);
    } else {
      // Keep local backup synchronized
      const posts = await readPostsInternal();
      await writePostsInternal([createdPost, ...posts.filter((p) => p.id !== createdPost?.id)]);
    }

    revalidatePath('/');
    revalidatePath('/media');
    revalidatePath('/admin/gallery');
    return { success: true, data: createdPost };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Create batch gallery posts in PostgreSQL DB
 */
export async function createBatchGalleryPostsAction(
  items: Array<{ image: string; caption?: string; altText?: string; location?: string; description?: string; aspectRatio?: string }>
) {
  try {
    if (!items || items.length === 0) {
      return { success: false, error: 'No items provided' };
    }

    const authHeaders = await getAuthHeader();
    let createdPosts: GalleryPost[] = [];

    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ type: 'batch', items }),
        signal: AbortSignal.timeout(8000),
      });

      if (backendRes.ok) {
        const json = await backendRes.json();
        createdPosts = Array.isArray(json.data) ? json.data : [];
      }
    } catch {
      // Fallback
    }

    if (createdPosts.length === 0) {
      const posts = await readPostsInternal();
      createdPosts = items.map((item, idx) => ({
        id: `post-${Date.now()}-${idx}`,
        image: item.image,
        caption: item.caption || 'Architectural Highlight',
        altText: item.altText || item.caption || 'Attiks architectural showcase detail',
        description: item.description || '',
        location: item.location || '',
        aspectRatio: (item.aspectRatio as 'square' | 'portrait' | 'landscape' | 'auto') || 'square',
        createdAt: new Date().toISOString().split('T')[0],
        active: true,
        order: posts.length + idx + 1,
      }));

      const updated = [...createdPosts, ...posts];
      await writePostsInternal(updated);
    } else {
      const posts = await readPostsInternal();
      await writePostsInternal([...createdPosts, ...posts]);
    }

    revalidatePath('/');
    revalidatePath('/media');
    revalidatePath('/admin/gallery');
    return { success: true, count: createdPosts.length, data: createdPosts };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update gallery post in PostgreSQL DB
 */
export async function updateGalleryPostAction(id: string, data: Partial<GalleryPost>) {
  try {
    const authHeaders = await getAuthHeader();
    let updatedPost: GalleryPost | null = null;

    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/gallery/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(6000),
      });

      if (backendRes.ok) {
        const json = await backendRes.json();
        updatedPost = json.data || json;
      }
    } catch {
      // Fallback
    }

    const posts = await readPostsInternal();
    const index = posts.findIndex((p) => p.id === id);

    if (index !== -1) {
      posts[index] = { ...posts[index], ...data, id };
      await writePostsInternal(posts);
      if (!updatedPost) updatedPost = posts[index];
    }

    revalidatePath('/');
    revalidatePath('/media');
    revalidatePath('/admin/gallery');
    return { success: true, data: updatedPost || { id, ...data } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Toggle active visibility of gallery post in DB
 */
export async function toggleGalleryPostActiveAction(id: string) {
  return updateGalleryPostAction(id, { action: 'toggleActive' } as any);
}

/**
 * Delete gallery post in PostgreSQL DB
 */
export async function deleteGalleryPostAction(id: string) {
  try {
    const authHeaders = await getAuthHeader();

    try {
      await fetch(`${BACKEND_URL}/api/gallery/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
        signal: AbortSignal.timeout(6000),
      });
    } catch {
      // Fallback
    }

    const posts = await readPostsInternal();
    const filtered = posts.filter((p) => p.id !== id);
    await writePostsInternal(filtered);

    revalidatePath('/');
    revalidatePath('/media');
    revalidatePath('/admin/gallery');
    return { success: true, message: 'Post deleted successfully' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

