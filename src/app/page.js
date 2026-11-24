import db from '@/lib/db';
import BookCard from '@/components/BookCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const featuredBooks = db.prepare('SELECT * FROM books WHERE is_featured = 1 ORDER BY created_at DESC LIMIT 8').all();
  const newBooks = db.prepare('SELECT * FROM books ORDER BY created_at DESC LIMIT 12').all();
  const categories = db.prepare(
    `SELECT c.*, COUNT(b.id) as book_count FROM categories c LEFT JOIN books b ON c.name = b.category GROUP BY c.id ORDER BY book_count DESC`
  ).all();
  const totalBooks = db.prepare('SELECT COUNT(*) as count FROM books').get().count;
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get().count;

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Thu Vien Sach<br /><span className="text-indigo-200">Truc Tuyen</span>
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Kham pha kho tang kien thuc voi hang nghin dau sach chat luong. Doc moi luc, moi noi ngay tren trinh duyet.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/books" className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition text-lg">
              Kham pha ngay
            </Link>
            <Link href="/pricing" className="border-2 border-white/80 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition text-lg">
              Xem bang gia
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl md:text-4xl font-bold text-indigo-600">{totalBooks}+</p>
            <p className="text-gray-500 mt-1">Dau sach</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-indigo-600">{categories.length}</p>
            <p className="text-gray-500 mt-1">The loai</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-indigo-600">{totalUsers}+</p>
            <p className="text-gray-500 mt-1">Thanh vien</p>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      {featuredBooks.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Sach noi bat</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {featuredBooks.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        </section>
      )}

      {/* New Books */}
      {newBooks.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Sach moi cap nhat</h2>
              <Link href="/books" className="text-indigo-600 hover:text-indigo-700 font-medium">Xem tat ca &rarr;</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {newBooks.map(book => <BookCard key={book.id} book={book} />)}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">The loai sach</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map(cat => (
              <Link key={cat.id} href={`/books?category=${encodeURIComponent(cat.name)}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-indigo-200 transition text-center group">
                <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">{cat.name}</p>
                <p className="text-sm text-gray-400 mt-1">{cat.book_count} sach</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Doc khong gioi han voi Premium</h2>
          <p className="text-lg text-indigo-100 mb-8">Chi tu 30.000d/thang, truy cap toan bo thu vien sach chat luong cao</p>
          <Link href="/pricing" className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-indigo-50 transition shadow-lg">
            Xem cac goi dang ky &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
