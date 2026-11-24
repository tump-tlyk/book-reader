'use client';
import { useState, useEffect } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [plan, setPlan] = useState('1month');
  const [customDays, setCustomDays] = useState(30);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleGrantVip = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Number(customDays));

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          subscription_plan: plan,
          subscription_end: endDate.toISOString(),
        }),
      });

      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      } else {
        alert('Cập nhật quyền thất bại');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi');
    }
  };

  const handleRevokeVip = async (user) => {
    if (!confirm(`Bạn có chắc muốn huỷ quyền VIP của ${user.name}?`)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          subscription_plan: null,
          subscription_end: null,
        }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản Lý Thành Viên</h1>
        <p className="text-slate-500 mt-1">
          Theo dõi danh sách người dùng, cấp hoặc thu hồi quyền đọc không giới hạn trực tiếp.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Đang tải danh sách thành viên...</div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-slate-400">Chưa có thành viên nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Họ tên & Email</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Gói VIP</th>
                  <th className="px-6 py-4">Hạn VIP</th>
                  <th className="px-6 py-4">Ngày đăng ký</th>
                  <th className="px-6 py-4 text-right">Cấp quyền thủ công</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isVip = u.subscription_end && new Date(u.subscription_end) > new Date();
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {u.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isVip ? (
                          <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
                            {u.subscription_plan || 'VIP'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Miễn phí (3 trang)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {isVip ? (
                          <span className="text-emerald-700 font-bold">
                            {new Date(u.subscription_end).toLocaleDateString('vi-VN')}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(u.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {u.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setCustomDays(30);
                              }}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition"
                            >
                              ⚙ Cấp / Gia hạn VIP
                            </button>
                            {isVip && (
                              <button
                                onClick={() => handleRevokeVip(u)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-lg text-xs transition"
                              >
                                Huỷ VIP
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Grant VIP */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                Cấp quyền VIP cho: {editingUser.name}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleGrantVip} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Chọn gói VIP
                </label>
                <select
                  value={plan}
                  onChange={(e) => {
                    setPlan(e.target.value);
                    const days = { '1month': 30, '3months': 90, '6months': 180, '1year': 365 };
                    setCustomDays(days[e.target.value] || 30);
                  }}
                  className="input-field"
                >
                  <option value="1month">1 Tháng (30 ngày)</option>
                  <option value="3months">3 Tháng (90 ngày)</option>
                  <option value="6months">6 Tháng (180 ngày)</option>
                  <option value="1year">1 Năm (365 ngày)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Số ngày hiệu lực
                </label>
                <input
                  type="number"
                  min="1"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button type="submit" className="btn-primary text-sm">
                  Xác nhận cấp VIP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
