'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { Testimonial, defaultTestimonials } from '@/data/testimonials';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'testimonials.json');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('attiks_admin_token')?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

let inMemoryTestimonials: Testimonial[] | null = null;

async function readTestimonialsInternal(): Promise<Testimonial[]> {
  if (inMemoryTestimonials) {
    return inMemoryTestimonials;
  }
  try {
    const content = await readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      inMemoryTestimonials = parsed;
      return inMemoryTestimonials;
    }
  } catch {
    // Return default testimonials if JSON file not found
  }
  return defaultTestimonials;
}

async function writeTestimonialsInternal(testimonials: Testimonial[]): Promise<void> {
  inMemoryTestimonials = testimonials;
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(testimonials, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to update local testimonials file (serverless environment):', err);
  }
}

/**
 * Public & SSR action: Returns active testimonials
 */
export async function getTestimonialsAction(): Promise<Testimonial[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/testimonials`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : json.data?.items || [];
      if (list.length > 0) {
        return list.filter((t: Testimonial) => t.active !== false);
      }
    }
  } catch {
    // Fallback to local storage
  }

  try {
    const list = await readTestimonialsInternal();
    return list.filter((t) => t.active !== false);
  } catch {
    return defaultTestimonials;
  }
}

/**
 * Admin action: Returns all testimonials
 */
export async function getAllTestimonialsAdminAction(): Promise<Testimonial[]> {
  try {
    const authHeaders = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/testimonials?admin=true`, {
      cache: 'no-store',
      headers: authHeaders,
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : json.data?.items || [];
      if (list.length > 0) {
        return list;
      }
    }
  } catch {
    // Fallback
  }

  try {
    return await readTestimonialsInternal();
  } catch {
    return defaultTestimonials;
  }
}

/**
 * Create testimonial
 */
export async function createTestimonialAction(data: {
  quote: string;
  author: string;
  designation: string;
  rating?: number;
  order?: number;
  active?: boolean;
}) {
  try {
    const authHeaders = await getAuthHeader();
    const payload = {
      quote: data.quote,
      author: data.author,
      designation: data.designation,
      rating: data.rating || 5,
      order: data.order || 1,
      active: data.active !== undefined ? data.active : true,
    };

    let created: Testimonial | null = null;
    try {
      const res = await fetch(`${BACKEND_URL}/api/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const json = await res.json();
        created = json.data || json;
      }
    } catch {
      // Fallback
    }

    if (!created) {
      const existing = await readTestimonialsInternal();
      created = {
        id: `testi-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString().split('T')[0],
        order: existing.length + 1,
      };
      const updated = [...existing, created];
      await writeTestimonialsInternal(updated);
    } else {
      const existing = await readTestimonialsInternal();
      await writeTestimonialsInternal([...existing, created]);
    }

    revalidatePath('/');
    revalidatePath('/admin/testimonials');
    return { success: true, data: created };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update testimonial
 */
export async function updateTestimonialAction(
  id: string,
  data: Partial<Testimonial>
) {
  try {
    const authHeaders = await getAuthHeader();
    let updated: Testimonial | null = null;

    try {
      const res = await fetch(`${BACKEND_URL}/api/testimonials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const json = await res.json();
        updated = json.data || json;
      }
    } catch {
      // Fallback
    }

    const existing = await readTestimonialsInternal();
    const index = existing.findIndex((t) => t.id === id);

    if (index !== -1) {
      existing[index] = { ...existing[index], ...data, id };
      await writeTestimonialsInternal(existing);
      if (!updated) updated = existing[index];
    }

    revalidatePath('/');
    revalidatePath('/admin/testimonials');
    return { success: true, data: updated || { id, ...data } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete testimonial
 */
export async function deleteTestimonialAction(id: string) {
  try {
    const authHeaders = await getAuthHeader();

    try {
      await fetch(`${BACKEND_URL}/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
        signal: AbortSignal.timeout(4000),
      });
    } catch {
      // Fallback
    }

    const existing = await readTestimonialsInternal();
    const filtered = existing.filter((t) => t.id !== id);
    await writeTestimonialsInternal(filtered);

    revalidatePath('/');
    revalidatePath('/admin/testimonials');
    return { success: true, message: 'Testimonial deleted successfully' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
