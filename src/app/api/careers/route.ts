import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readJobs, writeJobs, buildJob } from '@/lib/careers-store';
import { JobPosting } from '@/types/careers';

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

function publishedOnly(jobs: JobPosting[]): JobPosting[] {
  return jobs
    .filter((job) => job.status === 'published')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isAdmin = searchParams.get('admin') === 'true';

  try {
    const authHeaders = await getAuthHeader();
    const backendRes = await fetch(`${BACKEND_URL}/api/careers?${searchParams.toString()}`, {
      cache: 'no-store',
      headers: authHeaders,
      signal: AbortSignal.timeout(4000),
    });
    if (backendRes.ok) {
      const data = await backendRes.json();
      const items = Array.isArray(data.data) ? data.data : data.data?.items || [];
      if (Array.isArray(items) && items.length > 0) {
        return NextResponse.json({ success: true, data: items }, { status: 200 });
      }
    }
  } catch {
    // Fall back to local store
  }

  try {
    const jobs = await readJobs();
    const payload = isAdmin ? jobs : publishedOnly(jobs);
    return NextResponse.json({ success: true, data: payload }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body?.title?.trim()) {
      return NextResponse.json({ success: false, error: 'Job title is required' }, { status: 400 });
    }
    if (!body.summary?.trim() || !body.description?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Summary and full description are required' },
        { status: 400 }
      );
    }

    const authHeaders = await getAuthHeader();
    let created: JobPosting | null = null;
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/careers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });
      if (backendRes.ok) {
        const data = await backendRes.json();
        created = data.data || data;
        if (!created?.id) created = null;
      }
    } catch {
      // Fallback to local store
    }

    const existing = await readJobs();
    if (!created) {
      created = buildJob(body, undefined, existing);
    }

    const alreadyStored = existing.some((j) => j.id === created!.id);
    await writeJobs(alreadyStored ? existing : [...existing, created]);

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
