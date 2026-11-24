import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Chua dang nhap' }, { status: 401 });
    }

    const { plan, bankName, accountName, transferContent } = await request.json();

    const plans = {
      '1month': { amount: 30000, label: '1 thang' },
      '3months': { amount: 70000, label: '3 thang' },
      '6months': { amount: 150000, label: '6 thang' },
      '1year': { amount: 320000, label: '1 nam' },
    };

    if (!plans[plan]) {
      return NextResponse.json({ error: 'Goi khong hop le' }, { status: 400 });
    }

    // Check pending subscription
    const pending = db.prepare(
      "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'pending'"
    ).get(session.user.id);
    if (pending) {
      return NextResponse.json({ error: 'Ban da co yeu cau dang cho duyet' }, { status: 400 });
    }

    db.prepare(
      'INSERT INTO subscriptions (user_id, plan, amount, bank_name, account_name, transfer_content) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(session.user.id, plan, plans[plan].amount, bankName, accountName, transferContent);

    return NextResponse.json({ message: 'Da gui yeu cau. Vui long cho 1-2 phut de quan tri vien duyet.' });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Loi he thong' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Chua dang nhap' }, { status: 401 });
    }

    const subs = db.prepare(
      'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC'
    ).all(session.user.id);

    return NextResponse.json(subs);
  } catch (error) {
    return NextResponse.json({ error: 'Loi he thong' }, { status: 500 });
  }
}
