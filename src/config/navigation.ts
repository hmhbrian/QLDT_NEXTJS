import type { NavItem } from '@/lib/types';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  UserCheck,
  GraduationCap,
  MessageCircle,
  LineChart,
  Building2,
  UserCircle,
  AreaChart,
  // ClipboardCheck, // Removed as it's merged
} from 'lucide-react';

export const navigationItems: NavItem[] = [
  {
    label: 'Bảng điều khiển',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['Admin', 'HR', 'Trainee'],
  },
  {
    label: 'Khóa học công khai',
    href: '/courses',
    icon: BookOpen,
    roles: ['Admin', 'HR', 'Trainee'],
  },
  {
    label: 'Quản lý khóa học',
    href: '/admin/courses',
    icon: GraduationCap,
    roles: ['Admin', 'HR'],
  },
  {
    label: 'Khóa học của tôi',
    href: '/trainee/my-courses',
    icon: BookOpen,
    roles: ['Trainee'],
  },
  {
    label: 'Báo cáo Tổng quan',
    href: '/admin/reports/overview', // This now includes evaluation details
    icon: AreaChart,
    roles: ['Admin'],
  },
  // { // Removed this entry as it's merged into Overview Report
  //   label: 'Báo cáo Đánh giá',
  //   href: '/admin/reports/evaluations',
  //   icon: ClipboardCheck,
  //   roles: ['Admin'], 
  // },
  {
    label: 'Quản lý Người dùng',
    href: '/admin/users',
    icon: Users,
    roles: ['Admin'],
  },
  {
    label: 'Quản lý Phòng ban',
    href: '/admin/departments',
    icon: Building2,
    roles: ['Admin'],
  },
  {
    label: 'Quản lý Học viên',
    href: '/hr/trainees',
    icon: UserCheck,
    roles: ['HR'],
  },
  {
    label: 'Tiến độ Học tập',
    href: '/hr/progress',
    icon: LineChart,
    roles: ['HR'],
  },
  {
    label: 'Kế hoạch Đào tạo',
    href: '/training-plans',
    icon: ClipboardList,
    roles: ['Admin', 'HR'],
    disabled: true,
  },
];

