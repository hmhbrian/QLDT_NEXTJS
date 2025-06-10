
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { changePassword } = useAuth();

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oldPassword || !newPassword) {
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(oldPassword, newPassword);
      // Đặt lại form sau khi thay đổi thành công
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      // Lỗi đã được xử lý trong useAuth hook
      console.error('Lỗi khi lưu thay đổi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>
            Thay đổi mật khẩu của bạn. Mật khẩu mới phải có ít nhất 8 ký tự và bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveChanges} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
