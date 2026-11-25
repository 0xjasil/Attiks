/**
 * Safe localStorage persistence helper
 * Prevents DOMException: QuotaExceededError ("Maximum capacity exceeded")
 * by gracefully stripping heavy Base64 data URLs if the browser quota is reached.
 */

export function safeSaveProjectsToLocalStorage(projects: any[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.setItem('attiks_admin_projects', JSON.stringify(projects));
  } catch (err) {
    console.warn('localStorage quota exceeded while saving projects, sanitizing data URLs...', err);
    try {
      const sanitized = projects.map((p) => {
        const item = { ...p };
        if (typeof item.image === 'string' && item.image.startsWith('data:')) {
          item.image = '/images/projects/placeholder.webp';
        }
        if (Array.isArray(item.gallery)) {
          item.gallery = item.gallery.map((g: string) =>
            typeof g === 'string' && g.startsWith('data:') ? '/images/projects/placeholder.webp' : g
          );
        }
        return item;
      });
      localStorage.setItem('attiks_admin_projects', JSON.stringify(sanitized));
    } catch (fallbackErr) {
      console.warn('Could not save projects to localStorage (quota full)', fallbackErr);
    }
  }
}
