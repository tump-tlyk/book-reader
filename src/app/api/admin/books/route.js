import { NextResponse } from 'next/server';
import db from '@/lib/db';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const books = db.prepare('SELECT * FROM books ORDER BY created_at DESC').all();
  return NextResponse.json(books);
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  if (book) {
    // Delete files
    const pdfPath = path.join(process.cwd(), 'data', 'uploads', book.pdf_path);
    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    if (book.cover_image) {
      const coverPath = path.join(process.cwd(), 'data', 'uploads', book.cover_image);
      if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    }
    db.prepare('DELETE FROM books WHERE id = ?').run(id);
  }
  return NextResponse.json({ message: 'Da xoa sach' });
}

export async function PUT(request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const title = formData.get('title');
    const author = formData.get('author');
    const description = formData.get('description') || '';
    const category = formData.get('category') || '';
    const isFeatured = formData.get('isFeatured') === 'true' ? 1 : 0;
    const coverFile = formData.get('cover');

    if (!id || !title || !author) {
      return NextResponse.json({ error: 'Thieu thong tin' }, { status: 400 });
    }

    let coverUpdate = '';
    let coverParam = [];

    if (coverFile && coverFile.size > 0) {
      const timestamp = Date.now();
      const coverName = `${timestamp}-${coverFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const coverFullPath = path.join(process.cwd(), 'data', 'uploads', 'covers', coverName);
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
      fs.writeFileSync(coverFullPath, coverBuffer);
      coverUpdate = ', cover_image = ?';
      coverParam = [`covers/${coverName}`];
    }

    db.prepare(
      `UPDATE books SET title = ?, author = ?, description = ?, category = ?, is_featured = ?${coverUpdate}, updated_at = datetime('now','localtime') WHERE id = ?`
    ).run(title, author, description, category, isFeatured, ...coverParam, id);

    return NextResponse.json({ message: 'Cap nhat thanh cong' });
  } catch (error) {
    console.error('Book update error:', error);
    return NextResponse.json({ error: 'Loi he thong' }, { status: 500 });
  }
}
