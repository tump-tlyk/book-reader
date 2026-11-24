'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const plans = [
  { id: '1month', name: '1 Thang', price: '30.000', priceNum: 30000, perMonth: '30.000', desc: 'Phu hop de trai nghiem', popular: false },
  { id: '3months', name: '3 Thang', price: '70.000', priceNum: 70000, perMonth: '~23.300', desc: 'Tiet kiem 22%', popular: true },
  { id: '6months', name: '6 Thang', price: '150.000', priceNum: 150000, perMonth: '25.000', desc: 'Tiet kiem 17%', popular: false },
  { id: '1year', name: '1 Nam', price: '320.000', priceNum: 320000, perMonth: '~26.600', desc: 'Tiet kiem 11%', popular: false },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState('3months');

  const handleSelect = (planId) => {
    if (!session) {
      router.push('/login');
      return;
    }
    router.push(`/payment?plan=${planId}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Bang gia dang ky</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Chon goi phu hop de doc sach khong gioi han. Thanh toan don gian qua chuyen khoan ngan hang.
        </p>
      </div>

      {/* Free tier */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 max-w-md mx-auto text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Mien phi</h3>
        <p className="text-4xl font-bold text-gray-900 mb-4">0d</p>
        <ul className="text-gray-600 space-y-2 mb-6 text-sm">
          <li>&#10003; Xem thong tin sach</li>
          <li>&#10003; Doc 3 trang dau mien phi</li>
          <li>&#10007; Khong doc toan bo sach</li>
        </ul>
        {!session ? (
          <Link href="/register" className="btn-secondary w-full inline-block text-center">Dang ky mien phi</Link>
        ) : (
          <span className="text-green-600 font-medium">Da dang ky</span>
        )}
      </div>

      {/* Premium tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map(plan => (
          <div key={plan.id}
            className={`relative bg-white rounded-2xl shadow-sm border-2 p-8 transition-all hover:shadow-lg cursor-pointer
              ${plan.popular ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-gray-200 hover:border-indigo-300'}
              ${selected === plan.id ? 'ring-2 ring-indigo-400' : ''}`}
            onClick={() => setSelected(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-4 py-1 rounded-full font-medium">
                Pho bien nhat
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{plan.price}d</p>
            <p className="text-sm text-gray-400 mb-6">{plan.perMonth}d/thang</p>
            <ul className="text-gray-600 space-y-2 mb-6 text-sm">
              <li>&#10003; Doc khong gioi han</li>
              <li>&#10003; Truy cap toan bo thu vien</li>
              <li>&#10003; Ho tro uu tien</li>
            </ul>
            <button onClick={() => handleSelect(plan.id)}
              className={`w-full py-3 rounded-lg font-semibold transition ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
              {session ? 'Dang ky ngay' : 'Dang nhap de dang ky'}
            </button>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Quy trinh dang ky</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-indigo-600 font-bold text-lg">1</span>
            </div>
            <h4 className="font-semibold mb-1">Chon goi</h4>
            <p className="text-sm text-gray-500">Chon goi dang ky phu hop</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-indigo-600 font-bold text-lg">2</span>
            </div>
            <h4 className="font-semibold mb-1">Chuyen khoan</h4>
            <p className="text-sm text-gray-500">Chuyen khoan theo thong tin</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-indigo-600 font-bold text-lg">3</span>
            </div>
            <h4 className="font-semibold mb-1">Kich hoat</h4>
            <p className="text-sm text-gray-500">Cho 1-2 phut de duyet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
