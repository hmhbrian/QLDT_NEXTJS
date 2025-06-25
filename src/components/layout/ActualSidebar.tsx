
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInput,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/Logo';
import { navigationItems } from '@/config/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { NavItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChevronDown, Search } from 'lucide-react';

export function ActualSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const isGroupActive = useCallback((item: NavItem): boolean => {
    if (item.href && pathname.startsWith(item.href)) {
      return true;
    }
    return item.children?.some(child => child.href && pathname.startsWith(child.href)) ?? false;
  }, [pathname]);

  const filteredNavItems = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.trim().toLowerCase();
    if (!user) return [];

    const baseItems = navigationItems.filter(item => 
        item.roles.includes(user.role) && !item.disabled
    );

    if (!lowerCaseSearchTerm) {
        return baseItems;
    }

    return baseItems.reduce((acc, item) => {
        const doesParentMatch = item.label.toLowerCase().includes(lowerCaseSearchTerm);
        
        if (item.children) {
            const accessibleChildren = item.children.filter(child => 
                child.roles.includes(user.role) && !child.disabled
            );

            if (doesParentMatch) {
                acc.push({ ...item, children: accessibleChildren });
                return acc;
            }

            const matchingChildren = accessibleChildren.filter(child => 
                child.label.toLowerCase().includes(lowerCaseSearchTerm)
            );

            if (matchingChildren.length > 0) {
                acc.push({ ...item, children: matchingChildren });
            }
        } else if (doesParentMatch) {
            acc.push(item);
        }

        return acc;
    }, [] as NavItem[]);
  }, [searchTerm, user]);

  useEffect(() => {
    if (searchTerm.trim()) {
        const allGroupLabels = filteredNavItems
            .filter(item => item.children)
            .map(item => item.label);
        setOpenGroups(new Set(allGroupLabels));
    } else {
        const activeGroup = navigationItems.find(item => user && item.children && isGroupActive(item));
        const newGroups = new Set<string>();
        if (activeGroup) {
            newGroups.add(activeGroup.label);
        }
        setOpenGroups(newGroups);
    }
  }, [searchTerm, pathname, user, filteredNavItems, isGroupActive, navigationItems]);

  useEffect(() => {
    if (sidebarState === 'collapsed') {
      setOpenGroups(new Set());
      setSearchTerm('');
    }
  }, [sidebarState]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  if (!user) return null;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 flex flex-col gap-2">
        <Logo collapsed={sidebarState === 'collapsed'} />
        {sidebarState !== 'collapsed' && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground z-10" />
            <SidebarInput 
              placeholder="Tìm kiếm tính năng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredNavItems.map((item) => {
            const accessibleChildren = item.children?.filter(child => child.roles.includes(user.role) && !child.disabled);
            
            if (accessibleChildren && accessibleChildren.length > 0) {
              const isActive = isGroupActive(item);
              const isOpen = openGroups.has(item.label);

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    onClick={() => toggleGroup(item.label)}
                    isActive={isActive && !isOpen}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span className="group-data-[collapsible=icon]:sr-only">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180",
                        "group-data-[collapsible=icon]:hidden"
                      )}
                    />
                  </SidebarMenuButton>
                  {isOpen && sidebarState !== 'collapsed' && (
                    <SidebarMenuSub>
                      {accessibleChildren.map((child) => (
                        <SidebarMenuSubItem key={child.label}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={child.href ? pathname.startsWith(child.href) : false}
                          >
                            <Link href={child.href!}>
                              {child.label}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              );
            }

            if (item.href) {
              const isDashboard = item.href === '/dashboard';
              const isActive = isDashboard ? pathname === item.href : pathname.startsWith(item.href);
              
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span className="group-data-[collapsible=icon]:sr-only">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
            
            return null;
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2" />
    </Sidebar>
  );
}
