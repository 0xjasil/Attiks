import { NextRequest, NextResponse } from 'next/server';
import {
  updateHeroSlideAction,
  deleteHeroSlideAction,
  toggleHeroSlideActiveAction,
} from '@/actions/hero.actions';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = request.cookies.get('attiks_admin_token')?.value;
    const backendRes = await fetch(`${BACKEND_URL}/api/hero/${id}`, {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(3500),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data, { status: backendRes.status });
    }
  } catch {
    // Backend fallback
  }

  return NextResponse.json({ success: true, id }, { status: 200 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const token = request.cookies.get('attiks_admin_token')?.value;

    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/hero/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });
      }
    } catch {
      // Backend offline or fallback
    }

    if (body.action === 'toggleActive') {
      const res = await toggleHeroSlideActiveAction(id);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    const res = await updateHeroSlideAction(id, body);
    return NextResponse.json(res, { status: res.success ? 200 : 400 });
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
    const token = request.cookies.get('attiks_admin_token')?.value;

    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/hero/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(4000),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });
      }
    } catch {
      // Backend offline or fallback
    }

    const res = await deleteHeroSlideAction(id);
    return NextResponse.json(res, { status: res.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
