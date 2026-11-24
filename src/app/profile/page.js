'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    if (session) {
      fetch('/api/subscriptions')
        .then(r => r.json())
        .then(data => setSubs(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [session]);

  if (status === 'loading') return <div className="text-center py-20">Dang tai...</div>;
  if (!session) { router.push('/login'); return null; }

  const user = session.user;
  const isPremium = user.isPremium;
  const subEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd) : null;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  const statusLabels = { pending: 'Cho duyet', approved: 'Da duyet', rejected: 'Tu choi' };
  const planLabels = { '1month': '1 Thang', '3months': '3 Thang', '6months': '6 Thang', '1year': '1 Nam' };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tai khoan cua toi</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile info */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Trang thai</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${isPremium ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {isPremium ? 'Premium' : 'Mien phi'}
              </span>
            </div>
            {user.subscriptionPlan && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Goi hien tai</span>
                <span className="font-medium">{planLabels[user.subscriptionPlan] || user.subscriptionPlan}</span>
              </div>
            )}
            {subEnd && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Het han</span>
                <span className={`font-medium ${subEnd < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                  {subEnd.toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>

          {!isPremium && (
            <Link href="/pricing" className="btn-primary w-full mt-6 text-center block">
              Nang cap Premium
            </Link>
          )}
        </div>

        {/* Subscription history */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Lich su dang ky</h3>
          {subs.length > 0 ? (
            <div className="space-y-3">
              {subs.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{planLabels[sub.plan] || sub.plan}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(sub.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(sub.amount).toLocaleString()}d</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[sub.status]}`}>
                      {statusLabels[sub.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Chua co lich su dang ky</p>
          )}
        </div>
      </div>
    </div>
  );
}
