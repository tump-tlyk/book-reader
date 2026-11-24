import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let where = [];
  let params = [];

  if (category) {
    where.push('b.category = ?');
    params.push(category);
  }
  if (search) {
    where.push('(b.title LIKE ? OR b.author LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const total = db.prepare(`SELECT COUNT(*) as count FROM books b ${whereClause}`).get(...params).count;
  const books = db.prepare(
    `SELECT b.* FROM books b ${whereClause} ORDER BY b.created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, limit, offset);

  return NextResponse.json({
    books,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
