import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
// Chỉ sử dụng Inter font
import { Inter } from "next/font/google";
import { ToastProvider } from "@/providers/toast-provider";
import { CustomThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthWrapper } from "@/components/auth/AuthWrapper";

// Import cookie security monitor (chỉ chạy trong development)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  import("@/lib/security/cookie-monitor");
}

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BECAMEX - Hệ thống Quản lý Đào tạo",
  description: "Hệ thống Quản lý Đào tạo Toàn diện cho BECAMEX",
  icons: {
    icon: [
      {
        url: "/B.svg",
        sizes: "any",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head></head>
      <body className={inter.className}>
        <CustomThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <AuthWrapper>
                <ToastProvider>{children}</ToastProvider>
              </AuthWrapper>
            </AuthProvider>
          </QueryProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}
