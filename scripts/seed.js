/**
 * Script to generate a sample multi-page PDF book and insert it into the database
 * so the web application has ready-to-test books right away.
 */
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

  // Check if books already exist
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
    { title: 'TRANG 1: LỜI MỞ ĐẦU', desc: 'Trang này được đọc MIỄN PHÍ. Chào mừng bạn đến với thư viện BookShelf.' },
    { title: 'TRANG 2: NỘI DUNG CHƯƠNG 1', desc: 'Trang này vẫn được đọc MIỄN PHÍ theo chính sách 3 trang đầu.' },
    { title: 'TRANG 3: KẾT THÚC BẢN ĐỌC THỬ', desc: 'Đây là trang đọc thử cuối cùng dành cho thành viên thường. Trang sau sẽ yêu cầu VIP.' },
    { title: 'TRANG 4: BẢN QUYỀN NỘI DUNG VIP', desc: 'Nội dung nâng cao: Chỉ thành viên VIP đã thanh toán mới được đọc trang này!' },
    { title: 'TRANG 5: BÍ QUYẾT THÀNH CÔNG', desc: 'Nội dung VIP trang 5: Phương pháp quản lý tài chính và phát triển bản thân.' },
    { title: 'TRANG 6: CHIẾN LƯỢC DÀI HẠN', desc: 'Nội dung VIP trang 6: Xây dựng tầm nhìn và kế hoạch hành động 5 năm.' },
    { title: 'TRANG 7: TỐI ƯU HOÁ HIỆU SUẤT', desc: 'Nội dung VIP trang 7: Kỹ năng tập trung sâu và loại bỏ sao nhãng.' },
    { title: 'TRANG 8: QUẢN LÝ THỜI GIAN', desc: 'Nội dung VIP trang 8: Nguyên tắc Pareto 80/20 ứng dụng trong công việc.' },
    { title: 'TRANG 9: TÂM LÝ HỌC HÀNH VI', desc: 'Nội dung VIP trang 9: Thấu hiểu tâm lý và giao tiếp thuyết phục.' },
    { title: 'TRANG 10: TỔNG KẾT & LỜI CẢM ƠN', desc: 'Trang cuối cùng của cuốn sách. Cảm ơn bạn đã nâng cấp tài khoản VIP!' },
  ];

  for (let i = 0; i < pagesInfo.length; i++) {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    const info = pagesInfo[i];

    // Background header bar
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

    // Content body
    page.drawText(info.desc, {
      x: 40,
      y: height - 130,
      size: 13,
      font: font,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Dummy lines of text
    for (let line = 0; line < 15; line++) {
      page.drawText(
        `Dong ${line + 1}: Kien thuc la suc manh. BookShelf mang lai trai nghiem doc sach tot nhat cho doc gia Viet Nam.`,
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

  // Insert 3 sample books
  const sampleBooks = [
    {
      title: 'Đắc Nhân Tâm (Bản PDF Chuẩn)',
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

seed().catch(console.error);
