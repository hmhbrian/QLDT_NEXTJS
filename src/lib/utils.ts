import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Cookies from 'js-cookie';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Hàm buộc làm mới dữ liệu từ cookie
export function forceRefreshCookieData(key: string): any {
  try {
    const cookie = Cookies.get(key);
    if (cookie) {
      const data = JSON.parse(cookie);
      
      // Trigger một sự kiện tùy chỉnh để thông báo cho các component biết dữ liệu đã thay đổi
      window.dispatchEvent(new CustomEvent('cookie-change', { detail: { key } }));
      
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
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    
    // Thông báo cho các component biết cookie đã thay đổi
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('cookie-change', { detail: { key } }));
    }, 50);
  } catch (error) {
    console.error(`Lỗi khi cập nhật cookie "${key}":`, error);
  }
}
