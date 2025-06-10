
'use client';

import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

export function useCookie<T>(
  key: string,
  initialValue: T
): readonly [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = Cookies.get(key); // Lấy cookie từ trình duyệt
      if (item) {
        return JSON.parse(item); // Phân tích cú pháp JSON nếu tồn tại
      }
      // Đặt cookie ban đầu nếu không tìm thấy
      Cookies.set(key, JSON.stringify(initialValue), {
        expires: 7, // Thời gian hết hạn (7 ngày)
        sameSite: 'strict', // Chính sách SameSite
        secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS ở môi trường production
      });
      return initialValue;
    } catch (error) {
      console.error(`Lỗi khi đọc cookie “${key}”:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Cho phép giá trị là một hàm để có hành vi giống useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        // Lưu trạng thái
        setStoredValue(valueToStore);
        // Lưu vào cookie
        Cookies.set(key, JSON.stringify(valueToStore), {
          expires: 7,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        });
      } catch (error) {
        console.error(`Lỗi khi đặt cookie “${key}”:`, error);
      }
    },
    [key, storedValue]
  );

  // Effect để lắng nghe thay đổi cookie từ các tab/cửa sổ khác (tùy chọn, phiên bản cơ bản)
  useEffect(() => {
    const handleCookieChange = () => {
      try {
        const item = Cookies.get(key);
        if (item) {
          const newValue = JSON.parse(item);
          if (JSON.stringify(newValue) !== JSON.stringify(storedValue)) { // Chỉ cập nhật nếu giá trị thực sự thay đổi
            setStoredValue(newValue);
          }
        } else {
           // Nếu cookie bị xóa ở nơi khác, đặt lại về initialValue
          if (JSON.stringify(initialValue) !== JSON.stringify(storedValue)) {
            setStoredValue(initialValue);
          }
        }
      } catch (error) {
        console.error(`Lỗi khi đọc lại cookie “${key}”:`, error);
      }
    };

    // Kiểm tra định kỳ cơ bản vì các sự kiện thay đổi cookie trực tiếp không phải là tiêu chuẩn
    // Để đồng bộ hóa giữa các tab mạnh mẽ hơn, hãy xem xét BroadcastChannel hoặc sự kiện window.storage (cho localStorage)
    const intervalId = setInterval(handleCookieChange, 2000); // Kiểm tra mỗi 2 giây

    return () => clearInterval(intervalId); // Dọn dẹp interval khi unmount
  }, [key, initialValue, storedValue]);


  return [storedValue, setValue] as const;
}

// Hàm tiện ích để xóa cookie
export function removeCookie(key: string) {
  Cookies.remove(key);
}

// Hàm tiện ích để lấy giá trị cookie
export function getCookie<T>(key: string, defaultValue: T): T {
  const cookie = Cookies.get(key);
  if (cookie) {
    try {
      return JSON.parse(cookie);
    } catch {
      return defaultValue; // Trả về giá trị mặc định nếu phân tích cú pháp thất bại
    }
  }
  return defaultValue; // Trả về giá trị mặc định nếu không tìm thấy cookie
}

// Hàm tiện ích để đặt giá trị cookie
export function setCookie<T>(
  key: string,
  value: T,
  options?: Cookies.CookieAttributes // Tùy chọn cho cookie
) {
  Cookies.set(key, JSON.stringify(value), {
    expires: 7,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    ...options, // Ghi đè các tùy chọn mặc định nếu được cung cấp
  });
}

