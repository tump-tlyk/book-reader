import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

// Serve PDF - restricted for free users
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json({ error: 'Missing bookId' }, { status: 400 });
    }

    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
    if (!book) {
      return NextResponse.json({ error: 'Sach khong ton tai' }, { status: 404 });
    }

    const pdfPath = path.join(process.cwd(), 'data', 'uploads', book.pdf_path);
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json({ error: 'File PDF khong ton tai' }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    let isPremium = false;

    if (session?.user) {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user.id);
      if (user) {
        isPremium = user.role === 'admin' ||
          (user.subscription_end && new Date(user.subscription_end) > new Date());
      }
    }

    const pdfBuffer = fs.readFileSync(pdfPath);

    if (isPremium) {
      return new NextResponse(pdfBuffer, {
        headers: { 'Content-Type': 'application/pdf' },
      });
    }

    // Free user: only first 3 pages
    const srcDoc = await PDFDocument.load(pdfBuffer);
    const totalPages = srcDoc.getPageCount();
    const maxFreePages = Math.min(3, totalPages);

    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(
      srcDoc,
      Array.from({ length: maxFreePages }, (_, i) => i)
    );
    pages.forEach((p) => newDoc.addPage(p));

    const restrictedPdf = await newDoc.save();
    return new NextResponse(restrictedPdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'X-Total-Pages': String(totalPages),
        'X-Free-Pages': String(maxFreePages),
      },
    });
  } catch (error) {
    console.error('PDF serve error:', error);
    return NextResponse.json({ error: 'Loi he thong' }, { status: 500 });
  }
}
