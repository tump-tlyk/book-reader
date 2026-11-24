const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(process.cwd(), 'data', 'database.sqlite');
const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
const booksDir = path.join(uploadsDir, 'books');
const coversDir = path.join(uploadsDir, 'covers');

[path.join(process.cwd(), 'data'), uploadsDir, booksDir, coversDir].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Create tables if not exist
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
`);

// Admin account
const admin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@bookshelf.vn');
if (!admin) {
  const hash = bcrypt.hashSync('Admin@Bookshelf2024!', 12);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Quản Trị Viên',
    'admin@bookshelf.vn',
    hash,
    'admin'
  );
  console.log('Seeded admin: admin@bookshelf.vn / Admin@Bookshelf2024!');
}

// Categories
const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (catCount.count === 0) {
  const ins = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
  const cats = [
    ['Văn học', 'van-hoc'],
    ['Kinh tế', 'kinh-te'],
    ['Khoa học', 'khoa-hoc'],
    ['Tâm lý', 'tam-ly'],
    ['Kỹ năng sống', 'ky-nang-song'],
    ['Lịch sử', 'lich-su'],
    ['Truyện', 'truyen'],
    ['Giáo dục', 'giao-duc'],
    ['Công nghệ', 'cong-nghe'],
    ['Sức khỏe', 'suc-khoe'],
  ];
  cats.forEach(([name, slug]) => ins.run(name, slug));
  console.log('Seeded categories.');
}

async function createBooks() {
  const existing = db.prepare('SELECT COUNT(*) as count FROM books').get();
  if (existing.count > 0) {
    console.log(`Already have ${existing.count} books.`);
    return;
  }

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pagesInfo = [
    { title: 'TRANG 1: LOI MO DAU', desc: 'Trang 1 duoc doc MIEN PHI. Chao mung ban den voi thu vien BookShelf.' },
    { title: 'TRANG 2: NOI DUNG CHUONG 1', desc: 'Trang 2 van duoc doc MIEN PHI theo chinh sach 3 trang dau tien.' },
    { title: 'TRANG 3: KET THUC BAN DOC THU', desc: 'Day la trang doc thu cuoi cung danh cho thanh vien mien phi. Trang sau yeu cau VIP.' },
    { title: 'TRANG 4: BAN QUYEN NOI DUNG VIP', desc: 'Noi dung nang cao: Chi thanh vien VIP da thanh toan moi duoc doc trang nay!' },
    { title: 'TRANG 5: BI QUYET THANH CONG', desc: 'Noi dung VIP trang 5: Phuong phap quan ly tai chinh va phat trien ban than.' },
    { title: 'TRANG 6: CHIEN LUOC DAI HAN', desc: 'Noi dung VIP trang 6: Xay dung tam nhin va ke hoach hanh dong 5 nam.' },
    { title: 'TRANG 7: TOI UU HOA HIEU SUAT', desc: 'Noi dung VIP trang 7: Ky nang tap trung sau va loai bo sao nhang.' },
    { title: 'TRANG 8: QUAN LY THOI GIAN', desc: 'Noi dung VIP trang 8: Nguyen tac Pareto 80/20 ung dung trong cong viec.' },
    { title: 'TRANG 9: TAM LY HOC HANH VI', desc: 'Noi dung VIP trang 9: Thau hieu tam ly va giao tiep thuyet phuc.' },
    { title: 'TRANG 10: TONG KET VA CAM ON', desc: 'Trang cuoi cung cua cuon sach. Cam on ban da nang cap tai khoan VIP!' },
  ];

  for (let i = 0; i < pagesInfo.length; i++) {
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const info = pagesInfo[i];

    page.drawRectangle({
      x: 0,
      y: height - 80,
      width: width,
      height: 80,
      color: i < 3 ? rgb(0.3, 0.4, 0.9) : rgb(0.2, 0.2, 0.3),
    });

    page.drawText(info.title, {
      x: 40,
      y: height - 50,
      size: 18,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    page.drawText(`Trang ${i + 1} / ${pagesInfo.length}`, {
      x: width - 120,
      y: height - 50,
      size: 12,
      font: font,
      color: rgb(0.9, 0.9, 0.9),
    });

    page.drawText(info.desc, {
      x: 40,
      y: height - 130,
      size: 13,
      font: font,
      color: rgb(0.1, 0.1, 0.1),
    });

    for (let line = 0; line < 15; line++) {
      page.drawText(
        `Dong ${line + 1}: Kien thuc la suc manh. BookShelf mang lai trai nghiem doc sach PDF chat luong cao.`,
        {
          x: 40,
          y: height - 180 - line * 28,
          size: 11,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
        }
      );
    }
  }

  const pdfBytes = await pdfDoc.save();
  const samplePdfName = `sample-book-${Date.now()}.pdf`;
  fs.writeFileSync(path.join(booksDir, samplePdfName), pdfBytes);

  const sampleBooks = [
    {
      title: 'Đắc Nhân Tâm (Bản PDF Chuẩn 10 Trang)',
      author: 'Dale Carnegie',
      category: 'Kỹ năng sống',
      description: 'Cuốn sách kinh điển về nghệ thuật giao tiếp, thu phục lòng người và xây dựng các mối quan hệ bền vững.',
      is_featured: 1,
    },
    {
      title: 'Nhà Giả Kim (The Alchemist)',
      author: 'Paulo Coelho',
      category: 'Văn học',
      description: 'Hành trình theo đuổi ước mơ và lắng nghe tiếng gọi trái tim của chàng chăn cừu Santiago.',
      is_featured: 1,
    },
    {
      title: 'Cha Giàu Cha Nghèo',
      author: 'Robert Kiyosaki',
      category: 'Kinh tế',
      description: 'Thay đổi tư duy tài chính, hiểu rõ sự khác biệt giữa tài sản và tiêu sản để đạt tự do tài chính.',
      is_featured: 1,
    },
  ];

  const stmt = db.prepare(
    'INSERT INTO books (title, author, description, cover_image, pdf_path, category, total_pages, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  for (const b of sampleBooks) {
    stmt.run(b.title, b.author, b.description, '', `books/${samplePdfName}`, b.category, 10, b.is_featured);
  }

  console.log('Seeded sample books successfully with 10 pages each!');
}

createBooks().catch(console.error);
