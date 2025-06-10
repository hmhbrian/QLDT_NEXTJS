
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
// Toaster component từ Shadcn được import trong ToastProvider
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/providers/toast-provider';
import { CustomThemeProvider } from '@/providers/theme-provider'; // Đã đổi tên import

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BECAMEX - Hệ thống Quản lý Đào tạo',
  description: 'Hệ thống Quản lý Đào tạo Toàn diện cho BECAMEX',
  icons: {
    icon: [
      {
        url: '/B.svg',
        sizes: 'any',
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <CustomThemeProvider // Đã đổi thành CustomThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}

