"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

interface Permission {
  id: string;
  name: string;
  description: string;
  roles: {
    ADMIN: boolean;
    HR: boolean;
    HOCVIEN: boolean;
  };
}

export default function PermissionsPage() {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "1",
      name: "Quản lý người dùng",
      description: "Tạo, chỉnh sửa và xóa tài khoản người dùng",
      roles: { ADMIN: true, HR: true, HOCVIEN: false },
    },
    {
      id: "2",
      name: "Quản lý khóa học",
      description: "Tạo, chỉnh sửa và xóa khóa học",
      roles: { ADMIN: true, HR: true, HOCVIEN: false },
    },
    {
      id: "3",
      name: "Quản lý phòng ban",
      description: "Tạo, chỉnh sửa và xóa phòng ban",
      roles: { ADMIN: true, HR: false, HOCVIEN: false },
    },
    {
      id: "4",
      name: "Xem báo cáo",
      description: "Xem các báo cáo và thống kê",
      roles: { ADMIN: true, HR: true, HOCVIEN: false },
    },
  ]);

  const handlePermissionChange = (
    permissionId: string,
    role: keyof Permission["roles"],
    value: boolean
  ) => {
    setPermissions(
      permissions.map((permission) => {
        if (permission.id === permissionId) {
          return {
            ...permission,
            roles: {
              ...permission.roles,
              [role]: value,
            },
          };
        }
        return permission;
      })
    );
  };

  const handleSave = () => {
    // TODO: Triển khai lưu quyền
    toast({
      title: "Phân quyền đã được lưu",
      description: "Các thay đổi của bạn đã được áp dụng thành công.",
      variant: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Phân quyền</h1>
        <p className="text-muted-foreground">
          Quản lý quyền truy cập cho từng vai trò trong hệ thống
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ma trận phân quyền</CardTitle>
          <CardDescription>
            Cấu hình quyền truy cập cho từng chức năng theo vai trò
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Chức năng</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="w-[100px]">Admin</TableHead>
                  <TableHead className="w-[100px]">HR</TableHead>
                  <TableHead className="w-[100px]">Trainee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {permission.name}
                    </TableCell>
                    <TableCell>{permission.description}</TableCell>
                    <TableCell>
                      <Switch
                        checked={permission.roles.ADMIN}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(permission.id, "ADMIN", checked)
                        }
                        disabled={permission.id === "1"} // Không cho phép tắt quyền admin cho chức năng quản lý user
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={permission.roles.HR}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(permission.id, "HR", checked)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={permission.roles.HOCVIEN}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(
                            permission.id,
                            "HOCVIEN",
                            checked
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave}>Lưu thay đổi</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
