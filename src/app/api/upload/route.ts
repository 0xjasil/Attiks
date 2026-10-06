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

    const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // 25MB
    const MAX_PDF_SIZE = 25 * 1024 * 1024; // 25MB
    const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB
    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (typeof file === 'string' || !file.name) continue;

      const fileNameLower = file.name.toLowerCase();
      const isPdf = fileNameLower.endsWith('.pdf') || file.type === 'application/pdf';
      const isVideo =
        /\.(mp4|webm|mov)$/i.test(fileNameLower) ||
        file.type === 'video/mp4' ||
        file.type === 'video/webm';
      const isImage =
        /\.(webp|jpg|jpeg|png|gif|svg|avif)$/i.test(fileNameLower) ||
        file.type.startsWith('image/');

      if (!isPdf && !isVideo && !isImage) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" is not supported. Only PDF documents (.pdf), images (.webp/.gif/.jpg/.png), or videos (.mp4/.webm) are permitted.`,
          },
          { status: 400 }
        );
      }

      // Check size limit based on file type
      const allowedSize = isPdf ? MAX_PDF_SIZE : isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > allowedSize) {
        const sizeMb = Math.round(allowedSize / (1024 * 1024));
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" exceeds the ${sizeMb}MB size limit for this file type.`,
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

      const prefix = isPdf ? 'portfolio_pdf' : isVideo ? 'video' : 'img';
      const defaultExt = isPdf ? 'upload.pdf' : isVideo ? 'upload.mp4' : 'upload.webp';
      const fileName = `${prefix}_${timestamp}_${cleanName || defaultExt}`;

      let mimeType = file.type;
      if (!mimeType) {
        if (fileNameLower.endsWith('.gif')) mimeType = 'image/gif';
        else if (fileNameLower.endsWith('.webp')) mimeType = 'image/webp';
        else if (fileNameLower.endsWith('.png')) mimeType = 'image/png';
        else if (fileNameLower.endsWith('.jpg') || fileNameLower.endsWith('.jpeg')) mimeType = 'image/jpeg';
        else if (fileNameLower.endsWith('.svg')) mimeType = 'image/svg+xml';
        else if (fileNameLower.endsWith('.mp4')) mimeType = 'video/mp4';
        else if (fileNameLower.endsWith('.webm')) mimeType = 'video/webm';
        else if (fileNameLower.endsWith('.pdf')) mimeType = 'application/pdf';
        else mimeType = isVideo ? 'video/mp4' : isPdf ? 'application/pdf' : 'image/webp';
      }

      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        uploadedUrls.push(`/uploads/${fileName}`);
      } catch (fsErr) {
        // Fallback for Vercel/serverless environments where local filesystem is read-only (EROFS)
        const base64 = buffer.toString('base64');
        uploadedUrls.push(`data:${mimeType};base64,${base64}`);
      }
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
    let errorMessage = error.message || 'Failed to upload files';
    if (error.code === 'EROFS' || (typeof errorMessage === 'string' && errorMessage.includes('EROFS'))) {
      errorMessage = 'Local file storage is read-only on serverless deployment (Vercel). Please paste direct image/video URLs into the URL input instead.';
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
