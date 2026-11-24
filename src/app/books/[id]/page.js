import db from '@/lib/db';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const book = db.prepare('SELECT title, author FROM books WHERE id = ?').get(params.id);
  if (!book) return { title: 'Khong tim thay' };
  return { title: `${book.title} - BookShelf` };
}

export default async function BookDetailPage({ params }) {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(params.id);
  if (!book) notFound();

  const session = await getServerSession(authOptions);
  let isPremium = false;
  if (session?.user) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user.id);
    isPremium = user?.role === 'admin' || (user?.subscription_end && new Date(user.subscription_end) > new Date());
  }

  // Related books
  const related = db.prepare('SELECT * FROM books WHERE category = ? AND id != ? LIMIT 4').all(book.category, book.id);

  // Increment views
  db.prepare('UPDATE books SET views = views + 1 WHERE id = ?').run(book.id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Cover */}
          <div className="md:w-1/3 bg-gradient-to-br from-indigo-100 to-purple-100 p-8 flex items-center justify-center">
            {book.cover_image ? (
              <img src={`/api/files/${book.cover_image}`} alt={book.title} className="rounded-lg shadow-lg max-h-96 object-contain" />
            ) : (
              <div className="w-48 h-64 bg-white/50 rounded-lg flex items-center justify-center">
                <svg className="w-20 h-20 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:w-2/3 p-8">
            <div className="flex items-start justify-between">
              <div>
                {book.category && (
                  <span className="inline-block text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium mb-3">
                    {book.category}
                  </span>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-lg text-gray-500 mb-4">Tac gia: {book.author}</p>
              </div>
            </div>

            <div className="flex gap-6 text-sm text-gray-500 mb-6">
              <span>{book.total_pages} trang</span>
              <span>{book.views} luot doc</span>
            </div>

            {book.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Mo ta</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{book.description}</p>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <Link href={`/reader/${book.id}`} className="btn-primary text-lg px-8">
                Doc sach
              </Link>
              {!isPremium && (
                <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-4 rounded-lg">
                  Mien phi doc 3 trang dau
                </div>
              )}
            </div>

            {!isPremium && !session && (
              <p className="text-sm text-gray-400 mt-4">
                <Link href="/login" className="text-indigo-600 hover:underline">Dang nhap</Link> va{' '}
                <Link href="/pricing" className="text-indigo-600 hover:underline">nang cap Premium</Link> de doc toan bo sach
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Related Books */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sach lien quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map(b => (
              <Link key={b.id} href={`/books/${b.id}`} className="group">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition border border-gray-100">
                  <div className="aspect-[3/4] bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                    {b.cover_image ? (
                      <img src={`/api/files/${b.cover_image}`} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-indigo-600">{b.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{b.author}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
