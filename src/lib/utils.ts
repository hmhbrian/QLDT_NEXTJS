import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookies from "js-cookie";

interface CookieOptions {
  expires?: number;
  sameSite?: "strict" | "lax" | "none";
  secure?: boolean;
  path?: string;
}

export function cn(
  ...inputs: (string | undefined | null | boolean | Record<string, unknown>)[]
) {
  return twMerge(clsx(inputs));
}

// Hàm buộc làm mới dữ liệu từ cookie
export function forceRefreshCookieData<T = unknown>(key: string): T | null {
  try {
    const cookie = Cookies.get(key);
    if (cookie) {
      const data = JSON.parse(cookie);

      // Trigger một sự kiện tùy chỉnh để thông báo cho các component biết dữ liệu đã thay đổi
      window.dispatchEvent(
        new CustomEvent("cookie-change", { detail: { key } })
      );

      return data;
    }
    return null;
  } catch (error) {
    console.error(`Lỗi khi đọc cookie "${key}":`, error);
    return null;
  }
}

// Hàm cập nhật cookie và buộc làm mới
export function updateAndRefreshCookie<T>(key: string, value: T): void {
  try {
    // Lưu vào cookie
    Cookies.set(key, JSON.stringify(value), {
      expires: 7,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    // Thông báo cho các component biết cookie đã thay đổi - Instant notification
    window.dispatchEvent(new CustomEvent("cookie-change", { detail: { key } }));
  } catch (error) {
    console.error(`Lỗi khi cập nhật cookie "${key}":`, error);
  }
}

export function setCookieClient(
  key: string,
  value: string | number | boolean | object,
  options?: CookieOptions
): void {
  Cookies.set(key, typeof value === "string" ? value : JSON.stringify(value), {
    expires: 7,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    ...options,
  });

  window.dispatchEvent(new CustomEvent("cookie-change", { detail: { key } }));
}
