import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import db from '../src/lib/db.js';

async function seed() {
  console.log('Seeding sample PDF books...');

  const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
  const booksDir = path.join(uploadsDir, 'books');
  const coversDir = path.join(uploadsDir, 'covers');

  [booksDir, coversDir].forEach((d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  const existing = db.prepare('SELECT COUNT(*) as count FROM books').get();
  if (existing.count > 0) {
    console.log(`Already have ${existing.count} books in database.`);
    return;
  }

  // Create a 10-page sample PDF
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
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
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
      title: 'Dac Nhan Tam (Ban PDF Chuan)',
      author: 'Dale Carnegie',
      category: 'Ky nang song',
      description: 'Cuon sach kinh dien ve nghe thuat giao tiep, thu phuc long nguoi va xay dung cac moi quan he ben vung.',
      is_featured: 1,
    },
    {
      title: 'Nha Gia Kim (The Alchemist)',
      author: 'Paulo Coelho',
      category: 'Van hoc',
      description: 'Hanh trinh theo duoi uoc mo va lang nghe tieng goi trai tim cua chang chan cuu Santiago.',
      is_featured: 1,
    },
    {
      title: 'Cha Giau Cha Ngheo',
      author: 'Robert Kiyosaki',
      category: 'Kinh te',
      description: 'Thay doi tu duy tai chinh, hieu ro su khac biet giua tai san va tieu san de dat tu do tai chinh.',
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

seed().catch(console.error);
