'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-xl font-bold text-gray-900">BookShelf</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-indigo-600 transition">Trang chu</Link>
            <Link href="/books" className="text-gray-600 hover:text-indigo-600 transition">Thu vien</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-indigo-600 transition">Bang gia</Link>
            {session ? (
              <div className="flex items-center space-x-4">
                {session.user.isPremium && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Premium</span>
                )}
                <Link href="/profile" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                  {session.user.name}
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-gray-500 hover:text-red-600 transition text-sm">
                  Dang xuat
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="text-gray-600 hover:text-indigo-600 transition">Dang nhap</Link>
                <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  Dang ky
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setOpen(!open)} className="text-gray-600 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link href="/" className="block py-2 text-gray-600" onClick={() => setOpen(false)}>Trang chu</Link>
            <Link href="/books" className="block py-2 text-gray-600" onClick={() => setOpen(false)}>Thu vien</Link>
            <Link href="/pricing" className="block py-2 text-gray-600" onClick={() => setOpen(false)}>Bang gia</Link>
            {session ? (
              <>
                <Link href="/profile" className="block py-2 text-gray-600" onClick={() => setOpen(false)}>{session.user.name}</Link>
                <button onClick={() => { signOut({ callbackUrl: '/' }); setOpen(false); }} className="block py-2 text-red-600">Dang xuat</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 text-gray-600" onClick={() => setOpen(false)}>Dang nhap</Link>
                <Link href="/register" className="block py-2 text-indigo-600 font-medium" onClick={() => setOpen(false)}>Dang ky</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
