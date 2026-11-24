'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { label: 'Tổng quan', href: '/admin-x7panel', icon: '📊' },
    { label: 'Quản lý Sách', href: '/admin-x7panel/books', icon: '📚' },
    { label: 'Duyệt đăng ký VIP', href: '/admin-x7panel/subscriptions', icon: '💳' },
    { label: 'Quản lý Thành viên', href: '/admin-x7panel/users', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Admin */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex-shrink-0 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold block">Hệ thống kín</span>
              <h1 className="text-xl font-black tracking-tight text-white">BookShelf Admin</h1>
            </div>
          </div>
          
          <div className="px-4 py-3 bg-slate-800/50 text-xs text-slate-400 border-b border-slate-800">
            Xin chào: <strong className="text-slate-200">{session?.user?.name || 'Admin'}</strong>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <span>🌐</span> Xem trang chủ
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
          >
            <span>🚪</span> Đăng xuất Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
