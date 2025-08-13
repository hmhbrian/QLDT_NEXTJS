/**
 * Cookie Manager - Quản lý cookie chuyên nghiệp và bảo mật
 * Tương tự cách GitHub xử lý cookie management
 */

export interface CookieOptions {
  expires?: Date | number; // Date object or days from now
  maxAge?: number; // seconds
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export interface CookieInfo {
  name: string;
  value: string;
  options: CookieOptions;
  createdAt: number;
}

export class CookieManager {
  private static instance: CookieManager;
  private cookieRegistry = new Map<string, CookieInfo>();

  private constructor() {
    if (typeof window !== "undefined") {
      this.loadExistingCookies();
    }
  }

  static getInstance(): CookieManager {
    if (!CookieManager.instance) {
      CookieManager.instance = new CookieManager();
    }
    return CookieManager.instance;
  }

  private loadExistingCookies(): void {
    try {
      const cookies = document.cookie.split(";");
      cookies.forEach((cookie) => {
        const [name, value] = cookie.trim().split("=");
        if (name && value) {
          this.cookieRegistry.set(name, {
            name,
            value: decodeURIComponent(value),
            options: {},
            createdAt: Date.now(),
          });
        }
      });
    } catch (error) {
      console.warn("Failed to load existing cookies:", error);
    }
  }

  // Set cookie with security defaults
  set(name: string, value: string, options: CookieOptions = {}): void {
    const cookieOptions: CookieOptions = {
      path: "/",
      secure: window.location.protocol === "https:",
      sameSite: "strict", // Tăng cường bảo mật chống CSRF
      ...options,
    };

    // Register cookie
    this.cookieRegistry.set(name, {
      name,
      value,
      options: cookieOptions,
      createdAt: Date.now(),
    });

    // Build cookie string
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}`;

    // Add options
    if (cookieOptions.expires) {
      if (typeof cookieOptions.expires === "number") {
        const date = new Date();
        date.setTime(
          date.getTime() + cookieOptions.expires * 24 * 60 * 60 * 1000
        );
        cookieString += `; expires=${date.toUTCString()}`;
      } else {
        cookieString += `; expires=${cookieOptions.expires.toUTCString()}`;
      }
    }

    if (cookieOptions.maxAge) {
      cookieString += `; max-age=${cookieOptions.maxAge}`;
    }

    if (cookieOptions.domain) {
      cookieString += `; domain=${cookieOptions.domain}`;
    }

    if (cookieOptions.path) {
      cookieString += `; path=${cookieOptions.path}`;
    }

    if (cookieOptions.secure) {
      cookieString += "; secure";
    }

    if (cookieOptions.sameSite) {
      cookieString += `; samesite=${cookieOptions.sameSite}`;
    }

    // Note: httpOnly cannot be set from client-side JavaScript
    // It must be set by the server

    try {
      document.cookie = cookieString;
    } catch (error) {
      console.error("Failed to set cookie:", error);
      throw error;
    }
  }

  // Get cookie value
  get(name: string): string | null {
    try {
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split("=");
        if (cookieName === name) {
          return decodeURIComponent(cookieValue || "");
        }
      }
      return null;
    } catch (error) {
      console.warn(`Failed to get cookie ${name}:`, error);
      return null;
    }
  }

  // Remove cookie
  remove(
    name: string,
    options: Pick<CookieOptions, "domain" | "path"> = {}
  ): void {
    this.set(name, "", {
      expires: new Date(0),
      domain: options.domain,
      path: options.path || "/",
    });

    this.cookieRegistry.delete(name);
  }

  // Check if cookie exists
  has(name: string): boolean {
    return this.get(name) !== null;
  }

  // Get all cookies
  getAll(): Record<string, string> {
    const cookies: Record<string, string> = {};

    try {
      document.cookie.split(";").forEach((cookie) => {
        const [name, value] = cookie.trim().split("=");
        if (name && value) {
          cookies[name] = decodeURIComponent(value);
        }
      });
    } catch (error) {
      console.warn("Failed to get all cookies:", error);
    }

    return cookies;
  }

  // Set session cookie (expires when browser closes)
  setSession(
    name: string,
    value: string,
    options: Omit<CookieOptions, "expires" | "maxAge"> = {}
  ): void {
    this.set(name, value, {
      ...options,
      // No expires or maxAge = session cookie
    });
  }

  // Set secure authentication cookie with enhanced security
  setAuth(name: string, value: string, options: CookieOptions = {}): void {
    this.set(name, value, {
      secure: window.location.protocol === "https:",
      sameSite: "strict", // Chống CSRF attacks
      path: "/",
      // Tự động xóa khi đóng browser nếu không có expires
      ...options,
    });
  }

  // Set session-only auth cookie (xóa khi đóng browser)
  setSessionAuth(name: string, value: string): void {
    this.set(name, value, {
      secure: window.location.protocol === "https:",
      sameSite: "strict",
      path: "/",
      // Không set expires/maxAge = session cookie
    });
  }

  // Set persistent auth cookie (nhớ đăng nhập)
  setPersistentAuth(name: string, value: string, days: number = 30): void {
    this.set(name, value, {
      secure: window.location.protocol === "https:",
      sameSite: "strict",
      path: "/",
      expires: days,
    });
  }

  // Enhanced security: obfuscate sensitive cookie names
  private obfuscateCookieName(name: string): string {
    if (name.includes("auth") || name.includes("token")) {
      return `__${name.slice(0, 2)}${btoa(name.slice(2))
        .replace(/[=+/]/g, "")
        .slice(0, 6)}`;
    }
    return name;
  }

  // Đơn giản hóa: chỉ lưu token, persistent cho đến khi logout
  setSecureAuth(token: string, rememberMe: boolean = true): void {
    // Default persistent
    const tokenCookieName = "qldt_auth_token";

    // Luôn lưu persistent (30 days) trừ khi rõ ràng muốn session
    if (rememberMe) {
      this.setPersistentAuth(tokenCookieName, token, 30);
    } else {
      this.setSessionAuth(tokenCookieName, token);
    }

    // Verify token was set
    const verifyToken = this.get(tokenCookieName);

    if (!verifyToken) {
      console.error("❌ [CookieManager] Failed to set token cookie!");
      throw new Error("Failed to set authentication cookie");
    }
  }

  // Get auth token
  getSecureAuth(): string | null {
    const cookieName = "qldt_auth_token";
    const token = this.get(cookieName);

    return token;
  }

  // Remove auth data
  removeSecureAuth(): void {
    const tokenCookieName = "qldt_auth_token";

    this.remove(tokenCookieName);
    this.remove("session_id"); // remove decoy

    // Verify removal
    const verifyToken = this.get(tokenCookieName);
  }

  // Generate decoy value
  private generateDecoyValue(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  // Get cookie statistics
  getStats() {
    const allCookies = this.getAll();
    const registry = Array.from(this.cookieRegistry.values());

    return {
      total: Object.keys(allCookies).length,
      registered: registry.length,
      secure: registry.filter((c) => c.options.secure).length,
      session: registry.filter((c) => !c.options.expires && !c.options.maxAge)
        .length,
      persistent: registry.filter((c) => c.options.expires || c.options.maxAge)
        .length,
    };
  }
}

// Export singleton instance
export const cookieManager = CookieManager.getInstance();
