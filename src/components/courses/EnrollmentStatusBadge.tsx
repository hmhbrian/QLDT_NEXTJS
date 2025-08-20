import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnrollmentStatusBadgeProps {
  status?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function EnrollmentStatusBadge({
  status,
  size = "md",
  className,
}: EnrollmentStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 3:
        return {
          label: "Đã đậu",
          icon: CheckCircle,
          className:
            "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
        };
      case 4:
        return {
          label: "Chưa đậu",
          icon: XCircle,
          className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
        };
      case 2:
      case 1:
      default:
        return {
          label: "Đang học",
          icon: Clock,
          className:
            "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const iconSize = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }[size];

  const badgeSize = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  }[size];

  return (
    <Badge className={cn(config.className, badgeSize, className)}>
      <Icon className={cn(iconSize, "mr-1")} />
      {config.label}
    </Badge>
  );
}
