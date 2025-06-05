import type { LucideIcon } from 'lucide-react';

export type Role = 'Admin' | 'HR' | 'Trainee';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  avatar?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
  subItems?: NavItem[];
  disabled?: boolean;
}
