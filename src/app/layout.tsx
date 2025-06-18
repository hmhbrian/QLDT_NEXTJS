import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
// Chỉ sử dụng Inter font
import { Inter } from "next/font/google";
import { ToastProvider } from "@/providers/toast-provider";
import { CustomThemeProvider } from "@/providers/theme-provider";
import { LoadingProvider } from "@/providers/loading-provider";

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
          <AuthProvider>
            <LoadingProvider>
              <ToastProvider>{children}</ToastProvider>
            </LoadingProvider>
          </AuthProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}
