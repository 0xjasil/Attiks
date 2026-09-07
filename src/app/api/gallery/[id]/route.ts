import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { GalleryPost, defaultGalleryPosts } from '@/data/gallery';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'gallery-posts.json');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function readPosts(): Promise<GalleryPost[]> {
  try {
    const content = await readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // fallback
  }
  return defaultGalleryPosts;
}

async function writePosts(posts: GalleryPost[]): Promise<void> {
  try {
    await writeFile(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Backup file write failed:', err);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/gallery/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(6000),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });
      }
    } catch {
      // Fallback
    }

    const posts = await readPosts();
    const index = posts.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    posts[index] = { ...posts[index], ...body, id };
    await writePosts(posts);

    return NextResponse.json({ success: true, data: posts[index] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');

    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        signal: AbortSignal.timeout(6000),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });
      }
    } catch {
      // Fallback
    }

    const posts = await readPosts();
    const filtered = posts.filter((p) => p.id !== id);

    await writePosts(filtered);
    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

