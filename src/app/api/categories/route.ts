import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCategoriesAction,
  getAllCategoriesAdminAction,
  createCategoryAction,
} from '@/actions/category.actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const categories = isAdmin
      ? await getAllCategoriesAdminAction()
      : await getAllCategoriesAction();

    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createCategoryAction(body);
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}
