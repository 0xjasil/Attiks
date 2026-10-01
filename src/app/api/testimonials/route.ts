import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { Testimonial, defaultTestimonials } from '@/data/testimonials';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'testimonials.json');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function readTestimonials(): Promise<Testimonial[]> {
  try {
    const content = await readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Return default testimonials
  }
  return defaultTestimonials;
}

async function writeTestimonials(list: Testimonial[]): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Backup file write failed:', err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const backendRes = await fetch(`${BACKEND_URL}/api/testimonials?${searchParams.toString()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data, { status: 200 });
    }
  } catch {
    // Fallback
  }

  try {
    const list = await readTestimonials();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.cookies.get('attiks_admin_token')?.value;

    let created: Testimonial | null = null;
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });
      if (backendRes.ok) {
        const data = await backendRes.json();
        created = data.data || data;
      }
    } catch {
      // Fallback
    }

    const { quote, author, designation, rating } = body;
    if (!quote || !author) {
      return NextResponse.json({ success: false, error: 'Quote and Author are required' }, { status: 400 });
    }

    const existing = await readTestimonials();
    if (!created) {
      created = {
        id: `testi-${Date.now()}`,
        quote,
        author,
        designation: designation || '',
        rating: rating || 5,
        active: true,
        order: existing.length + 1,
        createdAt: new Date().toISOString().split('T')[0],
      };
    }

    const updated = [...existing, created];
    await writeTestimonials(updated);

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
