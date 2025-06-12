'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/Logo';
import { navigationItems } from '@/config/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { NavItem } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ActualSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar(); // Get sidebar state (expanded/collapsed)

  const isMenuItemActive = (item: NavItem) => {
    if (item.href === '/dashboard') return pathname === item.href; // Exact match for dashboard
    return pathname.startsWith(item.href) && item.href !== '/';
  };

  if (!user) return null;

  const accessibleNavItems = navigationItems.filter(item => 
    item.roles.includes(user.role) && !item.disabled
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Logo collapsed={sidebarState === 'collapsed'} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {accessibleNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={isMenuItemActive(item)}
                tooltip={item.label}
                className={cn(
                  "justify-start",
                  sidebarState === 'collapsed' && "justify-center"
                )}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span className={cn(sidebarState === 'collapsed' && "sr-only")}>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        {/* Placeholder for user profile quick access or settings, for now empty or simple logout */}
      </SidebarFooter>
    </Sidebar>
  );
}
