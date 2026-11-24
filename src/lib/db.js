import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'database.sqlite');

// Ensure directories exist
const dirs = [
  path.join(process.cwd(), 'data'),
  path.join(process.cwd(), 'data', 'uploads'),
  path.join(process.cwd(), 'data', 'uploads', 'books'),
  path.join(process.cwd(), 'data', 'uploads', 'covers'),
];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function createDb() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      image TEXT,
      role TEXT DEFAULT 'user',
      subscription_plan TEXT,
      subscription_end TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      description TEXT,
      cover_image TEXT,
      pdf_path TEXT NOT NULL,
      category TEXT,
      total_pages INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan TEXT NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      bank_name TEXT,
      account_name TEXT,
      transfer_content TEXT,
      payment_proof TEXT,
      note TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      approved_at TEXT,
      approved_by INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reading_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      last_page INTEGER DEFAULT 1,
      read_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      UNIQUE(user_id, book_id)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      UNIQUE(user_id, book_id)
    );
  `);

  // Seed admin user
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@bookshelf.vn');
  if (!adminExists) {
    const hashed = bcrypt.hashSync('Admin@Bookshelf2024!', 12);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'Quan Tri Vien', 'admin@bookshelf.vn', hashed, 'admin'
    );
  }

  // Seed default categories
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (catCount.count === 0) {
    const ins = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
    const cats = [
      ['Van hoc', 'van-hoc'],
      ['Kinh te', 'kinh-te'],
      ['Khoa hoc', 'khoa-hoc'],
      ['Tam ly', 'tam-ly'],
      ['Ky nang song', 'ky-nang-song'],
      ['Lich su', 'lich-su'],
      ['Truyen', 'truyen'],
      ['Giao duc', 'giao-duc'],
      ['Cong nghe', 'cong-nghe'],
      ['Suc khoe', 'suc-khoe'],
    ];
    const insertMany = db.transaction((items) => {
      for (const [name, slug] of items) ins.run(name, slug);
    });
    insertMany(cats);
  }

  return db;
}

// Singleton for development hot-reload
let db;
if (process.env.NODE_ENV === 'production') {
  db = createDb();
} else {
  if (!globalThis.__db) {
    globalThis.__db = createDb();
  }
  db = globalThis.__db;
}

export default db;
