import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const users = db.prepare(
    `SELECT u.*, 
      (SELECT COUNT(*) FROM subscriptions s WHERE s.user_id = u.id AND s.status = 'approved') as total_subs
    FROM users ORDER BY u.created_at DESC`
  ).all();

  // Remove passwords from response
  const safe = users.map(({ password, ...rest }) => rest);
  return NextResponse.json(safe);
}

export async function PUT(request) {
  const { id, role, subscription_plan, subscription_end } = await request.json();

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const updates = [];
  const params = [];

  if (role !== undefined) { updates.push('role = ?'); params.push(role); }
  if (subscription_plan !== undefined) { updates.push('subscription_plan = ?'); params.push(subscription_plan); }
  if (subscription_end !== undefined) { updates.push('subscription_end = ?'); params.push(subscription_end); }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  updates.push("updated_at = datetime('now','localtime')");
  params.push(id);

  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  return NextResponse.json({ message: 'Cap nhat thanh cong' });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  db.prepare('DELETE FROM users WHERE id = ? AND role != ?').run(id, 'admin');
  return NextResponse.json({ message: 'Da xoa' });
}
