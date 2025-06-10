
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

// Đã đổi tên component thành CustomThemeProvider để tránh xung đột tên tiềm ẩn
export function CustomThemeProvider({ children, ...props }: ThemeProviderProps) { 
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

