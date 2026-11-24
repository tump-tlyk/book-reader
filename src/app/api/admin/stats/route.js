import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get().count;
  const totalBooks = db.prepare('SELECT COUNT(*) as count FROM books').get().count;
  const premiumUsers = db.prepare(
    "SELECT COUNT(*) as count FROM users WHERE subscription_end > datetime('now','localtime')"
  ).get().count;
  const pendingSubs = db.prepare(
    "SELECT COUNT(*) as count FROM subscriptions WHERE status = 'pending'"
  ).get().count;
  const totalRevenue = db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM subscriptions WHERE status = 'approved'"
  ).get().total;
  const recentSubs = db.prepare(
    `SELECT s.*, u.name as user_name, u.email as user_email
     FROM subscriptions s JOIN users u ON s.user_id = u.id
     ORDER BY s.created_at DESC LIMIT 10`
  ).all();
  const recentUsers = db.prepare(
    "SELECT id, name, email, role, subscription_plan, subscription_end, created_at FROM users ORDER BY created_at DESC LIMIT 10"
  ).all();

  return NextResponse.json({
    totalUsers,
    totalBooks,
    premiumUsers,
    pendingSubs,
    totalRevenue,
    recentSubs,
    recentUsers,
  });
}
