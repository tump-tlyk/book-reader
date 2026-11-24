import db from '@/lib/db';
import BookCard from '@/components/BookCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function BooksPage({ searchParams }) {
  const category = searchParams?.category || '';
  const search = searchParams?.search || '';
  const page = parseInt(searchParams?.page || '1');
  const limit = 24;
  const offset = (page - 1) * limit;

  let where = [];
  let params = [];

  if (category) { where.push('category = ?'); params.push(category); }
  if (search) { where.push('(title LIKE ? OR author LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';
  const total = db.prepare(`SELECT COUNT(*) as count FROM books ${whereClause}`).get(...params).count;
  const books = db.prepare(`SELECT * FROM books ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
            <h3 className="font-bold text-gray-900 mb-4">The loai</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/books" className={`block py-1.5 px-3 rounded-lg text-sm transition ${!category ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                  Tat ca
                </Link>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link href={`/books?category=${encodeURIComponent(cat.name)}`}
                    className={`block py-1.5 px-3 rounded-lg text-sm transition ${category === cat.name ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Search bar */}
          <form action="/books" className="mb-6">
            {category && <input type="hidden" name="category" value={category} />}
            <div className="flex gap-2">
              <input type="text" name="search" defaultValue={search} placeholder="Tim kiem sach..." className="input-field flex-1" />
              <button type="submit" className="btn-primary">Tim kiem</button>
            </div>
          </form>

          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-500">
              {total} ket qua {category && <span>trong <strong>{category}</strong></span>}
              {search && <span> cho &quot;{search}&quot;</span>}
            </p>
          </div>

          {books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {books.map(book => <BookCard key={book.id} book={book} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Khong tim thay sach nao</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link key={p} href={`/books?page=${p}${category ? `&category=${encodeURIComponent(category)}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${p === page ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
