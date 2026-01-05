"use client";

import { TraceStep } from "@/types/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TraceStepItem } from "./TraceStepItem";

interface TraceTimelineProps {
  steps: TraceStep[];
  selectedStepId?: number;
  traceId: string;
  onStepSelect?: (stepId: number) => void;
}

export function TraceTimeline({
  steps,
  selectedStepId,
  traceId,
  onStepSelect,
}: TraceTimelineProps) {
  // Calculate max duration for progress bar scaling
  const maxDuration = Math.max(...steps.map((s) => s.duration), 2000);

  return (
    <div className="w-1/2 border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Multi-Agent Execution Trace</h3>
        <span className="text-xs font-mono text-slate-500">{traceId}</span>
      </div>
      <div className="p-0 overflow-y-auto flex-1 bg-slate-50/30">
        {steps.map((step) => (
          <TraceStepItem
            key={step.id}
            step={step}
            isSelected={selectedStepId === step.id}
            maxDuration={maxDuration}
            onClick={() => onStepSelect?.(step.id)}
          />
        ))}
      </div>
    </div>
  );
}

