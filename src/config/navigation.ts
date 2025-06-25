import type { NavItem } from "@/lib/types";
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
  // General items visible to all roles
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

  // Trainee-specific items
  {
    label: "Khóa học của tôi",
    href: "/trainee/my-courses",
    icon: GraduationCap,
    roles: ["HOCVIEN"],
  },

  // Management group for Admin and HR
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
  
  // Reports group for Admin and HR
  {
    label: "Báo cáo & Thống kê",
    icon: AreaChart,
    roles: ["ADMIN", "HR"],
    children: [
      {
        label: "Báo cáo Tổng quan",
        href: "/admin/reports/overview",
        icon: PieChart,
        roles: ["ADMIN"],
      },
      {
        label: "Tiến độ Học tập",
        href: "/hr/progress",
        icon: LineChart,
        roles: ["HR"],
      },
    ],
  },
  
  // Disabled item
  {
    label: "Kế hoạch Đào tạo",
    href: "/training-plans",
    icon: ClipboardList,
    roles: ["ADMIN", "HR"],
    disabled: true,
  },
];
