import { NextResponse } from 'next/server';
import db from '@/lib/db';
import path from 'path';
import fs from 'fs';

// Upload book (admin only - protected by middleware)
export async function POST(request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title');
    const author = formData.get('author');
    const description = formData.get('description') || '';
    const category = formData.get('category') || '';
    const isFeatured = formData.get('isFeatured') === 'true' ? 1 : 0;
    const pdfFile = formData.get('pdf');
    const coverFile = formData.get('cover');

    if (!title || !author || !pdfFile) {
      return NextResponse.json({ error: 'Thieu thong tin bat buoc' }, { status: 400 });
    }

    // Save PDF
    const timestamp = Date.now();
    const pdfName = `${timestamp}-${pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const pdfPath = path.join(process.cwd(), 'data', 'uploads', 'books', pdfName);
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Count PDF pages
    let totalPages = 0;
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(pdfBuffer);
      totalPages = doc.getPageCount();
    } catch (e) {
      console.warn('Could not count pages:', e.message);
    }

    // Save cover image
    let coverPath = '';
    if (coverFile && coverFile.size > 0) {
      const coverName = `${timestamp}-${coverFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const coverFullPath = path.join(process.cwd(), 'data', 'uploads', 'covers', coverName);
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
      fs.writeFileSync(coverFullPath, coverBuffer);
      coverPath = `covers/${coverName}`;
    }

    const result = db.prepare(
      'INSERT INTO books (title, author, description, cover_image, pdf_path, category, total_pages, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(title, author, description, coverPath, `books/${pdfName}`, category, totalPages, isFeatured);

    return NextResponse.json({ id: result.lastInsertRowid, message: 'Upload thanh cong!' });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Loi upload: ' + error.message }, { status: 500 });
  }
}
