"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, UserCircle, Settings, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle"; // Import ThemeToggle

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const getInitials = (name?: string) => {
    if (!name) return user.email ? user.email[0].toUpperCase() : "?";
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-9 w-9" />
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-10 rounded-full p-1 pr-2 md:pr-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.urlAvatar}
                  alt={user.fullName || user.email}
                  data-ai-hint="user avatar"
                />
                <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium truncate max-w-[150px]">
                {user.fullName || user.email}
              </span>
              <ChevronDown className="h-4 w-4 opacity-70 hidden md:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.fullName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email} ({user.role})
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/trainee/profile")}>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Hồ sơ</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                switch (user.role) {
                  case "ADMIN":
                    router.push("/admin/settings");
                    break;
                  case "HR":
                    router.push("/hr/settings");
                    break;
                  case "HOCVIEN":
                    router.push("/trainee/settings");
                    break;
                }
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Cài đặt</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
