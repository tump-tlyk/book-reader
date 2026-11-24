import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const subs = db.prepare(
    `SELECT s.*, u.name as user_name, u.email as user_email
     FROM subscriptions s
     JOIN users u ON s.user_id = u.id
     ORDER BY s.created_at DESC`
  ).all();
  return NextResponse.json(subs);
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    const { id, status } = await request.json();

    if (!id || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Du lieu khong hop le' }, { status: 400 });
    }

    const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(id);
    if (!sub) {
      return NextResponse.json({ error: 'Khong tim thay yeu cau' }, { status: 404 });
    }

    if (status === 'approved') {
      // Calculate subscription end date
      const planDays = {
        '1month': 30,
        '3months': 90,
        '6months': 180,
        '1year': 365,
      };

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(sub.user_id);
      let startDate = new Date();

      // If user already has active subscription, extend from end date
      if (user.subscription_end && new Date(user.subscription_end) > startDate) {
        startDate = new Date(user.subscription_end);
      }

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (planDays[sub.plan] || 30));

      // Update subscription record
      db.prepare(
        "UPDATE subscriptions SET status = 'approved', approved_at = datetime('now','localtime'), approved_by = ? WHERE id = ?"
      ).run(session?.user?.id || null, id);

      // Update user subscription
      db.prepare(
        "UPDATE users SET subscription_plan = ?, subscription_end = ?, updated_at = datetime('now','localtime') WHERE id = ?"
      ).run(sub.plan, endDate.toISOString(), sub.user_id);
    } else {
      db.prepare("UPDATE subscriptions SET status = 'rejected' WHERE id = ?").run(id);
    }

    return NextResponse.json({ message: `Da ${status === 'approved' ? 'duyet' : 'tu choi'} yeu cau` });
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json({ error: 'Loi he thong' }, { status: 500 });
  }
}
