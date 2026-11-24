'use client';
import { useState, useEffect } from 'react';

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  const fetchSubs = () => {
    setLoading(true);
    fetch('/api/admin/subscriptions')
      .then((r) => r.json())
      .then((data) => {
        setSubs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const actionText = status === 'approved' ? 'DUYỆT và kích hoạt VIP' : 'TỪ CHỐI';
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} cho yêu cầu này?`)) return;

    setProcessingId(id);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Thất bại');
      fetchSubs();
    } catch (e) {
      alert(e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const planLabels = {
    '1month': '1 Tháng (30k)',
    '3months': '3 Tháng (70k)',
    '6months': '6 Tháng (150k)',
    '1year': '1 Năm (320k)',
  };

  const filteredSubs = subs.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Duyệt Đăng Ký VIP</h1>
          <p className="text-slate-500 mt-1">
            Kiểm tra thông tin chuyển khoản từ thành viên và cấp quyền đọc sách không giới hạn (1-2 phút).
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'pending', label: 'Chờ duyệt ⏳' },
            { id: 'approved', label: 'Đã duyệt ✅' },
            { id: 'rejected', label: 'Từ chối ❌' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Đang tải dữ liệu đăng ký...</div>
        ) : filteredSubs.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            Không có yêu cầu nào theo bộ lọc này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Thành viên</th>
                  <th className="px-6 py-4">Gói & Số tiền</th>
                  <th className="px-6 py-4">Thông tin CK (Form)</th>
                  <th className="px-6 py-4">Thời gian gửi</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Cấp quyền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{sub.user_name}</p>
                      <p className="text-xs text-slate-500">{sub.user_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{planLabels[sub.plan] || sub.plan}</p>
                      <p className="text-xs font-bold text-indigo-600">{sub.amount.toLocaleString()} VNĐ</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-0.5">
                        <p><span className="text-slate-400">Ngân hàng:</span> <strong>{sub.bank_name || 'N/A'}</strong></p>
                        <p><span className="text-slate-400">Chủ TK:</span> <strong>{sub.account_name || 'N/A'}</strong></p>
                        <p><span className="text-slate-400">Nội dung CK:</span> <span className="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded font-mono font-medium">{sub.transfer_content || 'N/A'}</span></p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(sub.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-full font-bold ${
                          sub.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sub.status === 'approved'
                          ? 'Đã duyệt (VIP)'
                          : sub.status === 'pending'
                          ? 'Đang chờ duyệt'
                          : 'Đã từ chối'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {sub.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={processingId === sub.id}
                            onClick={() => handleUpdateStatus(sub.id, 'approved')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-sm shadow-emerald-600/30 transition disabled:opacity-50"
                          >
                            ✓ Duyệt VIP
                          </button>
                          <button
                            disabled={processingId === sub.id}
                            onClick={() => handleUpdateStatus(sub.id, 'rejected')}
                            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-lg text-xs transition disabled:opacity-50"
                          >
                            ✕ Huỷ
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Hoàn tất</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
