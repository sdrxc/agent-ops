"use client";

import { TraceStep } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, Bot, AlertCircle, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TraceStepItemProps {
  step: TraceStep;
  isSelected?: boolean;
  maxDuration: number;
  onClick?: () => void;
}

export function TraceStepItem({
  step,
  isSelected = false,
  maxDuration,
  onClick,
}: TraceStepItemProps) {
  const isOrchestrator = step.agent === "Orchestrator";
  const isSubAgent = !isOrchestrator && step.agent !== "System";
  const isSystem = step.agent === "System";

  // Calculate progress bar width (minimum 5% for visibility)
  const progressWidth = Math.max((step.duration / maxDuration) * 100, 5);

  // Determine colors based on agent type and status
  const getAgentBadgeClasses = () => {
    if (isOrchestrator) {
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
    if (isSystem) {
      return "bg-slate-100 text-slate-600 border-slate-200";
    }
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  const getProgressBarColor = () => {
    if (step.status === "error") {
      return "bg-red-400";
    }
    if (isOrchestrator) {
      return "bg-indigo-400";
    }
    if (isSubAgent) {
      return "bg-blue-400";
    }
    return "bg-slate-300";
  };

  return (
    <div
      className={cn(
        "relative group cursor-pointer border-b border-slate-100 hover:bg-white transition-colors",
        isSelected && "bg-white"
      )}
      onClick={onClick}
    >
      <div className="flex items-stretch">
        {/* Timeline Column */}
        <div className="w-16 flex-shrink-0 border-r border-slate-100 bg-slate-50 flex flex-col items-end pr-2 py-3">
          <span className="text-[10px] font-mono text-slate-400">
            +{step.start}ms
          </span>
          <span className="text-[10px] font-mono text-slate-300">
            {step.duration}ms
          </span>
        </div>

        {/* Content Column */}
        <div className="flex-1 p-3">
          <div className="flex items-center gap-2 mb-1">
            {/* Agent Badge */}
            <Badge
              variant="outline"
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                getAgentBadgeClasses()
              )}
            >
              {isOrchestrator && <BrainCircuit size={10} />}
              {isSubAgent && <Bot size={10} />}
              {step.agent}
            </Badge>

            {/* Step Type Badge */}
            <span className="text-[10px] text-slate-400 font-mono">
              {step.type}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isSubAgent && (
              <ArrowDownRight size={14} className="text-slate-300 ml-2" />
            )}
            <div
              className={cn(
                "text-sm font-medium",
                step.status === "error" ? "text-red-600" : "text-slate-700"
              )}
            >
              {step.name}
            </div>
            {step.status === "error" && (
              <AlertCircle size={14} className="text-red-500" />
            )}
          </div>

          {/* Visualization Bar */}
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full w-full overflow-hidden">
            <div
              className={cn("h-full rounded-full", getProgressBarColor())}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

