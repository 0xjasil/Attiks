import { MetadataRoute } from 'next';
import { getAllProjects } from '@/lib/projects';
import { getAllMedia } from '@/lib/media';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://attiks.in';
  const currentDate = new Date().toISOString();

  // Static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/media`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic project routes
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const projects = await getAllProjects();
    projectRoutes = (projects || [])
      .filter((p) => p && p.id && p.status !== 'draft')
      .map((p) => ({
        url: `${baseUrl}/projects/${p.id}`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }));
  } catch {
    // If fetching fails, continue with static routes
  }

  // Dynamic media article routes
  let mediaRoutes: MetadataRoute.Sitemap = [];
  try {
    const mediaArticles = await getAllMedia();
    mediaRoutes = (mediaArticles || [])
      .filter((m) => m && m.slug && m.status === 'published')
      .map((m) => ({
        url: `${baseUrl}/media/${m.slug}`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
  } catch {
    // If fetching fails, continue with static routes
  }

  return [...staticRoutes, ...projectRoutes, ...mediaRoutes];
}
