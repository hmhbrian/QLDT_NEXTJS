# 🎓 BECAMEX IDC - HỆ THỐNG QUẢN LÝ ĐÀO TẠO

**Enterprise Training Management System** – Hệ thống quản lý đào tạo nội bộ được xây dựng theo mô hình **Full-stack**, gồm:

- **Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend:** ASP.NET Core 8, Entity Framework Core, SQL Server
- **Tích hợp:** JWT Auth, Quartz Scheduler, Firebase Cloud Messaging (FCM), Cloudinary

---

## 🧠 BACKEND – ASP.NET CORE 8 API

### 🎯 Công Nghệ Chính

- ASP.NET Core 8
- Entity Framework Core (SQL Server)
- JWT Authentication
- Cloudinary (Lưu trữ ảnh)
- Firebase Cloud Messaging (Thông báo đẩy)
- Quartz.NET (Lên lịch gửi thông báo tự động)

### 🎯 Điều Kiện Bắt Buộc

1. ✅ **.NET SDK ≥ 8.0**

   ```bash
   dotnet --version
   ```

2. ✅ SQL Server đang hoạt động

3. ✅ File appsettings.json hợp lệ

4. ✅ Tạo file Firebase riêng

## 🚀 Cách Chạy Dự Án

### Bước 1: Cài đặt dependencies

    ```bash
    dotnet restore
    ```

### Bước 2: Cấu Hình Database

```bash
"ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=QLDT;Trusted_Connection=True;Trust Server Certificate=True"
    }
```

### Bước 3: Cấu Hình Cloudinary & FCM

Trong appsettings.json:

```bash
    "CloudinarySettings": {
        "CloudName": "<<<YOUR_CLOUD_NAME>>>",
        "ApiKey": "<<<YOUR_API_KEY>>>",
        "ApiSecret": "<<<YOUR_API_SECRET>>>"
    },
    "Fcm": {
        "CredentialsPath": "secrets/firebase-service-account.json"
    }

```

Đặt file `firebase-service-account.json` vào thư mục:

```bash
QLDT_BECAMEX_BE/secrets/firebase-service-account.json
```

### Bước 4: Tạo Database

```bash
dotnet ef database update
```

### Bước 5: Chạy Backend

```bash
dotnet run
```

- URL mặc định: `http://localhost:5228`
- Swagger UI: `http://localhost:5228/swagger`

---

## 🧠 FRONTEND – NEXT.JS 15, React 18, TypeScript

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

## 🔐 Environment Variables

### Biến Bắt Buộc:

- `NEXT_PUBLIC_API_URL` - URL của backend API
- `NEXT_PUBLIC_API_TIMEOUT` - Timeout cho API calls (ms)
- `NEXT_PUBLIC_USE_API` - Bật/tắt API calls (true/false)
- `NEXT_PUBLIC_APP_VERSION` - Phiên bản ứng dụng

> **Lưu ý:** Mọi biến đều được validate type-safe, nếu thiếu hoặc sai format sẽ báo lỗi rõ ràng khi khởi động app.

--

# 🧪 TÀI KHOẢN TEST ỨNG DỤNG

| Role            | Email đăng nhập         | Mật khẩu | Ghi chú                                                                                 |
| --------------- | ----------------------- | -------- | --------------------------------------------------------------------------------------- |
| 👑 **Admin**    | `admin@becamex.com`     | `123456` | Quản trị toàn hệ thống (quản lý phòng ban, quản lý khóa học, người dùng, v.v.)          |
| 🧑‍💼 **HR**       | `hmh@becamex.com`       | `123456` | Quản lý học viên, khóa đào tạo, xem báo cáo                                             |
| 🧑‍💼 **HR**       | `yentn@becamex.com`     | `123456` | Quản lý học viên, khóa đào tạo, xem báo cáo                                             |
| 🎓 **Học viên** | `daott@becamex.com`     | `123456` | Xem và đăng ký khóa học,xem bài học, làm bài kiểm tra, đánh giá, nhận thông báo(mobile) |
| 🎓 **Học viên** | `trainn246@becamex.com` | `123456` | Xem và đăng ký khóa học,xem bài học, làm bài kiểm tra, đánh giá, nhận thông báo(mobile) |

---

# 🔔 KỊCH BẢN THÔNG BÁO (FCM + Quartz)

Hệ thống sử dụng **Firebase Cloud Messaging (FCM)** kết hợp **Quartz.NET Scheduler**  
để tự động gửi thông báo đến học viên và nhân sự theo các tình huống cụ thể.

| #   | Kịch bản                             | Thời điểm gửi                                            | Đối tượng nhận                            | Mục tiêu                                  | Điều hướng khi bấm thông báo |
| --- | ------------------------------------ | -------------------------------------------------------- | ----------------------------------------- | ----------------------------------------- | ---------------------------- |
| 1️⃣  | **Nhắc nhở sắp diễn ra khóa học**    | 1–2 ngày trước khi khóa học bắt đầu                      | Học viên đã đăng ký                       | Nhắc học viên chuẩn bị tham gia           | 👉 Trang chi tiết khóa học   |
| 2️⃣  | **Nhắc nhở sắp kết thúc khóa học**   | 1–2 ngày trước khi khóa học kết thúc                     | Học viên đang tham gia                    | Khuyến khích học viên hoàn thành khóa học | 👉 Trang chi tiết khóa học   |
| 3️⃣  | **Khóa học mới được tạo bởi HR**     | Ngay khi HR tạo khóa học                                 | Học viên thuộc phòng ban & cấp độ phù hợp | Thông báo khóa học mới phù hợp            | 👉 Trang chi tiết khóa học   |
| 4️⃣  | **HR thêm học viên vào khóa học**    | Ngay sau khi HR thêm vào danh sách học viên              | Học viên được thêm                        | Xác nhận học viên đã được ghi danh        | 👉 Trang chi tiết khóa học   |
| 5️⃣  | **Nhắc đánh giá sau khi hoàn thành** | Sau khi học viên hoàn thành khóa học (nếu chưa đánh giá) | Học viên hoàn thành                       | Khuyến khích đánh giá khóa học            | 👉 Trang chi tiết khóa học   |
| 6️⃣  | **Chúc mừng hoàn thành khóa học**    | Ngay khi học viên hoàn thành và có chứng nhận            | Học viên hoàn thành                       | Gửi lời chúc mừng & liên kết chứng chỉ    | 👉 Danh sách chứng chỉ       |

---
