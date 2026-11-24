import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  if (!book) {
    return NextResponse.json({ error: 'Khong tim thay sach' }, { status: 404 });
  }
  // Increment views
  db.prepare('UPDATE books SET views = views + 1 WHERE id = ?').run(id);
  return NextResponse.json(book);
}
