'use client';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';

const planInfo = {
  '1month': { name: '1 Thang', price: '30.000d' },
  '3months': { name: '3 Thang', price: '70.000d' },
  '6months': { name: '6 Thang', price: '150.000d' },
  '1year': { name: '1 Nam', price: '320.000d' },
};

function PaymentForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') || '1month';
  const plan = planInfo[planId];

  const [form, setForm] = useState({ bankName: '', accountName: '', transferContent: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (status === 'loading') return <div className="text-center py-20">Dang tai...</div>;
  if (!session) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId, ...form }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Da gui yeu cau!</h2>
          <p className="text-gray-500 mb-6">
            Yeu cau dang ky goi <strong>{plan?.name}</strong> da duoc gui. Quan tri vien se duyet trong 1-2 phut.
          </p>
          <Link href="/" className="btn-primary">Ve trang chu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toan</h1>
      <p className="text-gray-500 mb-8">Dang ky goi <strong>{plan?.name}</strong> - <strong>{plan?.price}</strong></p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Bank info */}
        <div className="bg-indigo-50 rounded-2xl p-6">
          <h3 className="font-bold text-indigo-900 mb-4">Thong tin chuyen khoan</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500">Ngan hang:</span>
              <p className="font-semibold text-gray-900">MB Bank</p>
            </div>
            <div>
              <span className="text-gray-500">So tai khoan:</span>
              <p className="font-semibold text-gray-900">0123456789</p>
            </div>
            <div>
              <span className="text-gray-500">Chu tai khoan:</span>
              <p className="font-semibold text-gray-900">NGUYEN VAN A</p>
            </div>
            <div>
              <span className="text-gray-500">So tien:</span>
              <p className="font-semibold text-indigo-600 text-lg">{plan?.price}</p>
            </div>
            <div>
              <span className="text-gray-500">Noi dung CK:</span>
              <p className="font-semibold text-gray-900">BOOKSHELF {session.user.email} {planId}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            Luu y: Vui long chuyen khoan dung so tien va noi dung de duoc kich hoat nhanh nhat.
          </div>
        </div>

        {/* Payment form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border">
          <h3 className="font-bold text-gray-900 mb-4">Xac nhan thanh toan</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngan hang cua ban</label>
              <input type="text" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="input-field" placeholder="VD: Vietcombank, MB Bank..." required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ten chu tai khoan</label>
              <input type="text" value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                className="input-field" placeholder="NGUYEN VAN B" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Noi dung chuyen khoan</label>
              <input type="text" value={form.transferContent} onChange={(e) => setForm({ ...form, transferContent: e.target.value })}
                className="input-field" placeholder="Noi dung CK ban da gui" required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
              {loading ? 'Dang gui...' : 'Xac nhan da chuyen khoan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Dang tai...</div>}>
      <PaymentForm />
    </Suspense>
  );
}
