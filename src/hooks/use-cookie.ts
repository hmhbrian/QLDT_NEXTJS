'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export function useCookie<T>(key: string, initialValue: T) {
    // State để lưu trữ giá trị cookie
    const [value, setValue] = useState<T>(() => {
        // Kiểm tra xem có cookie không khi component mount
        const cookie = Cookies.get(key);
        if (cookie) {
            try {
                return JSON.parse(cookie);
            } catch {
                return initialValue;
            }
        }
        return initialValue;
    });

    // Cập nhật cookie khi state thay đổi
    useEffect(() => {
        Cookies.set(key, JSON.stringify(value), {
            expires: 7, // Cookie sẽ hết hạn sau 7 ngày
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
    }, [key, value]);

    return [value, setValue] as const;
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
            return defaultValue;
        }
    }
    return defaultValue;
}

// Hàm tiện ích để đặt giá trị cookie
export function setCookie<T>(key: string, value: T, options?: Cookies.CookieAttributes) {
    Cookies.set(key, JSON.stringify(value), {
        expires: 7,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        ...options
    });
} 