import mediaPostsFallback from '@/data/media-posts.json';

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

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

function getFallbackMedia(): MediaArticle[] {
  return (mediaPostsFallback as MediaArticle[]) || [];
}

export async function getAllMedia(): Promise<MediaArticle[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/blogs`, {
      next: { tags: ['media', 'blogs'], revalidate: 60 },
      signal: AbortSignal.timeout(1500),
    });

    if (res.ok) {
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

  const fallback = await getFallbackMedia();
  return fallback.filter((item) => item.status !== 'draft');
}

export async function getMediaBySlug(slug: string): Promise<MediaArticle | undefined> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/blogs/${slug}`, {
      next: { tags: ['media', `media-${slug}`], revalidate: 60 },
      signal: AbortSignal.timeout(1500),
    });

    if (res.ok) {
      const json = await res.json();
      const item = json.data;
      if (item && (item.id || item.slug)) {
        return item;
      }
    }
  } catch {
    // Graceful fallback to static JSON
  }

  const fallback = await getFallbackMedia();
  return fallback.find((p) => p.slug === slug || p.id === slug);
}
