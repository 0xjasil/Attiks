'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import {
  HeroSlide,
  HeroSettings,
  HeroData,
  defaultHeroSlides,
  defaultHeroSettings,
} from '@/data/hero';
import { safeBackendFetch, BACKEND_URL } from '@/lib/apiHelper';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'hero-slides.json');

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('attiks_admin_token')?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function readHeroDataInternal(): Promise<HeroData> {
  try {
    const content = await readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (parsed && Array.isArray(parsed.slides)) {
      return {
        slides: parsed.slides,
        settings: {
          ...defaultHeroSettings,
          ...(parsed.settings || {}),
        },
      };
    }
  } catch {
    // Return default hero data if JSON file not found or corrupted
  }
  return {
    slides: defaultHeroSlides,
    settings: defaultHeroSettings,
  };
}

async function writeHeroDataInternal(data: HeroData): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Public action: Returns only active slides for the live homepage
 */
export async function getHeroDataAction(): Promise<HeroData> {
  try {
    const backendRes = await safeBackendFetch('/api/hero', { cache: 'no-store' }, 150);
    if (backendRes && backendRes.ok) {
      const json = await backendRes.json();
      const payload = json.data || json;
      if (payload && Array.isArray(payload.slides)) {
        return {
          slides: payload.slides.filter((s: HeroSlide) => s.active !== false),
          settings: payload.settings || defaultHeroSettings,
        };
      }
    }
  } catch {
    // Graceful fallback to local data
  }

  try {
    const data = await readHeroDataInternal();
    const activeSlides = data.slides
      .filter((s) => s.active !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return {
      slides: activeSlides.length > 0 ? activeSlides : defaultHeroSlides,
      settings: data.settings,
    };
  } catch {
    return {
      slides: defaultHeroSlides,
      settings: defaultHeroSettings,
    };
  }
}

/**
 * Admin action: Returns all slides (including drafts) and settings
 */
export async function getAllHeroSlidesAdminAction(): Promise<HeroData> {
  try {
    const authHeaders = await getAuthHeader();
    const backendRes = await fetch(`${BACKEND_URL}/api/hero?admin=true`, {
      cache: 'no-store',
      headers: authHeaders,
      signal: AbortSignal.timeout(3000),
    });
    if (backendRes.ok) {
      const json = await backendRes.json();
      const payload = json.data || json;
      if (payload && Array.isArray(payload.slides)) {
        return {
          slides: payload.slides,
          settings: payload.settings || defaultHeroSettings,
        };
      }
    }
  } catch {
    // Graceful fallback to local data
  }

  try {
    const data = await readHeroDataInternal();
    const sortedSlides = [...data.slides].sort((a, b) => (a.order || 0) - (b.order || 0));
    return {
      slides: sortedSlides,
      settings: data.settings,
    };
  } catch {
    return {
      slides: defaultHeroSlides,
      settings: defaultHeroSettings,
    };
  }
}

/**
 * Create a new hero slide
 */
export async function createHeroSlideAction(data: Partial<HeroSlide>) {
  try {
    if (!data.mediaUrl) {
      return { success: false, error: 'Media URL (video or image) is required' };
    }

    const authHeaders = await getAuthHeader();
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/hero`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(4000),
      });
      if (backendRes.ok) {
        const json = await backendRes.json();
        revalidatePath('/');
        revalidatePath('/admin/hero');
        return json;
      }
    } catch {
      // Fallback to local store
    }

    const heroData = await readHeroDataInternal();
    const newSlide: HeroSlide = {
      id: `hero-${Date.now()}`,
      mediaType: data.mediaType || (data.mediaUrl.match(/\.(mp4|webm|mov|mkv)$/i) ? 'video' : 'image'),
      mediaUrl: data.mediaUrl,
      posterUrl: data.posterUrl || '',
      altText: data.altText || data.title || 'Architectural project scene by Attiks Architecture',
      title: data.title || '',
      subtitle: data.subtitle || '',
      ctaText: data.ctaText || heroData.settings.defaultCtaText || 'view projects',
      ctaLink: data.ctaLink || heroData.settings.defaultCtaLink || '/projects',
      order: heroData.slides.length + 1,
      active: data.active !== undefined ? data.active : true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    heroData.slides.push(newSlide);
    await writeHeroDataInternal(heroData);

    revalidatePath('/');
    revalidatePath('/admin/hero');
    return { success: true, data: newSlide };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing hero slide
 */
export async function updateHeroSlideAction(id: string, data: Partial<HeroSlide>) {
  try {
    const authHeaders = await getAuthHeader();
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/hero/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(4000),
      });
      if (backendRes.ok) {
        const json = await backendRes.json();
        revalidatePath('/');
        revalidatePath('/admin/hero');
        return json;
      }
    } catch {
      // Fallback to local store
    }

    const heroData = await readHeroDataInternal();
    const index = heroData.slides.findIndex((s) => s.id === id);

    if (index === -1) {
      return { success: false, error: 'Slide not found' };
    }

    const updatedSlide: HeroSlide = {
      ...heroData.slides[index],
      ...data,
      id,
    };

    if (data.mediaUrl && !data.mediaType) {
      updatedSlide.mediaType = data.mediaUrl.match(/\.(mp4|webm|mov|mkv)$/i) ? 'video' : 'image';
    }

    heroData.slides[index] = updatedSlide;
    await writeHeroDataInternal(heroData);

    revalidatePath('/');
    revalidatePath('/admin/hero');
    return { success: true, data: updatedSlide };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Toggle active status of a slide
 */
export async function toggleHeroSlideActiveAction(id: string) {
  try {
    const authHeaders = await getAuthHeader();
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/hero/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ action: 'toggleActive' }),
        signal: AbortSignal.timeout(4000),
      });
      if (backendRes.ok) {
        const json = await backendRes.json();
        revalidatePath('/');
        revalidatePath('/admin/hero');
        return json;
      }
    } catch {
      // Fallback to local store
    }

    const heroData = await readHeroDataInternal();
    const index = heroData.slides.findIndex((s) => s.id === id);

    if (index === -1) {
      return { success: false, error: 'Slide not found' };
    }

    heroData.slides[index].active = !heroData.slides[index].active;
    await writeHeroDataInternal(heroData);

    revalidatePath('/');
    revalidatePath('/admin/hero');
    return { success: true, active: heroData.slides[index].active };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a hero slide
 */
export async function deleteHeroSlideAction(id: string) {
  try {
    const authHeaders = await getAuthHeader();
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/hero/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
        signal: AbortSignal.timeout(4000),
      });
      if (backendRes.ok) {
        const json = await backendRes.json();
        revalidatePath('/');
        revalidatePath('/admin/hero');
        return json;
      }
    } catch {
      // Fallback to local store
    }

    const heroData = await readHeroDataInternal();
    heroData.slides = heroData.slides.filter((s) => s.id !== id);

    // Re-index orders
    heroData.slides.forEach((s, idx) => {
      s.order = idx + 1;
    });

    await writeHeroDataInternal(heroData);

    revalidatePath('/');
    revalidatePath('/admin/hero');
    return { success: true, message: 'Slide deleted successfully' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Reorder slides by ordered ID list
 */
export async function reorderHeroSlidesAction(orderedIds: string[]) {
  try {
    const authHeaders = await getAuthHeader();
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/hero`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ type: 'reorder', orderedIds }),
        signal: AbortSignal.timeout(4000),
      });
      if (backendRes.ok) {
        const json = await backendRes.json();
        revalidatePath('/');
        revalidatePath('/admin/hero');
        return json;
      }
    } catch {
      // Fallback to local store
    }

    const heroData = await readHeroDataInternal();
    const slideMap = new Map(heroData.slides.map((s) => [s.id, s]));

    const newSlides: HeroSlide[] = [];
    orderedIds.forEach((id, idx) => {
      const slide = slideMap.get(id);
      if (slide) {
        slide.order = idx + 1;
        newSlides.push(slide);
        slideMap.delete(id);
      }
    });

    // Add any remaining slides
    slideMap.forEach((slide) => {
      slide.order = newSlides.length + 1;
      newSlides.push(slide);
    });

    heroData.slides = newSlides;
    await writeHeroDataInternal(heroData);

    revalidatePath('/');
    revalidatePath('/admin/hero');
    return { success: true, data: newSlides };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update global Hero settings (interval, default CTA, pagination)
 */
export async function updateHeroSettingsAction(settings: Partial<HeroSettings>) {
  try {
    const authHeaders = await getAuthHeader();
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/hero`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ type: 'settings', settings }),
        signal: AbortSignal.timeout(4000),
      });
      if (backendRes.ok) {
        const json = await backendRes.json();
        revalidatePath('/');
        revalidatePath('/admin/hero');
        return json;
      }
    } catch {
      // Fallback to local store
    }

    const heroData = await readHeroDataInternal();
    heroData.settings = {
      ...heroData.settings,
      ...settings,
    };

    await writeHeroDataInternal(heroData);

    revalidatePath('/');
    revalidatePath('/admin/hero');
    return { success: true, data: heroData.settings };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
