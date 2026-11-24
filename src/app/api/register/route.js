import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Vui long dien day du thong tin' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Mat khau phai co it nhat 6 ky tu' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Email da duoc su dung' }, { status: 400 });
    }

    const hashed = bcrypt.hashSync(password, 12);
    db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashed);

    return NextResponse.json({ message: 'Dang ky thanh cong!' });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Loi he thong' }, { status: 500 });
  }
}
