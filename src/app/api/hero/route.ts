import { NextRequest, NextResponse } from 'next/server';
import {
  getHeroDataAction,
  getAllHeroSlidesAdminAction,
  createHeroSlideAction,
  updateHeroSettingsAction,
  reorderHeroSlidesAction,
} from '@/actions/hero.actions';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isAdmin = searchParams.get('admin') === 'true';

  try {
    const token = request.cookies.get('attiks_admin_token')?.value;
    const backendRes = await fetch(`${BACKEND_URL}/api/hero?${searchParams.toString()}`, {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(3500),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data, { status: backendRes.status });
    }
  } catch {
    // Backend offline or endpoint not yet configured, fallback to local store
  }

  try {
    const data = isAdmin
      ? await getAllHeroSlidesAdminAction()
      : await getHeroDataAction();

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.cookies.get('attiks_admin_token')?.value;

    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/hero`, {
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
        return NextResponse.json(data, { status: backendRes.status });
      }
    } catch {
      // Backend offline or fallback
    }

    // Local fallback actions
    if (body.type === 'settings' && body.settings) {
      const res = await updateHeroSettingsAction(body.settings);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (body.type === 'reorder' && Array.isArray(body.orderedIds)) {
      const res = await reorderHeroSlidesAction(body.orderedIds);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    const res = await createHeroSlideAction(body);
    return NextResponse.json(res, { status: res.success ? 201 : 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
