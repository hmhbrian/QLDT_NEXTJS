/**
 * Cache Monitor - Component để monitor cache và data sync
 * Hữu ích cho debugging và monitoring trong development
 */

"use client";

import { useState, useEffect } from "react";
import { useDataSync } from "@/hooks/use-data-sync";
import { cacheManager, cookieManager } from "@/lib/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Trash2, Database, Cookie, Activity } from "lucide-react";

interface CacheMonitorProps {
  showInProduction?: boolean;
}

export function CacheMonitor({ showInProduction = false }: CacheMonitorProps) {
  const [cacheStats, setCacheStats] = useState(cacheManager.getStats());
  const [cookieStats, setCookieStats] = useState(cookieManager.getStats());
  const [isVisible, setIsVisible] = useState(false);

  const { refreshStaleData, getCacheStats, getQueryStats, invalidateData } =
    useDataSync();

  // Don't show in production unless explicitly enabled
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && !showInProduction) {
      setIsVisible(false);
      return;
    }

    // Show monitor when specific key combination is pressed (Ctrl+Shift+M)
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === "M") {
        setIsVisible((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [showInProduction]);

  // Update stats every 5 seconds
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCacheStats(cacheManager.getStats());
      setCookieStats(cookieManager.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleClearCache = () => {
    cacheManager.clear();
    setCacheStats(cacheManager.getStats());
  };

  const handleClearCookies = () => {
    const consent = cookieManager.getConsent();
    cookieManager.clearAll();
    setCookieStats(cookieManager.getStats());

    // Restore consent if it existed
    if (consent) {
      cookieManager.setConsent(consent.categories);
    }
  };

  const handleRefreshData = async () => {
    await refreshStaleData();
    setCacheStats(cacheManager.getStats());
  };

  const handleInvalidatePattern = (pattern: string) => {
    invalidateData(pattern);
    setCacheStats(cacheManager.getStats());
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge
          variant="outline"
          className="bg-background/80 backdrop-blur-sm cursor-pointer text-xs"
          onClick={() => setIsVisible(true)}
        >
          Cache Monitor (Ctrl+Shift+M)
        </Badge>
      </div>
    );
  }

  const queryStats = getQueryStats();

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto">
      <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Cache Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <Tabs defaultValue="cache" className="w-full">
            <TabsList className="grid w-full grid-cols-3 text-xs">
              <TabsTrigger value="cache" className="text-xs">
                Cache
              </TabsTrigger>
              <TabsTrigger value="queries" className="text-xs">
                Queries
              </TabsTrigger>
              <TabsTrigger value="cookies" className="text-xs">
                Cookies
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cache" className="space-y-3 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">Cache Stats</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshData}
                    className="h-7 px-2 text-xs"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCache}
                    className="h-7 px-2 text-xs"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <Badge variant="secondary" className="text-xs">
                      {cacheStats.total}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid:</span>
                    <Badge variant="default" className="text-xs">
                      {cacheStats.valid}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Expired:</span>
                    <Badge variant="destructive" className="text-xs">
                      {cacheStats.expired}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Max:</span>
                    <Badge variant="outline" className="text-xs">
                      {cacheStats.maxEntries}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <span className="text-xs font-medium">Quick Actions:</span>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInvalidatePattern("^user_")}
                    className="h-7 text-xs"
                  >
                    Clear User Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInvalidatePattern("^api:")}
                    className="h-7 text-xs"
                  >
                    Clear API Cache
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="queries" className="space-y-3 mt-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm font-medium">React Query Stats</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <Badge variant="secondary" className="text-xs">
                      {queryStats.queries}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Stale:</span>
                    <Badge variant="outline" className="text-xs">
                      {queryStats.stale}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Fetching:</span>
                    <Badge variant="default" className="text-xs">
                      {queryStats.fetching}
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cookies" className="space-y-3 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cookie className="h-4 w-4" />
                  <span className="text-sm font-medium">Cookie Stats</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCookies}
                  className="h-7 px-2 text-xs"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <Badge variant="secondary" className="text-xs">
                      {cookieStats.total}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Secure:</span>
                    <Badge variant="default" className="text-xs">
                      {cookieStats.secure}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Session:</span>
                    <Badge variant="outline" className="text-xs">
                      {cookieStats.session}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Persistent:</span>
                    <Badge variant="outline" className="text-xs">
                      {cookieStats.persistent}
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
