"use client";

import * as React from "react";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

// ============ Content ============
interface ContentCardContentProps
  extends React.ComponentProps<typeof CardContent> {}

const ContentCardContent = React.forwardRef<
  HTMLDivElement,
  ContentCardContentProps
>(({ className, ...props }, ref) => {
  return (
    <CardContent
      ref={ref}
      className={cn("space-y-4 flex-grow", className)}
      {...props}
    />
  );
});
ContentCardContent.displayName = "ContentCardContent";

// ============ Status ============
type StatusVariant = "active" | "inactive" | "error" | "training" | "testing";

interface ContentCardStatusProps extends React.ComponentProps<"div"> {
  status?: StatusVariant;
  variant?: "badge" | "dot" | "pill";
  showIcon?: boolean;
  animated?: boolean;
  label?: string;
}

const ContentCardStatus = React.forwardRef<
  HTMLDivElement,
  ContentCardStatusProps
>(
  (
    {
      className,
      status = "active",
      variant = "badge",
      showIcon = true,
      animated = true,
      label,
      ...props
    },
    ref
  ) => {
    const statusConfig = {
      active: {
        label: "ACTIVE",
        badgeClass:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800",
        dotClass: "bg-green-500",
        icon: <CheckCircle className="w-3 h-3" />,
      },
      inactive: {
        label: "INACTIVE",
        badgeClass:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700",
        dotClass: "bg-gray-400",
        icon: <XCircle className="w-3 h-3" />,
      },
      error: {
        label: "ERROR",
        badgeClass:
          "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800",
        dotClass: "bg-red-500",
        icon: <XCircle className="w-3 h-3" />,
      },
      training: {
        label: "TRAINING",
        badgeClass:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800",
        dotClass: "bg-blue-500",
        icon: <CheckCircle className="w-3 h-3" />,
      },
      testing: {
        label: "TESTING",
        badgeClass:
          "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800",
        dotClass: "bg-yellow-500",
        icon: <CheckCircle className="w-3 h-3" />,
      },
    };

    const config = statusConfig[status];
    const displayLabel = label || config.label;

    if (variant === "dot") {
      return (
        <div
          ref={ref}
          className={cn("flex items-center space-x-2", className)}
          {...props}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              config.dotClass,
              animated &&
                (status === "active" ||
                  status === "error" ||
                  status === "training" ||
                  status === "testing") &&
                "animate-pulse"
            )}
          />
          <span className="text-xs font-medium">{displayLabel}</span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center space-x-2", className)}
        {...props}
      >
        <Badge
          variant="outline"
          className={cn(config.badgeClass, "text-xs font-medium shadow-xs")}
        >
          {showIcon && <span className="mr-1">{config.icon}</span>}
          {displayLabel}
        </Badge>
      </div>
    );
  }
);
ContentCardStatus.displayName = "ContentCardStatus";

// ============ Metadata ============
interface ContentCardMetadataProps extends React.ComponentProps<"div"> {
  variant?: "default" | "panel";
}

const ContentCardMetadata = React.forwardRef<
  HTMLDivElement,
  ContentCardMetadataProps
>(({ className, variant = "default", children, ...props }, ref) => {
  if (variant === "panel") {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-gray-50/80 dark:bg-gray-800/80 rounded-lg p-3 space-y-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn("space-y-1 text-xs text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  );
});
ContentCardMetadata.displayName = "ContentCardMetadata";

// ============ Metadata Item ============
interface MetadataItemProps extends React.ComponentProps<"div"> {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

const MetadataItem = React.forwardRef<HTMLDivElement, MetadataItemProps>(
  ({ className, label, value, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between text-sm",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
          {icon}
          <span>{label}:</span>
        </div>
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          {value}
        </span>
      </div>
    );
  }
);
MetadataItem.displayName = "MetadataItem";

// ============ Badges ============
interface ContentCardBadgesProps extends React.ComponentProps<"div"> {
  maxVisible?: number;
}

const ContentCardBadges = React.forwardRef<
  HTMLDivElement,
  ContentCardBadgesProps
>(({ className, maxVisible, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-wrap gap-1", className)}
      {...props}
    >
      {children}
    </div>
  );
});
ContentCardBadges.displayName = "ContentCardBadges";

export {
  ContentCardContent,
  ContentCardStatus,
  ContentCardMetadata,
  MetadataItem,
  ContentCardBadges,
};
export type {
  ContentCardContentProps,
  ContentCardStatusProps,
  ContentCardMetadataProps,
  MetadataItemProps,
  ContentCardBadgesProps,
};
