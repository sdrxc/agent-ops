"use client";

import { TraceStep, OrchestrationContext, ToolExecution } from "@/types/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BrainCircuit, Bot, Terminal } from "lucide-react";

interface TraceDetailsPanelProps {
  orchestrationContext: OrchestrationContext;
  selectedStep?: TraceStep;
}

export function TraceDetailsPanel({
  orchestrationContext,
  selectedStep,
}: TraceDetailsPanelProps) {
  const toolExecution = selectedStep?.toolExecution;
  const hasError = selectedStep?.status === "error";

  return (
    <div className="w-1/2 bg-slate-50 p-6 overflow-y-auto">
      {/* Orchestration Context */}
      <Card className="mb-4">
        <CardHeader>
          <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
            <BrainCircuit size={16} className="text-indigo-600" />
            Orchestration Context
          </h4>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Routing Decision
            </label>
            <p className="text-sm text-slate-700 mt-1">
              {orchestrationContext.routingDecision}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Active Sub-Agents
            </label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {orchestrationContext.activeSubAgents.map((agent) => (
                <Badge
                  key={agent}
                  variant="outline"
                  className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-medium flex items-center gap-1"
                >
                  <Bot size={12} />
                  {agent}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tool Execution Details (shown when a tool step is selected) */}
      {selectedStep && selectedStep.type === "tool" && toolExecution && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
                <Terminal size={16} />
                {selectedStep.name}
              </h4>
              {hasError && (
                <Badge
                  variant="destructive"
                  className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded"
                >
                  Error
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input JSON */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Input (JSON)
              </label>
              <div className="mt-1 p-3 bg-slate-900 text-green-400 font-mono text-xs rounded-md overflow-x-auto">
                <pre>{JSON.stringify(toolExecution.input, null, 2)}</pre>
              </div>
            </div>

            {/* Output / Error */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Output / Error
              </label>
              {toolExecution.error ? (
                <div className="mt-1 p-3 bg-red-50 text-red-700 font-mono text-xs rounded-md border border-red-100 whitespace-pre-wrap">
                  {toolExecution.error}
                </div>
              ) : toolExecution.output ? (
                <div className="mt-1 p-3 bg-slate-50 text-slate-700 font-mono text-xs rounded-md border border-slate-200 whitespace-pre-wrap">
                  {toolExecution.output}
                </div>
              ) : (
                <div className="mt-1 p-3 bg-slate-50 text-slate-400 font-mono text-xs rounded-md border border-slate-200 italic">
                  No output available
                </div>
              )}
            </div>

            {/* Metadata */}
            {toolExecution.metadata && (
              <>
                <Separator />
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">
                    Metadata
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {toolExecution.metadata.model && (
                      <div className="text-xs text-slate-600">
                        <span className="font-medium">Model:</span>{" "}
                        {toolExecution.metadata.model}
                      </div>
                    )}
                    {toolExecution.metadata.retries && (
                      <div className="text-xs text-slate-600">
                        <span className="font-medium">Retries:</span>{" "}
                        {toolExecution.metadata.retries}
                      </div>
                    )}
                    {toolExecution.metadata.cost !== undefined && (
                      <div className="text-xs text-slate-600">
                        <span className="font-medium">Cost:</span> $
                        {toolExecution.metadata.cost.toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Default message when no tool step is selected */}
      {(!selectedStep || selectedStep.type !== "tool") && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-slate-500">
              {selectedStep
                ? "Select a tool step to view execution details"
                : "Select a step from the timeline to view details"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

