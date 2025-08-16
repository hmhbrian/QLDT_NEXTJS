"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, LogOut } from "lucide-react";

export function EmergencyRecovery() {
  const handleEmergencyLogout = () => {
    // Clear all possible auth storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear browser caches if available
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }

    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie =
        name +
        "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" +
        window.location.hostname;
    });

    // Force reload and redirect with cache bust
    window.location.href = "/login?t=" + Date.now();
  };

  const handleForceRefresh = () => {
    // Clear caches before refresh
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800">Xác thực bị lỗi?</p>
          <p className="text-xs text-red-600 mt-1">
            Ứng dụng có thể gặp lỗi chunk loading hoặc xác thực
          </p>
          <div className="mt-3 space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleForceRefresh}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Làm mới
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleEmergencyLogout}
              className="text-xs"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
