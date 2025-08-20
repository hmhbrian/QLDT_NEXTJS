/**
 * Performance Indicator Component
 * Simple implementation without complex JSX syntax issues
 */

"use client";

import React from "react";
import { usePerformanceMonitoring } from "@/hooks";

export function PerformanceIndicator() {
  const { getSummary } = usePerformanceMonitoring(true);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(process.env.NODE_ENV === "development");
  }, []);

  if (!isVisible) return null;

  const summary = getSummary();
  if (!summary) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        padding: "8px",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        fontSize: "12px",
        borderRadius: "4px",
        zIndex: 50,
      }}
    >
      <div>📊 Performance</div>
      <div>Slow queries: {summary.slowQueries}</div>
      <div>LCP: {summary.avgLCP?.toFixed(0)}ms</div>
      <div>FID: {summary.avgFID?.toFixed(0)}ms</div>
    </div>
  );
}
