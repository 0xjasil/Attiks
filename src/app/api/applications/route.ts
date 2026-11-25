import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  readApplications,
  writeApplications,
  buildApplication,
  validateApplication,
} from '@/lib/careers-store';

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

export async function GET() {
  try {
    const authHeaders = await getAuthHeader();
    const backendRes = await fetch(`${BACKEND_URL}/api/applications`, {
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
    const apps = await readApplications();
    return NextResponse.json({ success: true, data: apps }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot: bots fill the hidden field — accept silently, store nothing.
    if (body?.honeypot) {
      return NextResponse.json({ success: true, data: null }, { status: 201 });
    }

    const validationError = validateApplication(body || {});
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    let created = null;
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(6000),
      });
      if (backendRes.ok) {
        const data = await backendRes.json();
        created = data.data || data;
        if (!created?.id) created = null;
      }
    } catch {
      // Fallback to local store
    }

    if (!created) {
      created = buildApplication(body);
      const existing = await readApplications();
      await writeApplications([created, ...existing]);
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
