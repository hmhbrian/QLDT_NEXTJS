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
} from "lucide-react";

export const navigationItems: NavItem[] = [
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
  {
    label: "Quản lý khóa học",
    href: "/admin/courses",
    icon: GraduationCap,
    roles: ["ADMIN", "HR"],
  },
  {
    label: "Khóa học của tôi",
    href: "/trainee/my-courses",
    icon: BookOpen,
    roles: ["HOCVIEN"],
  },
  {
    label: "Báo cáo Tổng quan",
    href: "/admin/reports/overview", // This now includes evaluation details
    icon: AreaChart,
    roles: ["ADMIN"],
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
  {
    label: "Quản lý Học viên",
    href: "/hr/trainees",
    icon: UserCheck,
    roles: ["HR"],
  },
  {
    label: "Tiến độ Học tập",
    href: "/hr/progress",
    icon: LineChart,
    roles: ["HR"],
  },
  {
    label: "Kế hoạch Đào tạo",
    href: "/training-plans",
    icon: ClipboardList,
    roles: ["ADMIN", "HR"],
    disabled: true,
  },
];
