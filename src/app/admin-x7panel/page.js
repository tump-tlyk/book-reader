'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = [
    { label: 'Tổng số sách PDF', value: stats?.totalBooks || 0, icon: '📖', color: 'from-blue-500 to-indigo-600' },
    { label: 'Tổng thành viên', value: stats?.totalUsers || 0, icon: '👤', color: 'from-emerald-500 to-teal-600' },
    { label: 'Thành viên VIP', value: stats?.premiumUsers || 0, icon: '⭐', color: 'from-amber-500 to-orange-600' },
    { label: 'Chờ duyệt thanh toán', value: stats?.pendingSubs || 0, icon: '⏳', color: 'from-rose-500 to-red-600', alert: stats?.pendingSubs > 0 },
    { label: 'Doanh thu tích luỹ', value: `${(stats?.totalRevenue || 0).toLocaleString()}đ`, icon: '💰', color: 'from-purple-600 to-indigo-700' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bảng Quản Trị Hệ Thống</h1>
        <p className="text-slate-500 mt-1">Theo dõi hoạt động, doanh thu và yêu cầu đăng ký VIP của thành viên.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {statCards.map((c, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 ${
              c.alert ? 'ring-2 ring-rose-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{c.icon}</span>
              {c.alert && (
                <span className="animate-pulse bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  Cần xử lý
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-4 font-medium uppercase tracking-wider">{c.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Yêu cầu thanh toán gần nhất */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-lg">Yêu cầu chuyển khoản mới nhất</h2>
            <Link href="/admin-x7panel/subscriptions" className="text-xs font-semibold text-indigo-600 hover:underline">
              Xem tất cả &rarr;
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {stats?.recentSubs?.length > 0 ? (
              stats.recentSubs.slice(0, 5).map((sub) => (
                <div key={sub.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{sub.user_name} ({sub.user_email})</p>
                    <p className="text-xs text-slate-400">Gói: <span className="font-medium text-slate-700">{sub.plan}</span> • CK: {sub.transfer_content || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-indigo-600">{sub.amount.toLocaleString()}đ</span>
                    <div>
                      <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        sub.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {sub.status === 'approved' ? 'Đã duyệt' : sub.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 py-6 text-center">Chưa có giao dịch chuyển khoản nào</p>
            )}
          </div>
        </div>

        {/* Thành viên mới đăng ký */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-lg">Thành viên mới nhất</h2>
            <Link href="/admin-x7panel/users" className="text-xs font-semibold text-indigo-600 hover:underline">
              Quản lý thành viên &rarr;
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {stats?.recentUsers?.length > 0 ? (
              stats.recentUsers.slice(0, 5).map((u) => {
                const isVip = u.subscription_end && new Date(u.subscription_end) > new Date();
                return (
                  <div key={u.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        isVip ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : isVip ? 'VIP' : 'Miễn phí'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400 py-6 text-center">Chưa có thành viên</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
