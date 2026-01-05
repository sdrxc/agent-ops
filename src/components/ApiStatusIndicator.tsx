"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Circle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type ApiStatus = "full" | "partial" | "none";

// Stable reference for empty endpoints to prevent infinite re-renders
const EMPTY_ENDPOINTS: string[] = [];

interface ApiStatusIndicatorProps {
  status: ApiStatus;
  showLabel?: boolean;
  componentName?: string;
  endpoints?: string[];
  className?: string;
}

const statusConfig = {
  full: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    label: "Full API",
    description: "All features have API connections",
  },
  partial: {
    icon: AlertCircle,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    label: "Partial API",
    description: "Some features have API connections",
  },
  none: {
    icon: Circle,
    color: "text-gray-400 dark:text-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
    label: "No API",
    description: "No API connections (mock/static data)",
  },
};

export function ApiStatusIndicator({
  status,
  showLabel = false,
  componentName,
  endpoints = EMPTY_ENDPOINTS,
  className,
}: ApiStatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const tooltipContent = (
    <div className="space-y-1">
      <div className="font-semibold">{config.label}</div>
      <div className="text-xs text-muted-foreground">{config.description}</div>
      {componentName && (
        <div className="text-xs text-muted-foreground mt-1">
          Component: {componentName}
        </div>
      )}
      {endpoints.length > 0 && (
        <div className="text-xs text-muted-foreground mt-1">
          <div className="font-medium">Endpoints:</div>
          <ul className="list-disc list-inside space-y-0.5 mt-0.5">
            {endpoints.slice(0, 5).map((endpoint, idx) => (
              <li key={idx} className="truncate">
                {endpoint}
              </li>
            ))}
            {endpoints.length > 5 && (
              <li className="text-muted-foreground">
                +{endpoints.length - 5} more
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded",
            config.bgColor,
            className
          )}
        >
          <Icon className={cn("size-3", config.color)} />
          {showLabel && (
            <span className={cn("text-xs font-medium", config.color)}>
              {config.label}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
}

