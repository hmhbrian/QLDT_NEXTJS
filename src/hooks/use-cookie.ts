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
      console.error(`Lỗi khi đọc cookie "${key}":`, error);
      return initialValue;
    }
  });

  // Hàm để tải lại dữ liệu từ cookie
  const reloadFromCookie = useCallback(() => {
    try {
      const item = Cookies.get(key);
      if (item) {
        const newValue = JSON.parse(item);
        if (JSON.stringify(newValue) !== JSON.stringify(storedValue)) {
          setStoredValue(newValue);
          return true; // Đã cập nhật
        }
      }
      return false; // Không cần cập nhật
    } catch (error) {
      console.error(`Lỗi khi tải lại cookie "${key}":`, error);
      return false;
    }
  }, [key, storedValue]);

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

        // Buộc cập nhật lại giá trị từ cookie sau một khoảng thời gian ngắn
        // để đảm bảo các thành phần khác đều có dữ liệu mới nhất
        setTimeout(() => {
          // Thông báo cho các component khác biết cookie đã thay đổi
          window.dispatchEvent(new CustomEvent('cookie-change', { detail: { key } }));
        }, 50);
      } catch (error) {
        console.error(`Lỗi khi đặt cookie "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Effect để lắng nghe thay đổi cookie từ các tab/cửa sổ khác
  useEffect(() => {
    const handleCookieChange = () => {
      reloadFromCookie();
    };

    // Lắng nghe sự kiện cookie-change
    window.addEventListener('cookie-change', (e: CustomEvent<{ key: string }>) => {
      if (e.detail.key === key) {
        handleCookieChange();
      }
    });

    // Kiểm tra định kỳ với tần suất cao hơn
    const intervalId = setInterval(handleCookieChange, 500); // Kiểm tra mỗi 0.5 giây

    return () => {
      clearInterval(intervalId); // Dọn dẹp interval khi unmount
      window.removeEventListener('cookie-change', handleCookieChange);
    };
  }, [key, reloadFromCookie]);

  return [storedValue, setValue] as const;
}

// Hàm tiện ích để xóa cookie
export function removeCookie(key: string) {
  Cookies.remove(key);
  // Thông báo cookie đã thay đổi
  window.dispatchEvent(new CustomEvent('cookie-change', { detail: { key } }));
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

  // Thông báo cookie đã thay đổi
  window.dispatchEvent(new CustomEvent('cookie-change', { detail: { key } }));
}

