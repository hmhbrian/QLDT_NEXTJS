import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  collapsed?: boolean; // Prop này có thể được đánh giá lại dựa trên cách sử dụng logo mới
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/Becamex.svg"
        alt="Becamex Logo"
        width={250}
        height={50}
        className="h-12 w-auto object-contain" // Tăng kích thước và đảm bảo tỷ lệ ảnh
        data-ai-hint="company logo orange"
        priority // Tải trước hình ảnh logo vì nó có khả năng là LCP (Largest Contentful Paint)
      />
    </div>
  );
}
