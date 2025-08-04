/**
 * Optimized UI Components
 * High-performance, reusable UI components with smooth animations
 */

import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Grid, List, ChevronDown } from 'lucide-react';

/**
 * Performance optimized search bar
 */
interface OptimizedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const OptimizedSearchBar = memo<OptimizedSearchBarProps>(({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  className
}) => {
  return (
    <div className={cn("relative flex-1 max-w-md", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 h-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      />
    </div>
  );
});

/**
 * Elegant view mode toggle
 */
interface ViewModeToggleProps {
  mode: 'grid' | 'list' | 'table';
  onModeChange: (mode: 'grid' | 'list' | 'table') => void;
  className?: string;
}

export const ViewModeToggle = memo<ViewModeToggleProps>(({
  mode,
  onModeChange,
  className
}) => {
  return (
    <div className={cn("inline-flex rounded-lg bg-muted p-1", className)}>
      <Button
        variant={mode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('grid')}
        className="h-8 w-8 p-0 data-[state=on]:bg-background data-[state=on]:text-foreground"
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={mode === 'list' || mode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange(mode === 'table' ? 'table' : 'list')}
        className="h-8 w-8 p-0 data-[state=on]:bg-background data-[state=on]:text-foreground"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
});

/**
 * Modern status badge with animations
 */
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export const StatusBadge = memo<StatusBadgeProps>(({
  status,
  variant = 'default',
  className
}) => {
  const badgeVariant = useMemo(() => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'hoạt động':
      case 'đã xuất bản':
        return 'success';
      case 'pending':
      case 'đang chờ':
      case 'lưu nháp':
        return 'warning';
      case 'inactive':
      case 'không hoạt động':
      case 'hủy':
        return 'destructive';
      default:
        return variant;
    }
  }, [status, variant]);

  return (
    <Badge 
      variant={badgeVariant as any}
      className={cn(
        "transition-all duration-200 hover:shadow-sm",
        className
      )}
    >
      {status}
    </Badge>
  );
});

/**
 * Smooth loading skeleton
 */
interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export const LoadingSkeleton = memo<LoadingSkeletonProps>(({
  className,
  lines = 3
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-muted"
          style={{ width: `${100 - (i * 10)}%` }}
        />
      ))}
    </div>
  );
});

/**
 * Enhanced action buttons group
 */
interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onView?: () => void;
  viewLabel?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export const ActionButtons = memo<ActionButtonsProps>(({
  onEdit,
  onDelete,
  onDuplicate,
  onView,
  viewLabel,
  className,
  size = 'sm'
}) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {onView && (
        <Button
          variant="ghost"
          size={size}
          onClick={onView}
          className="h-8 w-8 p-0 hover:bg-primary/10"
        >
          {viewLabel ? (
            <span className="text-xs">{viewLabel}</span>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </Button>
      )}
      {onEdit && (
        <Button
          variant="ghost"
          size={size}
          onClick={onEdit}
          className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Button>
      )}
      {onDuplicate && (
        <Button
          variant="ghost"
          size={size}
          onClick={onDuplicate}
          className="h-8 w-8 p-0 hover:bg-green-500/10 hover:text-green-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size={size}
          onClick={onDelete}
          className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      )}
    </div>
  );
});

/**
 * Smooth card with hover effects
 */
interface OptimizedCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
}

export const OptimizedCard = memo<OptimizedCardProps>(({
  children,
  onClick,
  className,
  hover = true
}) => {
  return (
    <Card
      className={cn(
        "transition-all duration-300 ease-out",
        hover && "hover:shadow-lg hover:-translate-y-1 hover:shadow-primary/5",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Card>
  );
});

/**
 * Elegant empty state
 */
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState = memo<EmptyStateProps>(({
  title,
  description,
  action,
  icon,
  className
}) => {
  return (
    <div className={cn(
      "flex min-h-[400px] flex-col items-center justify-center text-center",
      className
    )}>
      {icon && (
        <div className="mb-4 rounded-full bg-muted p-6">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mb-6 text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
});

// Set display names for debugging
OptimizedSearchBar.displayName = 'OptimizedSearchBar';
ViewModeToggle.displayName = 'ViewModeToggle';
StatusBadge.displayName = 'StatusBadge';
LoadingSkeleton.displayName = 'LoadingSkeleton';
ActionButtons.displayName = 'ActionButtons';
OptimizedCard.displayName = 'OptimizedCard';
EmptyState.displayName = 'EmptyState';
