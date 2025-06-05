'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, UserCircle, Settings, ChevronDown } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { navigationItems } from '@/config/navigation';
import Link from 'next/link';

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const getPageTitle = () => {
    let navItem = navigationItems.find(item => item.href === pathname);
    if (!navItem) {
      navItem = navigationItems.find(item => pathname.startsWith(item.href) && item.href !== '/');
    }
    return navItem ? navItem.label : "";
  };
  
  const pageTitle = getPageTitle();

  if (!user) return null;

  const getInitials = (name?: string) => {
    if (!name) return user.email[0].toUpperCase();
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        {/* <h1 className="text-lg md:text-xl font-semibold font-headline text-foreground truncate max-w-[calc(100vw-180px)] md:max-w-none">{pageTitle}</h1> */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-10 rounded-full p-1 pr-2 md:pr-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name || user.email} data-ai-hint="user avatar" />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-sm font-medium truncate max-w-[150px]">{user.name || user.email}</span>
            <ChevronDown className="h-4 w-4 opacity-70 hidden md:inline" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email} ({user.role})
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/trainee/profile')} disabled={user.role !== 'Trainee'}>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Hồ sơ</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              switch (user.role) {
                case 'Admin':
                  router.push('/admin/settings');
                  break;
                case 'HR':
                  router.push('/hr/settings');
                  break;
                case 'Trainee':
                  router.push('/trainee/settings');
                  break;
              }
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Cài đặt</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
