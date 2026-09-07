'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { CategoryItem, defaultCategories } from '@/data/categories';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'categories.json');
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

async function readCategoriesInternal(): Promise<CategoryItem[]> {
  try {
    const content = await readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Return default categories if file does not exist
  }
  return defaultCategories;
}

async function writeCategoriesInternal(categories: CategoryItem[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(categories, null, 2), 'utf-8');
}

/**
 * Public action: Returns only active categories for the projects page
 */
export async function getAllCategoriesAction(): Promise<CategoryItem[]> {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/categories`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (backendRes.ok) {
      const json = await backendRes.json();
      const payload = json.data || json;
      if (Array.isArray(payload) && payload.length > 0) {
        return payload.filter((c: CategoryItem) => c.active !== false);
      }
    }
  } catch {
    // Graceful fallback to local data
  }

  try {
    const data = await readCategoriesInternal();
    return data
      .filter((c) => c.active !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch {
    return defaultCategories;
  }
}

/**
 * Admin action: Returns all categories (active + drafts)
 */
export async function getAllCategoriesAdminAction(): Promise<CategoryItem[]> {
  try {
    const authHeaders = await getAuthHeader();
    const backendRes = await fetch(`${BACKEND_URL}/api/categories?admin=true`, {
      cache: 'no-store',
      headers: authHeaders,
      signal: AbortSignal.timeout(3000),
    });
    if (backendRes.ok) {
      const json = await backendRes.json();
      const payload = json.data || json;
      if (Array.isArray(payload) && payload.length > 0) {
        return payload;
      }
    }
  } catch {
    // Graceful fallback to local data
  }

  try {
    const data = await readCategoriesInternal();
    return [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch {
    return defaultCategories;
  }
}

/**
 * Create a new category
 */
export async function createCategoryAction(data: Partial<CategoryItem>) {
  try {
    if (!data.label) {
      return { success: false, error: 'Category label is required' };
    }

    const cleanValue = (data.value || data.label)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const authHeaders = await getAuthHeader();
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ ...data, value: cleanValue }),
        signal: AbortSignal.timeout(4000),
      });
      if (backendRes.ok) {
        const json = await backendRes.json();
        revalidatePath('/projects');
        revalidatePath('/admin/categories');
        return json;
      }
    } catch {
      // Fallback to local store
    }

    const categories = await readCategoriesInternal();
    if (categories.some((c) => c.value === cleanValue)) {
      return { success: false, error: `Category slug "${cleanValue}" already exists` };
    }

    const newCategory: CategoryItem = {
      id: `cat-${Date.now()}`,
      label: data.label.trim(),
      value: cleanValue,
      portfolioPdf: data.portfolioPdf || '',
      description: data.description || '',
      order: categories.length + 1,
      active: data.active !== undefined ? data.active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    categories.push(newCategory);
    await writeCategoriesInternal(categories);

    revalidatePath('/projects');
    revalidatePath('/admin/categories');
    return { success: true, data: newCategory };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing category (e.g. portfolioPdf, label, etc.)
 */
export async function updateCategoryAction(id: string, data: Partial<CategoryItem>) {
  try {
    const authHeaders = await getAuthHeader();
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/categories/${id}`, {
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
        revalidatePath('/projects');
        revalidatePath('/admin/categories');
        return json;
      }
    } catch {
      // Fallback to local store
    }

    const categories = await readCategoriesInternal();
    const index = categories.findIndex((c) => c.id === id || c.value === id.toLowerCase());

    if (index === -1) {
      return { success: false, error: 'Category not found' };
    }

    const updatedCategory: CategoryItem = {
      ...categories[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (data.label && !data.value) {
      updatedCategory.label = data.label.trim();
    }

    categories[index] = updatedCategory;
    await writeCategoriesInternal(categories);

    revalidatePath('/projects');
    revalidatePath('/admin/categories');
    return { success: true, data: updatedCategory };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a category
 */
export async function deleteCategoryAction(id: string) {
  try {
    const authHeaders = await getAuthHeader();
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
        signal: AbortSignal.timeout(4000),
      });
      if (backendRes.ok) {
        const json = await backendRes.json();
        revalidatePath('/projects');
        revalidatePath('/admin/categories');
        return json;
      }
    } catch {
      // Fallback to local store
    }

    const categories = await readCategoriesInternal();
    const filtered = categories.filter((c) => c.id !== id && c.value !== id.toLowerCase());

    // Re-index order
    filtered.forEach((c, idx) => {
      c.order = idx + 1;
    });

    await writeCategoriesInternal(filtered);

    revalidatePath('/projects');
    revalidatePath('/admin/categories');
    return { success: true, message: 'Category deleted successfully' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Reorder categories
 */
export async function reorderCategoriesAction(orderedIds: string[]) {
  try {
    const authHeaders = await getAuthHeader();
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/categories`, {
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
        revalidatePath('/projects');
        revalidatePath('/admin/categories');
        return json;
      }
    } catch {
      // Fallback
    }

    const categories = await readCategoriesInternal();
    const catMap = new Map(categories.map((c) => [c.id, c]));

    const newCategories: CategoryItem[] = [];
    orderedIds.forEach((id, idx) => {
      const c = catMap.get(id);
      if (c) {
        c.order = idx + 1;
        newCategories.push(c);
        catMap.delete(id);
      }
    });

    catMap.forEach((c) => {
      c.order = newCategories.length + 1;
      newCategories.push(c);
    });

    await writeCategoriesInternal(newCategories);

    revalidatePath('/projects');
    revalidatePath('/admin/categories');
    return { success: true, data: newCategories };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
