import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/Logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Đăng nhập | BECAMEX IDC',
  description: 'Đăng nhập vào hệ thống quản lý đào tạo BECAMEX IDC',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Logo />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Chào mừng trở lại</CardTitle>
          <CardDescription>Đăng nhập để truy cập tài khoản BECAMEX của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Becamex IDC. Bản quyền đã được bảo hộ.
      </p>
    </div>
  );
}
