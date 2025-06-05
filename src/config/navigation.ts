
import type { NavItem } from '@/lib/types';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  ClipboardList,
  UserCheck,
  GraduationCap,
  CalendarDays,
  LineChart,
} from 'lucide-react';

export const navigationItems: NavItem[] = [
  {
    label: 'Bảng điều khiển',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['Admin', 'HR', 'Trainee'],
  },
  {
    label: 'Khóa học',
    href: '/courses',
    icon: BookOpen,
    roles: ['Admin', 'HR', 'Trainee'],
  },
  {
    label: 'Khóa học của tôi',
    href: '/trainee/my-courses',
    icon: GraduationCap,
    roles: ['Trainee'],
  },
  {
    label: 'Lập lịch học',
    href: '/classes',
    icon: CalendarDays,
    roles: ['Admin', 'HR'],
  },
  {
    label: 'Quản lý Người dùng',
    href: '/admin/users',
    icon: Users,
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
  {
    label: 'Cài đặt Hệ thống',
    href: '/admin/settings',
    icon: Settings,
    roles: ['Admin'],
    disabled: true,
  },
];

