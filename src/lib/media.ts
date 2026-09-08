import mediaPostsFallback from '@/data/media-posts.json';
import { safeBackendFetch } from '@/lib/apiHelper';

export interface MediaArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  publishedAt: string;
  image: string;
  summary: string;
  content: string;
  status?: 'published' | 'draft';
  featured?: boolean;
  order?: number;
}

function getFallbackMedia(): MediaArticle[] {
  return (mediaPostsFallback as MediaArticle[]) || [];
}

export async function getAllMedia(): Promise<MediaArticle[]> {
  try {
    const res = await safeBackendFetch('/api/blogs', {
      next: { tags: ['media', 'blogs'], revalidate: 60 },
    }, 150);

    if (res && res.ok) {
      const json = await res.json();
      const items =
        json.data?.items ||
        json.data?.posts ||
        json.data?.blogs ||
        (Array.isArray(json.data) ? json.data : null);

      if (Array.isArray(items) && items.length > 0) {
        return items.filter((item: MediaArticle) => item.status !== 'draft');
      }
    }
  } catch {
    // Graceful fallback to static JSON
  }

  const fallback = getFallbackMedia();
  return fallback.filter((item) => item.status !== 'draft');
}

export async function getMediaBySlug(slug: string): Promise<MediaArticle | undefined> {
  try {
    const res = await safeBackendFetch(`/api/blogs/${slug}`, {
      next: { tags: ['media', `media-${slug}`], revalidate: 60 },
    }, 150);

    if (res && res.ok) {
      const json = await res.json();
      const item = json.data;
      if (item && (item.id || item.slug)) {
        return item;
      }
    }
  } catch {
    // Graceful fallback to static JSON
  }

  const fallback = getFallbackMedia();
  return fallback.find((p) => p.slug === slug || p.id === slug);
}

