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
      sameSite: "lax",
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

  // Set secure authentication cookie
  setAuth(name: string, value: string, options: CookieOptions = {}): void {
    this.set(name, value, {
      secure: true,
      sameSite: "strict",
      path: "/",
      ...options,
    });
  }

  // Clear all cookies (that can be cleared from client-side)
  clearAll(): void {
    const cookies = this.getAll();
    Object.keys(cookies).forEach((name) => {
      this.remove(name);
    });
    this.cookieRegistry.clear();
  }

  // Get cookie with metadata
  getCookieInfo(name: string): CookieInfo | null {
    return this.cookieRegistry.get(name) || null;
  }

  // Get cookies by pattern
  getByPattern(pattern: RegExp): Record<string, string> {
    const allCookies = this.getAll();
    const matchingCookies: Record<string, string> = {};

    Object.entries(allCookies).forEach(([name, value]) => {
      if (pattern.test(name)) {
        matchingCookies[name] = value;
      }
    });

    return matchingCookies;
  }

  // Cookie consent management
  setConsent(categories: string[]): void {
    this.set(
      "cookie_consent",
      JSON.stringify({
        categories,
        timestamp: Date.now(),
        version: "1.0",
      }),
      {
        expires: 365, // 1 year
        secure: true,
        sameSite: "lax",
      }
    );
  }

  getConsent(): {
    categories: string[];
    timestamp: number;
    version: string;
  } | null {
    const consent = this.get("cookie_consent");
    if (!consent) return null;

    try {
      return JSON.parse(consent);
    } catch (error) {
      console.warn("Failed to parse cookie consent:", error);
      return null;
    }
  }

  hasConsent(category: string): boolean {
    const consent = this.getConsent();
    return consent ? consent.categories.includes(category) : false;
  }

  // GDPR compliance helpers
  exportCookieData(): CookieInfo[] {
    return Array.from(this.cookieRegistry.values());
  }

  // Clean up expired cookies from registry
  cleanupRegistry(): void {
    const now = Date.now();
    this.cookieRegistry.forEach((info, name) => {
      if (info.options.expires) {
        let expiryTime: number;

        if (typeof info.options.expires === "number") {
          expiryTime =
            info.createdAt + info.options.expires * 24 * 60 * 60 * 1000;
        } else {
          expiryTime = info.options.expires.getTime();
        }

        if (now > expiryTime) {
          this.cookieRegistry.delete(name);
        }
      }
    });
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
