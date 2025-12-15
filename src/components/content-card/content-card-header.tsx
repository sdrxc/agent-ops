"use client";

import * as React from "react";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// ============ Header ============
interface ContentCardHeaderProps
  extends React.ComponentProps<typeof CardHeader> {}

const ContentCardHeader = React.forwardRef<
  HTMLDivElement,
  ContentCardHeaderProps
>(({ className, ...props }, ref) => {
  return <CardHeader ref={ref} className={cn(className)} {...props} />;
});
ContentCardHeader.displayName = "ContentCardHeader";

// ============ Icon ============
interface ContentCardIconProps extends React.ComponentProps<"div"> {
  variant?: "default" | "gradient" | "muted";
}

const ContentCardIcon = React.forwardRef<HTMLDivElement, ContentCardIconProps>(
  ({ className, variant = "gradient", children, ...props }, ref) => {
    const variantClasses = {
      default: "p-2 rounded-xl shadow-xs",
      gradient:
        "p-2 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl shadow-xs",
      muted: "p-2 bg-muted rounded-xl shadow-xs",
    };

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], "shrink-0", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ContentCardIcon.displayName = "ContentCardIcon";

// ============ Title ============
interface ContentCardTitleProps extends React.ComponentProps<typeof CardTitle> {
  truncate?: boolean;
}

const ContentCardTitle = React.forwardRef<
  HTMLParagraphElement,
  ContentCardTitleProps
>(({ className, truncate = true, ...props }, ref) => {
  return (
    <CardTitle
      ref={ref}
      className={cn("text-lg", truncate && "line-clamp-1", className)}
      {...props}
    />
  );
});
ContentCardTitle.displayName = "ContentCardTitle";

// ============ Description ============
interface ContentCardDescriptionProps
  extends React.ComponentProps<typeof CardDescription> {
  lines?: number;
}

const ContentCardDescription = React.forwardRef<
  HTMLParagraphElement,
  ContentCardDescriptionProps
>(({ className, lines = 2, ...props }, ref) => {
  return (
    <CardDescription
      ref={ref}
      className={cn(`line-clamp-${lines}`, className)}
      {...props}
    />
  );
});
ContentCardDescription.displayName = "ContentCardDescription";

// ============ Header Action ============
interface ContentCardHeaderActionProps extends React.ComponentProps<"div"> {}

const ContentCardHeaderAction = React.forwardRef<
  HTMLDivElement,
  ContentCardHeaderActionProps
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("shrink-0 ml-2", className)} {...props} />
  );
});
ContentCardHeaderAction.displayName = "ContentCardHeaderAction";

export {
  ContentCardHeader,
  ContentCardIcon,
  ContentCardTitle,
  ContentCardDescription,
  ContentCardHeaderAction,
};
export type {
  ContentCardHeaderProps,
  ContentCardIconProps,
  ContentCardTitleProps,
  ContentCardDescriptionProps,
  ContentCardHeaderActionProps,
};
