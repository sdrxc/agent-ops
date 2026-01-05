"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TraceExecutionContext } from "@/types/api";
import { FileText, Settings, Wrench, ExternalLink, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { PromptVersionBadge } from "./PromptVersionBadge";

interface ExecutionContextPanelProps {
  traceId: string;
  context: TraceExecutionContext;
}

export function ExecutionContextPanel({
  traceId,
  context,
}: ExecutionContextPanelProps) {
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
    <Card className="mb-4 border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <History className="h-4 w-4 text-amber-700" />
            Execution Context
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/traces/${traceId}`)}
            className="h-7 text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Trace
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Prompt */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-600 uppercase flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              System Prompt
            </label>
            <PromptVersionBadge version={context.promptVersion} timestamp={context.timestamp} />
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-md text-xs font-mono text-slate-700 max-h-32 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{context.systemPrompt}</pre>
          </div>
          <Badge
            variant="outline"
            className="mt-1.5 text-[10px] bg-amber-100 text-amber-700 border-amber-300"
          >
            Historical (Read-only)
          </Badge>
        </div>

        <Separator />

        {/* Model Configuration */}
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase flex items-center gap-1.5 mb-2">
            <Settings className="h-3 w-3" />
            Model Configuration
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white border border-slate-200 rounded p-2">
              <div className="text-slate-500 text-[10px] uppercase mb-0.5">Model</div>
              <div className="font-mono font-medium">{context.modelConfig.model}</div>
            </div>
            {context.modelConfig.temperature !== undefined && (
              <div className="bg-white border border-slate-200 rounded p-2">
                <div className="text-slate-500 text-[10px] uppercase mb-0.5">Temperature</div>
                <div className="font-mono font-medium">{context.modelConfig.temperature}</div>
              </div>
            )}
            {context.modelConfig.maxTokens !== undefined && (
              <div className="bg-white border border-slate-200 rounded p-2">
                <div className="text-slate-500 text-[10px] uppercase mb-0.5">Max Tokens</div>
                <div className="font-mono font-medium">{context.modelConfig.maxTokens}</div>
              </div>
            )}
            {context.modelConfig.topP !== undefined && (
              <div className="bg-white border border-slate-200 rounded p-2">
                <div className="text-slate-500 text-[10px] uppercase mb-0.5">Top P</div>
                <div className="font-mono font-medium">{context.modelConfig.topP}</div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Enabled Tools */}
        {context.enabledTools.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase flex items-center gap-1.5 mb-2">
              <Wrench className="h-3 w-3" />
              Enabled Tools
            </label>
            <div className="flex flex-wrap gap-1.5">
              {context.enabledTools.map((tool) => (
                <Badge
                  key={tool}
                  variant="outline"
                  className="text-[10px] bg-blue-50 text-blue-700 border-blue-200"
                >
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Original User Input */}
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">
            Original User Input
          </label>
          <div className="p-3 bg-slate-900 text-green-400 font-mono text-xs rounded-md overflow-x-auto">
            <pre>
              {typeof context.userInput === "string"
                ? context.userInput
                : JSON.stringify(context.userInput, null, 2)}
            </pre>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-[10px] text-slate-500 text-center pt-2 border-t">
          Executed: {formatTimestamp(context.timestamp)}
        </div>
      </CardContent>
    </Card>
  );
}

