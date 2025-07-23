"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { isValid, parseISO } from "date-fns";

interface ClientTimeProps {
  date: string | null | undefined;
  className?: string;
}

export function ClientTime({ date, className }: ClientTimeProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatDate = () => {
    if (!date) {
      return "Thời gian không xác định";
    }
    try {
      const dateObj = parseISO(date);
      if (!isValid(dateObj)) {
        return "Ngày không hợp lệ";
      }
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: vi });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Lỗi định dạng ngày";
    }
  };

  if (!isMounted) {
    return <span className={className}>...</span>;
  }

  return <span className={className}>{formatDate()}</span>;
}
