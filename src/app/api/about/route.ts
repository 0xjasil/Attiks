import { NextRequest, NextResponse } from 'next/server';
import { getAboutDataAction, updateAboutDataAction } from '@/actions/about.actions';

export async function GET() {
  try {
    const data = await getAboutDataAction();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await updateAboutDataAction(body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
