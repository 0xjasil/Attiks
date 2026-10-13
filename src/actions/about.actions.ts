'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { AboutPageData, defaultAboutData } from '@/data/about';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'about.json');
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

let inMemoryAboutData: AboutPageData | null = null;

async function readAboutInternal(): Promise<AboutPageData> {
  if (inMemoryAboutData) {
    return inMemoryAboutData;
  }
  try {
    const content = await readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object' && parsed.hero && parsed.foundation) {
      inMemoryAboutData = parsed as AboutPageData;
      return inMemoryAboutData;
    }
  } catch {
    // Return default about data if JSON file not found or corrupted
  }
  return defaultAboutData;
}

async function writeAboutInternal(data: AboutPageData): Promise<void> {
  inMemoryAboutData = data;
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to update local about.json file (serverless environment):', err);
  }
}

/**
 * Public & SSR action: Returns live About Studio data
 */
export async function getAboutDataAction(): Promise<AboutPageData> {
  // Try remote backend if configured
  try {
    const res = await fetch(`${BACKEND_URL}/api/about`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.hero) {
        inMemoryAboutData = json.data;
        return json.data;
      }
    }
  } catch {
    // Backend offline or route unconfigured -> fallback to local storage
  }

  return await readAboutInternal();
}

/**
 * Admin action: Save entire About Studio page CMS configuration
 */
export async function updateAboutDataAction(
  data: AboutPageData
): Promise<{ success: boolean; data?: AboutPageData; error?: string }> {
  try {
    if (!data || !data.hero || !data.philosophy || !data.foundation || !data.team) {
      return { success: false, error: 'Invalid about data structure provided.' };
    }

    // Try remote backend update
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${BACKEND_URL}/api/about`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          inMemoryAboutData = json.data;
        }
      }
    } catch {
      // Backend offline -> continue with local persistence
    }

    await writeAboutInternal(data);

    revalidatePath('/about');
    revalidatePath('/');

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update About Studio content.' };
  }
}
