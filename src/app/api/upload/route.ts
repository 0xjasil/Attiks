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
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // In serverless environments like Vercel, filesystem outside /tmp is read-only
    }

    const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // 25MB
    const MAX_PDF_SIZE = 35 * 1024 * 1024; // 35MB
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
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
        /\.(webp|jpg|jpeg|png|gif|svg)$/i.test(fileNameLower) ||
        file.type.startsWith('image/');

      if (!isPdf && !isVideo && !isImage) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" is not supported. Only PDF documents (.pdf), images (.webp/.jpg/.png), or videos (.mp4/.webm) are permitted.`,
          },
          { status: 400 }
        );
      }

      // Check size limit based on file type
      const allowedSize = isPdf ? MAX_PDF_SIZE : isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > allowedSize) {
        const sizeMb = Math.round(allowedSize / (1024 * 1024));
        const actualMb = (file.size / (1024 * 1024)).toFixed(2);
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" (${actualMb}MB) exceeds the ${sizeMb}MB limit for this file type.`,
          },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const cleanName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const prefix = isPdf ? 'portfolio_pdf' : isVideo ? 'video' : 'img';
      const defaultExt = isPdf ? 'upload.pdf' : isVideo ? 'upload.mp4' : 'upload.webp';
      const fileName = `${prefix}_${timestamp}_${cleanName || defaultExt}`;
      const filePath = path.join(uploadDir, fileName);

      let savedLocally = false;
      try {
        await writeFile(filePath, buffer);
        uploadedUrls.push(`/uploads/${fileName}`);
        savedLocally = true;
      } catch (fsErr: any) {
        console.warn('Local filesystem write failed (serverless environment):', fsErr?.message);
      }

      if (!savedLocally) {
        // Fallback for serverless Vercel environment where public/ is read-only
        // 1. Try forwarding to BACKEND_URL/api/upload if available
        const backendUrl = process.env.BACKEND_URL;
        let forwarded = false;
        if (backendUrl && !backendUrl.includes('localhost')) {
          try {
            const forwardForm = new FormData();
            const blob = new Blob([buffer], { type: file.type || 'image/webp' });
            forwardForm.append('file', blob, fileName);
            const backendRes = await fetch(`${backendUrl}/api/upload`, {
              method: 'POST',
              body: forwardForm,
            });
            if (backendRes.ok) {
              const backendJson = await backendRes.json();
              const url =
                backendJson.data?.url ||
                (Array.isArray(backendJson.data?.urls) && backendJson.data.urls[0]);
              if (url) {
                uploadedUrls.push(url);
                forwarded = true;
              }
            }
          } catch (bErr) {
            console.warn('Backend upload forward failed:', bErr);
          }
        }

        // 2. If not forwarded, generate a lightweight data URL
        if (!forwarded) {
          const mimeType = isPdf
            ? 'application/pdf'
            : isVideo
            ? file.type || 'video/mp4'
            : file.type || 'image/webp';
          const base64 = buffer.toString('base64');
          uploadedUrls.push(`data:${mimeType};base64,${base64}`);
        }
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
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload files' },
      { status: 500 }
    );
  }
}
