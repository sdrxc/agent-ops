"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { TraceTimeline } from "@/components/traces/TraceTimeline";
import { TraceDetailsPanel } from "@/components/traces/TraceDetailsPanel";
import { ArrowLeft, Play, Loader2 } from "lucide-react";
import { TraceDetail } from "@/types/api";
import axios from "axios";
import { extractTraceContext, createPlaygroundUrl } from "@/lib/trace-context";

export default function TraceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const traceId = params.id as string;
  const [selectedStepId, setSelectedStepId] = useState<number | undefined>(
    undefined
  );

  // Fetch trace data
  const { data, isLoading, error } = useQuery<TraceDetail>({
    queryKey: ["trace", traceId],
    queryFn: async () => {
      const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
      const isLocalEnv = runtimeEnv === "local";

      const url = isLocalEnv
        ? `${baseURL}/api/traces/${traceId}`
        : `/api/traces/${traceId}`;

      const response = await axios.get(url, {
        headers: { "Content-Type": "application/json" },
      });

      // Handle both response formats
      const traceData = response.data.data || response.data;
      return traceData;
    },
    enabled: !!traceId,
  });

  // Compute effective selected step ID (user selection or auto-select)
  // Using direct computation instead of useMemo to avoid compiler warnings
  let effectiveSelectedStepId: number | undefined = selectedStepId;
  if (effectiveSelectedStepId === undefined && data?.steps) {
    const errorStep = data.steps.find((s) => s.status === "error");
    if (errorStep) {
      effectiveSelectedStepId = errorStep.id;
    } else {
      const toolStep = data.steps.find((s) => s.type === "tool");
      if (toolStep) {
        effectiveSelectedStepId = toolStep.id;
      }
    }
  }

  // Find selected step
  const selectedStep = data?.steps.find((s) => s.id === effectiveSelectedStepId);

  const handleOpenPlayground = () => {
    if (!data) {
      // Fallback if no data available
      router.push(`/simulator?traceId=${encodeURIComponent(traceId)}`);
      return;
    }

    const executionContext = extractTraceContext(data);
    if (executionContext) {
      // Use trace context to hydrate simulator
      const url = createPlaygroundUrl(traceId, executionContext);
      router.push(url);
    } else {
      // Fallback: navigate with trace ID only
      router.push(`/simulator?traceId=${encodeURIComponent(traceId)}`);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading trace details...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400 mb-2">
              Failed to load trace details
            </p>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-full space-y-4">
        {/* Header */}
        <PageHeader
          title="Trace Analysis"
          backButton={{ href: "/logs", label: "Back to Logs" }}
          actions={
            <Button
              onClick={handleOpenPlayground}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium flex items-center gap-2 shadow-sm"
            >
              <Play size={16} />
              Open in Playground
            </Button>
          }
        />

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex overflow-hidden">
          <TraceTimeline
            steps={data.steps}
            selectedStepId={selectedStepId}
            traceId={data.id}
            onStepSelect={setSelectedStepId}
          />
          <TraceDetailsPanel
            orchestrationContext={data.orchestrationContext}
            selectedStep={selectedStep}
          />
        </div>
      </div>
    </Layout>
  );
}

