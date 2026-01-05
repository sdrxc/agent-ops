"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { History } from "lucide-react";

interface PromptVersionBadgeProps {
  version: string;
  timestamp: string;
}

export function PromptVersionBadge({
  version,
  timestamp,
}: PromptVersionBadgeProps) {
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1 cursor-help"
        >
          <History className="h-2.5 w-2.5" />
          {version}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">
          Historical prompt version used during trace execution
          <br />
          <span className="text-slate-400">{formatTimestamp(timestamp)}</span>
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

