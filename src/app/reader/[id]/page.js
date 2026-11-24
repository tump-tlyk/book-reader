'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ReaderPage({ params }) {
  const { data: session } = useSession();
  const [numPages, setNumPages] = useState(null);
  const [totalBookPages, setTotalBookPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  const isPremium = session?.user?.isPremium || session?.user?.role === 'admin';

  useEffect(() => {
    fetch(`/api/books/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setBook(data);
        setTotalBookPages(data.total_pages);
      })
      .catch(console.error);
  }, [params.id]);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
    setNumPages(n);
    setLoading(false);
  }, []);

  const pdfUrl = `/api/pdf?bookId=${params.id}`;

  const goToPage = (p) => {
    if (p >= 1 && p <= (numPages || 1)) setPageNumber(p);
  };

  const maxFreePage = 3;
  const isRestricted = !isPremium && numPages && numPages <= maxFreePage && totalBookPages > maxFreePage;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top bar */}
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href={book ? `/books/${book.id}` : '/books'} className="text-gray-300 hover:text-white transition">
            &larr; Quay lai
          </Link>
          {book && <span className="text-sm text-gray-400 hidden md:block">{book.title}</span>}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="text-gray-300 hover:text-white px-2 py-1 rounded bg-gray-700">-</button>
          <span className="text-sm text-gray-300">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="text-gray-300 hover:text-white px-2 py-1 rounded bg-gray-700">+</button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => goToPage(pageNumber - 1)} disabled={pageNumber <= 1} className="text-gray-300 hover:text-white disabled:opacity-30 px-2 py-1">
            &laquo;
          </button>
          <span className="text-sm">
            Trang {pageNumber} / {totalBookPages || numPages || '...'}
          </span>
          <button onClick={() => goToPage(pageNumber + 1)} disabled={pageNumber >= (numPages || 1)} className="text-gray-300 hover:text-white disabled:opacity-30 px-2 py-1">
            &raquo;
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div ref={containerRef} className="flex flex-col items-center py-8 px-4">
        {loading && (
          <div className="text-white text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Dang tai sach...</p>
          </div>
        )}

        <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} loading="">
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>

        {/* Upgrade banner for free users */}
        {isRestricted && pageNumber >= maxFreePage && (
          <div className="mt-8 max-w-lg mx-auto text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <h3 className="text-2xl font-bold mb-3">Ban da doc het 3 trang mien phi</h3>
            <p className="text-indigo-100 mb-2">Sach nay co {totalBookPages} trang.</p>
            <p className="text-indigo-200 mb-6">Nang cap Premium de doc toan bo noi dung.</p>
            <Link href="/pricing" className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-bold hover:bg-indigo-50 transition">
              Xem bang gia
            </Link>
          </div>
        )}

        {/* Not logged in */}
        {!session && numPages && numPages <= maxFreePage && (
          <div className="mt-8 max-w-lg mx-auto text-center bg-gray-800 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-3">Dang nhap de doc them</h3>
            <p className="text-gray-300 mb-6">Nang cap tai khoan Premium de truy cap toan bo thu vien sach.</p>
            <Link href="/login" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
              Dang nhap
            </Link>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur text-white py-3 flex justify-center gap-4">
        <button onClick={() => goToPage(1)} disabled={pageNumber <= 1} className="px-3 py-1.5 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 text-sm">
          Trang dau
        </button>
        <button onClick={() => goToPage(pageNumber - 1)} disabled={pageNumber <= 1} className="px-3 py-1.5 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 text-sm">
          Trang truoc
        </button>
        <input
          type="number"
          min={1}
          max={numPages || 1}
          value={pageNumber}
          onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
          className="w-16 text-center bg-gray-700 rounded text-sm py-1.5 text-white"
        />
        <button onClick={() => goToPage(pageNumber + 1)} disabled={pageNumber >= (numPages || 1)} className="px-3 py-1.5 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 text-sm">
          Trang sau
        </button>
        <button onClick={() => goToPage(numPages)} disabled={pageNumber >= (numPages || 1)} className="px-3 py-1.5 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 text-sm">
          Trang cuoi
        </button>
      </div>
    </div>
  );
}
