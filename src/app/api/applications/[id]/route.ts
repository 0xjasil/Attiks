import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readApplications, writeApplications, normalizeStatus } from '@/lib/careers-store';
import { JobApplication } from '@/types/careers';

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const authHeaders = await getAuthHeader();

    let updated: JobApplication | null = null;
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/applications/${encodeURIComponent(id)}`, {
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

    const apps = await readApplications();
    const index = apps.findIndex((a) => a.id === id);

    if (index === -1 && !updated) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    if (index !== -1) {
      const current = apps[index];
      const patched: JobApplication = {
        ...current,
        ...(body.status !== undefined
          ? { status: normalizeStatus(body.status, current.status) }
          : {}),
        ...(body.notes !== undefined ? { notes: String(body.notes) } : {}),
      };
      apps[index] = patched;
      await writeApplications(apps);
      updated = patched;
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const authHeaders = await getAuthHeader();
    let deletedOnBackend = false;
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/applications/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders,
        signal: AbortSignal.timeout(4000),
      });
      deletedOnBackend = backendRes.ok;
    } catch {
      // Fallback to local store
    }

    const apps = await readApplications();
    const filtered = apps.filter((a) => a.id !== id);

    if (filtered.length === apps.length && !deletedOnBackend) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    await writeApplications(filtered);
    return NextResponse.json({ success: true, message: 'Application deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
