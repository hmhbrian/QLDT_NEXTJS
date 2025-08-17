import type { NavItem } from "@/lib/types/ui.types";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  UserCheck,
  GraduationCap,
  LineChart,
  Building2,
  AreaChart,
  Settings,
  PieChart,
} from "lucide-react";

export const navigationItems: NavItem[] = [
  // Các mục chung hiển thị cho tất cả vai trò
  {
    label: "Bảng điều khiển",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "HR", "HOCVIEN"],
  },
  {
    label: "Khóa học công khai",
    href: "/courses",
    icon: BookOpen,
    roles: ["ADMIN", "HR", "HOCVIEN"],
  },

  // Các mục dành riêng cho học viên
  {
    label: "Khóa học của tôi",
    href: "/trainee/my-courses",
    icon: GraduationCap,
    roles: ["HOCVIEN"],
  },

  // Nhóm quản lý cho Admin và HR
  {
    label: "Quản lý",
    icon: Settings,
    roles: ["ADMIN", "HR"],
    children: [
      {
        label: "Quản lý khóa học",
        href: "/admin/courses",
        icon: GraduationCap,
        roles: ["ADMIN", "HR"],
      },
      {
        label: "Quản lý Học viên",
        href: "/hr/trainees",
        icon: UserCheck,
        roles: ["HR"],
      },
      {
        label: "Quản lý Người dùng",
        href: "/admin/users",
        icon: Users,
        roles: ["ADMIN"],
      },
      {
        label: "Quản lý Phòng ban",
        href: "/admin/departments",
        icon: Building2,
        roles: ["ADMIN"],
      },
    ],
  },

  // Nhóm báo cáo cho Admin và HR
  {
    label: "Báo cáo & Thống kê",
    icon: AreaChart,
    roles: ["ADMIN", "HR"],
    children: [
      {
        label: "Báo cáo Tổng quan",
        href: "/admin/reports/overview",
        icon: PieChart,
        roles: ["ADMIN", "HR"], // Admin và HR đều có thể truy cập
      },
      {
        label: "Tiến độ Học tập",
        href: "/hr/progress",
        icon: LineChart,
        roles: ["ADMIN", "HR"], // Admin và HR đều có thể truy cập
      },
    ],
  },

  // Mục bị vô hiệu hóa
  {
    label: "Kế hoạch Đào tạo",
    href: "/training-plans",
    icon: ClipboardList,
    roles: ["ADMIN", "HR"],
    disabled: true,
  },
];
