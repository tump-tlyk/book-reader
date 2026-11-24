import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request, { params }) {
  try {
    const filePath = params.path.join('/');
    const fullPath = path.join(process.cwd(), 'data', 'uploads', filePath);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'File khong ton tai' }, { status: 404 });
    }

    // Security: prevent path traversal
    const resolved = path.resolve(fullPath);
    const uploadsDir = path.resolve(path.join(process.cwd(), 'data', 'uploads'));
    if (!resolved.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const buffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();

    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('File serve error:', error);
    return NextResponse.json({ error: 'Loi he thong' }, { status: 500 });
  }
}
