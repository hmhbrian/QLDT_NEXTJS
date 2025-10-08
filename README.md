    # 🎓 BECAMEX IDC - Hệ Thống Quản Lý Đào Tạo

Enterprise Training Management System được xây dựng với Next.js 15, React 18, TypeScript, và Tailwind CSS.

---

## ⚠️ LƯU Ý QUAN TRỌNG KHI CHẠY DỰ ÁN

### 🎯 Điều Kiện Bắt Buộc

1. ✅ **Node.js >= 18.17.0** đã cài đặt

   ```bash
   node --version  # Kiểm tra version
   ```

2. ✅ **Backend API Server PHẢI CHẠY TRƯỚC!**

   - URL mặc định: `http://localhost:5228/api`
   - Kiểm tra: Mở browser → `http://localhost:5228/api`
   - ⚠️ **NẾU BACKEND CHƯA CHẠY → FRONTEND SẼ BÁO LỗI NETWORK ERROR!**

3. ✅ **File `.env` phải tồn tại và có đủ biến bắt buộc**

   ```bash
   # Tạo từ template (chỉ làm 1 lần)
   Copy-Item .env.example .env  # Windows
   cp .env.example .env         # Linux/Mac
   ```

4. ✅ **Dependencies đã cài đặt**
   ```bash
   npm install
   ```

---

## 🚀 Cách Chạy Dự Án

### Bước 1: Cài đặt dependencies

```bash
npm install
```

### Bước 2: Tạo file `.env`

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

### Bước 3: Cấu hình file `.env`

**Các biến BẮT BUỘC:**

```env
# API Configuration (BẮT BUỘC)
NEXT_PUBLIC_API_URL=http://localhost:5228/api    # URL của backend
NEXT_PUBLIC_USE_API=true                          # true = API thật, false = mock data
NEXT_PUBLIC_API_TIMEOUT=30000                      # Timeout (milliseconds)

# App Settings (BẮT BUỘC)
NEXT_PUBLIC_APP_VERSION=1.0.0                     # Version app
NEXT_PUBLIC_APP_NAME=BECAMEX IDC                  # Tên app (tùy chọn)

```

### Bước 4: ⚠️ **CHẠY BACKEND API** (BẮT BUỘC!)

Backend phải chạy trước khi chạy frontend. Đảm bảo backend đang chạy trên:

```
http://localhost:5228/api
```

### Bước 5: Chạy development server

```bash
npm run dev
```

### Bước 6: Mở trình duyệt

Truy cập: **http://localhost:3000**

---

## 🔧 Commands

```bash
# Development
npm run dev              # Chạy dev server (http://localhost:3000)
npm run build            # Build cho production
npm run start            # Chạy production build

# Code Quality
npm run lint             # Kiểm tra lỗi ESLint
npm run typecheck        # Kiểm tra lỗi TypeScript

```

---

## ❌ Lỗi Thường Gặp & Cách Fix

### 1. "Environment validation failed"

**Nguyên nhân:** Thiếu biến môi trường trong `.env`

**Cách fix:**

```bash
# Kiểm tra file .env đã tồn tại chưa
ls .env  # hoặc dir .env (Windows)

# Nếu chưa có, tạo từ template
Copy-Item .env.example .env
```

### 2. "Network Error" / "API timeout"

**Nguyên nhân:** Backend API chưa chạy hoặc sai URL

**Cách fix:**

1. Đảm bảo backend đang chạy: `http://localhost:5228/api`
2. Kiểm tra `NEXT_PUBLIC_API_URL` trong file `.env`
3. Test backend qua browser hoặc curl:
   ```bash
   curl http://localhost:5228/api
   ```

### 3. "Port 3000 already in use"

**Nguyên nhân:** Port 3000 đã được app khác sử dụng

**Cách fix:**

```bash
# Option 1: Dùng port khác
$env:PORT=3001; npm run dev  # Windows PowerShell
PORT=3001 npm run dev        # Linux/Mac

# Option 2: Kill process đang dùng port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 4. "Module not found"

**Nguyên nhân:** Dependencies chưa cài hoặc bị lỗi

**Cách fix:**

```bash
# Xóa node_modules và cài lại
Remove-Item -Recurse -Force node_modules  # Windows
rm -rf node_modules                        # Linux/Mac
npm install
```

---

## ✅ Checklist Trước Khi Chạy

- [ ] Node.js >= 18.17.0 đã cài đặt
- [ ] Đã chạy `npm install` thành công
- [ ] File `.env` đã tồn tại (copy từ `.env.example`)
- [ ] Đã điền đầy đủ các biến BẮT BUỘC trong `.env`
- [ ] **Backend API đang chạy** trên `http://localhost:5228/api`
- [ ] Đã test backend qua browser/Postman
- [ ] Port 3000 không bị chiếm

---

---

---

## 🔐 Environment Variables

### Biến Bắt Buộc:

- `NEXT_PUBLIC_API_URL` - URL của backend API
- `NEXT_PUBLIC_API_TIMEOUT` - Timeout cho API calls (ms)
- `NEXT_PUBLIC_USE_API` - Bật/tắt API calls (true/false)
- `NEXT_PUBLIC_APP_VERSION` - Phiên bản ứng dụng

> **Lưu ý:** Mọi biến đều được validate type-safe, nếu thiếu hoặc sai format sẽ báo lỗi rõ ràng khi khởi động app.
