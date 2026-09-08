import { projects as fallbackProjects, Project } from '@/data/projects';
import { safeBackendFetch } from '@/lib/apiHelper';

export async function getAllProjects(): Promise<Project[]> {
  try {
    const res = await safeBackendFetch('/api/projects', { cache: 'no-store' }, 150);
    if (res && res.ok) {
      const json = await res.json();
      const items =
        json.data?.items ||
        json.data?.projects ||
        (Array.isArray(json.data) ? json.data : null);

      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
    }
  } catch {
    // Graceful fallback to static dataset
  }
  return fallbackProjects;
}

export async function getProjectByIdOrSlug(idOrSlug: string): Promise<Project | undefined> {
  try {
    const res = await safeBackendFetch(`/api/projects/${idOrSlug}`, { cache: 'no-store' }, 150);
    if (res && res.ok) {
      const json = await res.json();
      const item = json.data;
      if (item && item.id) {
        return item;
      }
    }
  } catch {
    // Graceful fallback to static dataset
  }

  // Fallback to static dataset
  return fallbackProjects.find((p) => p.id === idOrSlug || (p as any).slug === idOrSlug);
}

