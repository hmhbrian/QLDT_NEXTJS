    This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
Add commentMore actions

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# 📚 Project Structure & Environment Guide

## 📁 Enterprise Project Structure

```
src/
├── lib/
│   ├── core/         # Base classes, abstract services, shared logic (BaseService, service-factory, ...)
│   ├── services/     # API services (REST/GraphQL, chia theo domain: users, courses, ...)
│   ├── types/        # Domain-specific types/interfaces (user.types.ts, course.types.ts, ...)
│   ├── utils/        # Utility functions, helpers, pure functions (form.utils.ts, string.utils.ts, ...)
│   ├── config/       # Configuration, env schema, API endpoints, constants
│   └── mock/         # Mock data for development/testing (users, courses, analytics, ...)
├── components/       # UI Components (atomic design: atoms, molecules, organisms, templates, pages)
├── hooks/            # Custom React hooks (useAuth, useCourses, useForm, ...)
└── stores/           # State management (Zustand, Redux, context, ...)
```

### **Mô tả nhanh từng thư mục:**

- **lib/core/**: Class nền tảng, service factory, base types dùng chung.
- **lib/services/**: Service gọi API, chia theo domain, chỉ xử lý logic giao tiếp backend.
- **lib/types/**: Định nghĩa type/interface cho từng domain, giúp type-safe toàn bộ codebase.
- **lib/utils/**: Hàm tiện ích thuần, helpers, validator, formatter, ...
- **lib/config/**: Cấu hình hệ thống: env schema, API endpoint, constants.
- **lib/mock/**: Dữ liệu giả lập cho dev/test/demo.
- **components/**: UI components theo atomic design, dễ tái sử dụng, test, mở rộng giao diện.
- **hooks/**: Custom React hooks cho logic dùng lại.
- **stores/**: Quản lý state toàn cục.

---

> **Lưu ý:**
>
> - Biến bắt buộc: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API_TIMEOUT`, `NEXT_PUBLIC_USE_API`, `NEXT_PUBLIC_APP_VERSION`.
> - Các biến endpoint, analytics, AI key là optional, chỉ cần nếu thực sự sử dụng.
> - Mọi biến đều được validate type-safe, nếu thiếu hoặc sai format sẽ báo lỗi rõ ràng khi khởi động app.
