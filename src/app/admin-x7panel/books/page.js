'use client';
import { useState, useEffect } from 'react';

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Văn học');
  const [isFeatured, setIsFeatured] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const categories = [
    'Văn học', 'Kinh tế', 'Khoa học', 'Tâm lý', 'Kỹ năng sống',
    'Lịch sử', 'Truyện', 'Giáo dục', 'Công nghệ', 'Sức khỏe'
  ];

  const fetchBooks = () => {
    setLoading(true);
    fetch('/api/admin/books')
      .then((r) => r.json())
      .then((data) => {
        setBooks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const openAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setDescription('');
    setCategory('Văn học');
    setIsFeatured(false);
    setPdfFile(null);
    setCoverFile(null);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setDescription(book.description || '');
    setCategory(book.category || 'Văn học');
    setIsFeatured(Boolean(book.is_featured));
    setPdfFile(null);
    setCoverFile(null);
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xoá cuốn sách này và toàn bộ file kèm theo?')) return;
    try {
      const res = await fetch(`/api/admin/books?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBooks();
      } else {
        alert('Không thể xoá sách');
      }
    } catch (e) {
      console.error(e);
      alert('Đã xảy ra lỗi khi xoá');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('isFeatured', isFeatured ? 'true' : 'false');
    if (coverFile) formData.append('cover', coverFile);

    try {
      if (editingBook) {
        formData.append('id', editingBook.id);
        const res = await fetch('/api/admin/books', {
          method: 'PUT',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại');
      } else {
        if (!pdfFile) {
          setError('Vui lòng chọn file PDF cho sách');
          setSaving(false);
          return;
        }
        formData.append('pdf', pdfFile);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload sách thất bại');
      }

      setShowModal(false);
      fetchBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản Lý Sách PDF</h1>
          <p className="text-slate-500 mt-1">Upload sách mới, quản lý ảnh bìa, file PDF và mô tả.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 self-start"
        >
          <span>➕</span> Thêm Sách Mới (PDF)
        </button>
      </div>

      {/* Book List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Đang tải danh sách sách...</div>
        ) : books.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <span className="text-4xl block mb-2">📚</span>
            Chưa có cuốn sách nào. Hãy nhấn &quot;Thêm Sách Mới&quot; để upload file PDF.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Bìa sách</th>
                  <th className="px-6 py-4">Tên sách & Tác giả</th>
                  <th className="px-6 py-4">Thể loại</th>
                  <th className="px-6 py-4">Số trang</th>
                  <th className="px-6 py-4">Nổi bật</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      {b.cover_image ? (
                        <img
                          src={`/api/files/${b.cover_image}`}
                          alt={b.title}
                          className="w-12 h-16 object-cover rounded-lg shadow-sm border"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs border">
                          No IMG
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 line-clamp-1">{b.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{b.author}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium">
                        {b.category || 'Chung'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {b.total_pages > 0 ? `${b.total_pages} trang` : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {b.is_featured ? (
                        <span className="text-amber-500 text-sm font-bold">★ Nổi bật</span>
                      ) : (
                        <span className="text-slate-400 text-xs">Thường</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(b)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium rounded-lg text-xs transition"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Book */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-slate-900">
                {editingBook ? 'Chỉnh Sửa Thông Tin Sách' : 'Thêm Sách Mới Vào Thư Viện'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tên sách *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="Ví dụ: Đắc Nhân Tâm, Nghĩ Giàu Làm Giàu..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tác giả *</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="input-field"
                    placeholder="Dale Carnegie"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Thể loại</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả tóm tắt sách</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  placeholder="Nội dung chính hoặc lời tựa cuốn sách..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Ảnh bìa (JPG, PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files[0] || null)}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>

                {!editingBook && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      File PDF sách *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      required
                      onChange={(e) => setPdfFile(e.target.files[0] || null)}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="featured" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Đánh dấu là sách nổi bật (hiển thị trang chủ)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm transition"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Đang lưu...' : editingBook ? 'Cập nhật' : 'Upload Sách'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
