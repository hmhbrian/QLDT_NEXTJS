/**
 * Cookie Security Monitor
 * Giám sát và báo cáo tình trạng bảo mật của cookies
 */

import { cookieManager } from "../utils/cookie-manager";

export interface CookieSecurityReport {
  totalCookies: number;
  securedCookies: number;
  sessionCookies: number;
  persistentCookies: number;
  warnings: string[];
  recommendations: string[];
}

export class CookieSecurityMonitor {
  static generateSecurityReport(): CookieSecurityReport {
    const stats = cookieManager.getStats();
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check for insecure cookies
    if (stats.secure < stats.total) {
      warnings.push(
        `${stats.total - stats.secure} cookies không có flag Secure`
      );
      recommendations.push(
        "Đặt tất cả cookies với flag Secure trong production"
      );
    }

    // Check for session vs persistent ratio
    if (stats.persistent > stats.session) {
      warnings.push("Nhiều persistent cookies hơn session cookies");
      recommendations.push("Ưu tiên sử dụng session cookies để tăng bảo mật");
    }

    // Check if we have auth cookies exposed
    const allCookies = cookieManager.getAll();
    const exposedAuthCookies = Object.keys(allCookies).filter(
      (name) => name.includes("auth") || name.includes("token")
    );

    if (exposedAuthCookies.length > 0) {
      warnings.push("Phát hiện auth cookies có tên dễ đoán");
      recommendations.push("Sử dụng cookie obfuscation cho auth tokens");
    }

    return {
      totalCookies: stats.total,
      securedCookies: stats.secure,
      sessionCookies: stats.session,
      persistentCookies: stats.persistent,
      warnings,
      recommendations,
    };
  }

  static logSecurityStatus(): void {
    const report = this.generateSecurityReport();

    console.group("🍪 Cookie Security Report");
    console.log(`Total Cookies: ${report.totalCookies}`);
    console.log(
      `Secured Cookies: ${report.securedCookies}/${report.totalCookies}`
    );
    console.log(`Session Cookies: ${report.sessionCookies}`);
    console.log(`Persistent Cookies: ${report.persistentCookies}`);

    if (report.warnings.length > 0) {
      console.warn("⚠️ Security Warnings:");
      report.warnings.forEach((warning) => console.warn(`  - ${warning}`));
    }

    if (report.recommendations.length > 0) {
      console.info("💡 Recommendations:");
      report.recommendations.forEach((rec) => console.info(`  - ${rec}`));
    }

    console.groupEnd();
  }

  static startPeriodicMonitoring(
    intervalMs: number = 60000
  ): NodeJS.Timeout | number {
    return setInterval(() => {
      this.logSecurityStatus();
    }, intervalMs);
  }

  static auditCookieAccess(): void {
    if (typeof window !== "undefined") {
      const originalGetItem = Storage.prototype.getItem;
      const originalSetItem = Storage.prototype.setItem;

      Storage.prototype.getItem = function (key: string) {
        if (key.includes("auth") || key.includes("token")) {
          console.warn(`🔍 [Security Audit] Storage access detected: ${key}`);
        }
        return originalGetItem.call(this, key);
      };

      Storage.prototype.setItem = function (key: string, value: string) {
        if (key.includes("auth") || key.includes("token")) {
          console.warn(`🔍 [Security Audit] Storage write detected: ${key}`);
        }
        return originalSetItem.call(this, key, value);
      };
    }
  }
}

// Auto-start monitoring in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  CookieSecurityMonitor.auditCookieAccess();

  // Log security status every minute
  CookieSecurityMonitor.startPeriodicMonitoring(60000);

  // Initial report
  setTimeout(() => {
    CookieSecurityMonitor.logSecurityStatus();
  }, 2000);
}
