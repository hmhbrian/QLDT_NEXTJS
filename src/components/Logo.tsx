import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  collapsed?: boolean; // This prop might be re-evaluated based on new logo usage
}

export function Logo({ className, collapsed = false }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/Becamex.svg"
        alt="Becamex Logo"
        width={250}
        height={50}
        className="h-12 w-auto object-contain" // Tăng kích thước và đảm bảo tỷ lệ ảnh
        data-ai-hint="company logo orange"
        priority // Preload the logo image as it's likely LCP
      />
    </div>
  );
}
