import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  OptimizedSearchBar,
  ViewModeToggle,
  LoadingSkeleton,
  EmptyState,
} from "@/components/ui/optimized";
import { Plus, RefreshCw } from "lucide-react";

/**
 * Standard page header with actions
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
}

export const PageHeader = memo<PageHeaderProps>(
  ({ title, description, actions, breadcrumb, className }) => {
    return (
      <div className={cn("space-y-4 pb-6", className)}>
        {breadcrumb}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        <Separator />
      </div>
    );
  }
);

/**
 * Optimized Page Layouts
 * Responsive, performant p/**
 * Filter toolbar with search and view modes
 */
interface FilterToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  viewMode?: "grid" | "list" | "table";
  onViewModeChange?: (mode: "grid" | "list" | "table") => void;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const FilterToolbar = memo<FilterToolbarProps>(
  ({
    searchValue,
    onSearchChange,
    searchPlaceholder,
    viewMode,
    onViewModeChange,
    filters,
    actions,
    className,
  }) => {
    return (
      <Card className={cn("mb-6", className)}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <OptimizedSearchBar
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              className="flex-1"
            />

            <div className="flex items-center gap-2">
              {filters}
              {viewMode && onViewModeChange && (
                <ViewModeToggle
                  mode={viewMode}
                  onModeChange={onViewModeChange}
                />
              )}
              {actions}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

/**
 * Grid layout for cards
 */
interface GridLayoutProps {
  children: React.ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export const GridLayout = memo<GridLayoutProps>(
  ({
    children,
    columns = { sm: 1, md: 2, lg: 3, xl: 4 },
    gap = 6,
    className,
  }) => {
    const gridClasses = cn(
      "grid",
      `gap-${gap}`,
      columns.sm && `grid-cols-${columns.sm}`,
      columns.md && `md:grid-cols-${columns.md}`,
      columns.lg && `lg:grid-cols-${columns.lg}`,
      columns.xl && `xl:grid-cols-${columns.xl}`,
      className
    );

    return <div className={gridClasses}>{children}</div>;
  }
);

/**
 * Loading state with skeleton
 */
interface LoadingStateProps {
  type?: "grid" | "list" | "table";
  count?: number;
  className?: string;
}

export const LoadingState = memo<LoadingStateProps>(
  ({ type = "grid", count = 6, className }) => {
    if (type === "grid") {
      return (
        <GridLayout className={className}>
          {Array.from({ length: count }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <LoadingSkeleton lines={3} />
              </CardContent>
            </Card>
          ))}
        </GridLayout>
      );
    }

    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <LoadingSkeleton lines={2} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
);

/**
 * Stats cards grid
 */
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?:
    | string
    | {
        value: number;
        type: "up" | "down" | "neutral";
      };
  trendUp?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const StatsCard = memo<StatsCardProps>(
  ({ title, value, description, trend, trendUp, icon, className }) => {
    return (
      <Card
        className={cn("transition-all duration-300 hover:shadow-md", className)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{value}</div>
          {(description || trend) && (
            <div className="flex items-center gap-2 mt-2">
              {trend && (
                <div
                  className={cn(
                    "flex items-center text-xs font-medium",
                    typeof trend === "string"
                      ? trendUp
                        ? "text-green-600"
                        : "text-muted-foreground"
                      : trend.type === "up"
                      ? "text-green-600"
                      : trend.type === "down"
                      ? "text-red-600"
                      : "text-muted-foreground"
                  )}
                >
                  {typeof trend === "string"
                    ? trendUp
                      ? "↗"
                      : "→"
                    : trend.type === "up"
                    ? "↗"
                    : trend.type === "down"
                    ? "↘"
                    : "→"}
                  {typeof trend === "string"
                    ? trend
                    : `${Math.abs(trend.value)}%`}
                </div>
              )}
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

/**
 * Action bar for list/table views
 */
interface ActionBarProps {
  selectedCount?: number;
  totalCount?: number;
  onRefresh?: () => void;
  bulkActions?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export const ActionBar = memo<ActionBarProps>(
  ({
    selectedCount = 0,
    totalCount = 0,
    onRefresh,
    bulkActions,
    primaryAction,
    className,
  }) => {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-4",
          className
        )}
      >
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {selectedCount > 0
              ? `Đã chọn ${selectedCount} trong ${totalCount} mục`
              : `Tổng cộng ${totalCount} mục`}
          </span>
          {selectedCount > 0 && bulkActions}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {primaryAction && (
            <Button onClick={primaryAction.onClick} size="sm" className="h-8">
              {primaryAction.icon || <Plus className="h-4 w-4 mr-1" />}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
    );
  }
);

// Set display names
PageHeader.displayName = "PageHeader";
FilterToolbar.displayName = "FilterToolbar";
GridLayout.displayName = "GridLayout";
LoadingState.displayName = "LoadingState";
StatsCard.displayName = "StatsCard";
ActionBar.displayName = "ActionBar";
