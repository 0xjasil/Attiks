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

/** The admin UI addresses this route by id, the public site by slug. */
function matches(job: { id: string; slug: string }, key: string): boolean {
  return job.id === key || job.slug === key;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const authHeaders = await getAuthHeader();
    const backendRes = await fetch(`${BACKEND_URL}/api/careers/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      headers: authHeaders,
      signal: AbortSignal.timeout(4000),
    });
    if (backendRes.ok) {
      const data = await backendRes.json();
      const job = data.data || data;
      if (job?.id || job?.slug) return NextResponse.json({ success: true, data: job });
    }
  } catch {
    // Fall back to local store
  }

  try {
    const jobs = await readJobs();
    const job = jobs.find((j) => matches(j, slug));
    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const authHeaders = await getAuthHeader();

    let updated: JobPosting | null = null;
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/careers/${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });
      if (backendRes.ok) {
        const data = await backendRes.json();
        updated = data.data || data;
        if (!updated?.id) updated = null;
      }
    } catch {
      // Fallback to local store
    }

    const jobs = await readJobs();
    const index = jobs.findIndex((j) => matches(j, slug));

    if (index === -1 && !updated) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    if (index !== -1) {
      const merged = buildJob(body, jobs[index], jobs);
      jobs[index] = merged;
      await writeJobs(jobs);
      updated = merged;
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const authHeaders = await getAuthHeader();
    let deletedOnBackend = false;
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/careers/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
        headers: authHeaders,
        signal: AbortSignal.timeout(4000),
      });
      deletedOnBackend = backendRes.ok;
    } catch {
      // Fallback to local store
    }

    const jobs = await readJobs();
    const filtered = jobs.filter((j) => !matches(j, slug));

    if (filtered.length === jobs.length && !deletedOnBackend) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    await writeJobs(filtered);
    return NextResponse.json({ success: true, message: 'Job posting deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
