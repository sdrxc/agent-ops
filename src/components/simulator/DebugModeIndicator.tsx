"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bug, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { TraceExecutionContext } from "@/types/api";

interface DebugModeIndicatorProps {
  traceId: string;
  traceContext: TraceExecutionContext;
}

export function DebugModeIndicator({
  traceId,
  traceContext,
}: DebugModeIndicatorProps) {
  const router = useRouter();

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Bug className="h-4 w-4 text-amber-700" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-amber-900">
            Debugging Trace:
          </span>
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 border-amber-300 font-mono text-xs"
          >
            {traceId}
          </Badge>
          <span className="text-xs text-amber-700">
            {formatTimestamp(traceContext.timestamp)}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/traces/${traceId}`)}
        className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 h-7"
      >
        <ExternalLink className="h-3 w-3 mr-1.5" />
        View Full Trace
      </Button>
    </div>
  );
}

