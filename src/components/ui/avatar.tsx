"use client";

import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = "md", ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    const initials = name ? getInitials(name) : "?";

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 font-semibold text-white",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
