import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      const singleFile = formData.get('file') as File | null;
      if (singleFile) {
        files.push(singleFile);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (typeof file === 'string' || !file.name) continue;

      // 1. Strict Size Check (Below 2MB)
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" exceeds the 2MB size limit. Please upload files below 2MB.`,
          },
          { status: 400 }
        );
      }

      // 2. Strict Format Check (.webp for images, or mp4/webm for video)
      const fileNameLower = file.name.toLowerCase();
      const isWebp = fileNameLower.endsWith('.webp') || file.type === 'image/webp';
      const isVideo =
        /\.(mp4|webm)$/i.test(fileNameLower) ||
        file.type === 'video/mp4' ||
        file.type === 'video/webm';

      if (!isWebp && !isVideo) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" is not supported. Only .webp images below 2MB (or .mp4/.webm videos) are permitted.`,
          },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now() + Math.floor(Math.random() * 1000);
      const cleanName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const prefix = isVideo ? 'video' : 'img';
      const fileName = `${prefix}_${timestamp}_${cleanName || (isVideo ? 'upload.mp4' : 'upload.webp')}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/${fileName}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        urls: uploadedUrls,
        url: uploadedUrls[0] || null,
        count: uploadedUrls.length,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload files' },
      { status: 500 }
    );
  }
}
