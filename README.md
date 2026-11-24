# 📚 BookShelf - Nền Tảng Đọc Sách PDF Có Phân Quyền Thành Viên

Dự án website đọc sách PDF chuyên nghiệp được xây dựng bằng **Next.js 14**, **SQLite (better-sqlite3)**, **NextAuth**, và **Tailwind CSS**.

---

## 🔐 1. THÔNG TIN ĐĂNG NHẬP & LINK TRANG QUẢN TRỊ (ADMIN)

Theo yêu cầu của bạn, **giao diện Admin được giấu kín hoàn toàn khỏi menu của trang web chính** để người dùng không nhìn thấy:

- **Đường dẫn bí mật vào Admin:** `http://localhost:3000/admin-x7panel`
- **Email quản trị viên:** `admin@bookshelf.vn`
- **Mật khẩu quản trị viên:** `Admin@Bookshelf2024!`

*(Sau khi đăng nhập tài khoản này tại `/login`, truy cập vào đường link `/admin-x7panel` để quản trị).*

---

## 🌟 2. CÁC TÍNH NĂNG ĐÃ TRIỂN KHAI

### A. Khách & Thành viên thường (Miễn phí)
- **Đọc sách thử 3 trang:** Thành viên chưa đăng ký hoặc chưa nâng cấp VIP chỉ đọc được đúng 3 trang đầu tiên của bất kỳ cuốn sách nào.
- **Hạn chế thông minh:** Từ trang 4 trở đi, hệ thống sẽ hiện thông báo nâng cấp và chặn tải nội dung từ phía backend server để bảo mật bản quyền.
- **Tự đăng ký tài khoản:** Đăng ký bằng Email & Mật khẩu hoặc Đăng nhập qua tài khoản Google.

### B. Các gói đăng ký VIP (Đúng theo yêu cầu)
- **Gói 1 tháng:** 30.000 VNĐ
- **Gói 3 tháng:** 70.000 VNĐ (Tiết kiệm 22%)
- **Gói 6 tháng:** 150.000 VNĐ
- **Gói 1 năm:** 320.000 VNĐ

### C. Quy trình chuyển khoản & Cấp quyền
1. Thành viên vào trang **Bảng giá** (`/pricing`) -> Chọn gói cần mua.
2. Hệ thống chuyển sang trang **Thanh toán** (`/payment?plan=...`) hiển thị số tài khoản ngân hàng, tên chủ tài khoản, số tiền và cú pháp chuyển khoản.
3. Người dùng chuyển khoản và điền form xác nhận (Tên ngân hàng, Chủ tài khoản, Nội dung CK).
4. Hệ thống ghi nhận trạng thái **Chờ duyệt (1-2 phút)**.
5. **Admin vào link kín `/admin-x7panel/subscriptions` bấm nút "✓ Duyệt VIP":**
   - Hệ thống tự động tính ngày hết hạn dựa theo gói (30 ngày, 90 ngày, 180 ngày hoặc 365 ngày).
   - Nếu người dùng đang còn hạn VIP, hệ thống sẽ tự động cộng dồn thêm số ngày vào hạn cũ.
   - Tài khoản người dùng được mở khoá đọc không giới hạn toàn bộ trang sách ngay lập tức.

### D. Trang Quản trị riêng biệt (`/admin-x7panel`)
- **Tổng quan (Dashboard):** Xem thống kê tổng số sách, số thành viên, số thành viên VIP, doanh thu tích luỹ và các yêu cầu đang chờ duyệt.
- **Quản lý Sách (`/admin-x7panel/books`):**
  - Upload file PDF trực tiếp từ máy tính.
  - Tự động đọc và đếm tổng số trang của file PDF bằng thư viện `pdf-lib`.
  - Upload ảnh bìa sách (Cover image).
  - Điền tên tác giả, thể loại, tóm tắt và đánh dấu sách nổi bật trang chủ.
  - Chỉnh sửa hoặc xoá sách kèm file gốc.
- **Duyệt Đăng Ký VIP (`/admin-x7panel/subscriptions`):**
  - Bảng danh sách yêu cầu chuyển khoản với đầy đủ thông tin: tên thành viên, email, số tiền, ngân hàng gửi, nội dung CK.
  - Thao tác 1-click: **Duyệt VIP** hoặc **Huỷ**.
- **Quản lý Thành viên (`/admin-x7panel/users`):**
  - Xem danh sách thành viên và hạn sử dụng VIP.
  - Admin có thể cấp quyền hoặc gia hạn ngày VIP thủ công cho bất kỳ người dùng nào mà không cần qua chuyển khoản.

---

## 🚀 3. HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY WEB

Mở terminal tại thư mục dự án:
```powershell
cd "C:\Users\Hiep Phuong\.gemini\antigravity\scratch\book-reader"
```

1. **Cài đặt các thư viện cần thiết:**
   ```powershell
   npm install
   ```

2. **Chạy script tạo sẵn sách mẫu (10 trang):**
   ```powershell
   node scripts/seed.js
   ```

3. **Chạy server phát triển (Development):**
   ```powershell
   npm run dev
   ```
   Web sẽ chạy tại: `http://localhost:3000`

---

## ⚙️ 4. CẤU HÌNH GOOGLE LOGIN (TUỲ CHỌN)
Nếu bạn muốn bật nút đăng nhập qua Google:
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Tạo OAuth Client ID với Redirect URI: `http://localhost:3000/api/auth/callback/google`.
3. Mở file `.env.local` và điền:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```
*(Nếu chưa cấu hình Google, bạn vẫn có thể đăng ký tài khoản qua Email và đăng nhập bình thường).*
