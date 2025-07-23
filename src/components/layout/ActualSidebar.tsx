
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInput,
  HoverPopover,
  HoverPopoverTrigger,
  HoverPopoverContent,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { navigationItems } from "@/config/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { NavItem } from "@/lib/types/ui.types";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";

export function ActualSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const isGroupActive = useCallback(
    (item: NavItem): boolean => {
      if (item.href && pathname.startsWith(item.href)) {
        return true;
      }
      return (
        item.children?.some(
          (child) => child.href && pathname.startsWith(child.href)
        ) ?? false
      );
    },
    [pathname]
  );

  const filteredNavItems = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.trim().toLowerCase();
    if (!user) return [];

    const baseItems = navigationItems.filter(
      (item) => item.roles.includes(user.role) && !item.disabled
    );

    if (!lowerCaseSearchTerm) {
      return baseItems;
    }

    return baseItems.reduce((acc, item) => {
      const doesParentMatch = item.label
        .toLowerCase()
        .includes(lowerCaseSearchTerm);

      if (item.children) {
        const accessibleChildren = item.children.filter(
          (child) => child.roles.includes(user.role) && !child.disabled
        );

        if (doesParentMatch) {
          acc.push({ ...item, children: accessibleChildren });
          return acc;
        }

        const matchingChildren = accessibleChildren.filter((child) =>
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
        .filter((item) => item.children)
        .map((item) => item.label);
      setOpenGroups(new Set(allGroupLabels));
    } else {
      const activeGroup = navigationItems.find(
        (item) => user && item.children && isGroupActive(item)
      );
      const newGroups = new Set<string>();
      if (activeGroup) {
        newGroups.add(activeGroup.label);
      }
      setOpenGroups(newGroups);
    }
  }, [searchTerm, pathname, user, filteredNavItems, isGroupActive]);

  useEffect(() => {
    if (sidebarState === "collapsed") {
      setOpenGroups(new Set());
      setSearchTerm("");
    }
  }, [sidebarState]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
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
    <Sidebar className="sidebar-enhanced">
      <SidebarHeader className="border-b border-sidebar-border/50 bg-gradient-to-b from-sidebar-background to-sidebar-background/95">
        <Logo collapsed={sidebarState === "collapsed"} />
        {sidebarState !== "collapsed" && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 z-10 transition-colors duration-200" />
            <SidebarInput
              placeholder="Tìm kiếm chức năng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 text-slate-200 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:text-slate-100 dark:focus:text-slate-200 bg-sidebar-accent/30 border-sidebar-border/50 focus:border-primary/50 transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
              >
                ×
              </button>
            )}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu className="gap-2">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            }
          >
            {filteredNavItems.map((item) => {
              const accessibleChildren = item.children?.filter(
                (child) => child.roles.includes(user.role) && !child.disabled
              );

              const isActive = isGroupActive(item);
              const isOpen = openGroups.has(item.label);

              // Render item with children (as a group)
              if (accessibleChildren && accessibleChildren.length > 0) {
                return (
                  <HoverPopover key={item.label}>
                    <SidebarMenuItem className="sidebar-menu-item">
                      <HoverPopoverTrigger asChild>
                        <SidebarMenuButton
                          onClick={() =>
                            sidebarState === "expanded" &&
                            toggleGroup(item.label)
                          }
                          isActive={isActive && !isOpen}
                          tooltip={
                            sidebarState === "collapsed"
                              ? undefined
                              : item.label
                          }
                          className={cn(
                            "transition-all duration-300 ease-in-out",
                            isActive &&
                              !isOpen &&
                              "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-l-2 border-primary shadow-lg",
                            isOpen && "bg-accent/50 shadow-md"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "transition-all duration-300 ease-in-out",
                              isActive && "text-primary drop-shadow-sm",
                              isOpen && "rotate-3"
                            )}
                          />
                          <span className="group-data-[collapsible=icon]:sr-only font-medium">
                            {item.label}
                          </span>
                          {sidebarState === "expanded" && (
                            <ChevronDown
                              className={cn(
                                "ml-auto h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out",
                                isOpen && "rotate-180"
                              )}
                            />
                          )}
                        </SidebarMenuButton>
                      </HoverPopoverTrigger>

                      {/* Expanded state sub-menu */}
                      {sidebarState === "expanded" && isOpen && (
                        <SidebarMenuSub className="sidebar-submenu-enter animate-in slide-in-from-left-1 duration-300">
                          {accessibleChildren.map((child, idx) => (
                            <SidebarMenuSubItem
                              key={child.label}
                              style={{ animationDelay: `${idx * 50}ms` }}
                              className="animate-in fade-in-0 slide-in-from-left-2"
                            >
                              <SidebarMenuSubButton
                                asChild
                                isActive={
                                  child.href
                                    ? pathname.startsWith(child.href)
                                    : false
                                }
                                className="transition-all duration-300 hover:translate-x-1 hover:shadow-sm"
                              >
                                <Link
                                  href={child.href!}
                                  className="flex items-center gap-3"
                                  prefetch={true}
                                >
                                  {child.icon && (
                                    <child.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                                  )}
                                  <span className="transition-all duration-200">
                                    {child.label}
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}

                      {/* Collapsed state floating panel */}
                      {sidebarState === "collapsed" && (
                        <HoverPopoverContent
                          side="right"
                          className="ml-2 sidebar-popover-content"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 px-1 py-2 border-b border-border/30">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <item.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-semibold text-foreground text-sm">
                                  {item.label}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {accessibleChildren.length} chức năng
                                </div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              {accessibleChildren.map((child, idx) => (
                                <div
                                  key={child.label}
                                  style={{ animationDelay: `${idx * 30}ms` }}
                                  className="animate-in fade-in-0 slide-in-from-left-1"
                                >
                                  <SidebarMenuButton
                                    asChild
                                    isActive={
                                      child.href
                                        ? pathname.startsWith(child.href)
                                        : false
                                    }
                                    className="!size-auto !p-3 justify-start hover:bg-primary/10 hover:text-primary transition-all duration-300 text-sm rounded-lg group"
                                  >
                                    <Link
                                      href={child.href!}
                                      className="flex items-center gap-3 w-full"
                                      prefetch={true}
                                    >
                                      <div className="p-1.5 rounded-md bg-muted/50 group-hover:bg-primary/20 transition-colors duration-200">
                                        {child.icon && (
                                          <child.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                        )}
                                      </div>
                                      <span className="font-medium">
                                        {child.label}
                                      </span>
                                    </Link>
                                  </SidebarMenuButton>
                                </div>
                              ))}
                            </div>
                          </div>
                        </HoverPopoverContent>
                      )}
                    </SidebarMenuItem>
                  </HoverPopover>
                );
              }

              // Render simple item without children
              if (item.href) {
                const isDashboard = item.href === "/dashboard";
                const isActive = isDashboard
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem
                    key={item.label}
                    className="sidebar-menu-item"
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "transition-all duration-300 ease-in-out",
                        isActive &&
                          "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-l-2 border-primary shadow-lg"
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 group"
                        prefetch={true}
                      >
                        <item.icon
                          className={cn(
                            "transition-all duration-300 ease-in-out group-hover:scale-110",
                            isActive && "text-primary drop-shadow-sm"
                          )}
                        />
                        <span className="group-data-[collapsible=icon]:sr-only font-medium transition-all duration-200">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              return null;
            })}
          </Suspense>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
