import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
// Toaster component từ Shadcn được import trong ToastProvider
import { Inter, Poppins } from 'next/font/google';
import { ToastProvider } from '@/providers/toast-provider';
import { CustomThemeProvider } from '@/providers/theme-provider'; // Đã đổi tên import

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
});

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
      </head>
      <body className={`${inter.className} ${poppins.variable}`}>
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

