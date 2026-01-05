"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Code, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { MetricItem } from "./MetricProjectTemplate";

interface MetricTemplateProps {
  tabId: string;
}

export function MetricPlatformTemplate({ tabId }: MetricTemplateProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!tabId) return;
      try {
        setLoading(true);
        setError(null);

        const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
        const isLocalEnv = runtimeEnv === "local";

        const url = isLocalEnv
          ? `${baseURL}/api/v1/metrics/platform/${tabId}`
          : `/api/v1/metrics/platform/${tabId}`;

        const response = await axios.get(url, {
          headers: { "Content-Type": "application/json" },
        });

        setData(response.data.data || response.data);
      } catch (err: any) {
        console.error("Error fetching metric data:", err);
        setError("Could not load live metrics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [tabId]);

  // 🌀 Loading
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading {tabId} data...</span>
      </div>
    );
  }

  // ⚠️ Error
  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 py-4 text-sm">{error}</div>
    );
  }

  // 📊 No Data
  if (!data) {
    return (
      <p className="text-gray-500 dark:text-gray-400 italic py-4">
        No data found for <b>{tabId}</b>.
      </p>
    );
  }

  // 💡 Metric Renderer
const renderMetricView = () => {
  switch (tabId) {
    case "cost":
      return (
        <div className="grid md:grid-cols-2 gap-4">
          <MetricCard title="Total Cost" value={`$${data.total_cost}`} />
          <MetricCard title="Traces" value={data.count_traces} />
          <MetricCard title="Observations" value={data.count_observations} />
          <MetricList
            title="Usage by Model"
            items={data.usage_by_model}
            fields={["model", "total_usage", "total_cost"]}
          />
        </div>
      );

    case "tokens":
      return (
        <div className="grid md:grid-cols-3 gap-4">
          <MetricCard title="Input Tokens" value={data.total_input_tokens} />
          <MetricCard title="Output Tokens" value={data.total_output_tokens} />
          <MetricCard title="Total Tokens" value={data.total_tokens} />
        </div>
      );

    // 🕒 Updated latency
    case "latency":
      if (!data.latency_by_model?.length) {
        return (
          <Card className="border-violet-100 dark:border-violet-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">
                Latency by Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 italic">
                No latency data available.
              </p>
            </CardContent>
          </Card>
        );
      }

      return (
        <MetricList
          title="Latency by Model"
          items={data.latency_by_model}
          fields={["model", "avg_latency_ms", "p50_latency_ms", "p95_latency_ms"]}
        />
      );

    // ⚙️ Updated efficiency
    case "efficiency":
      return (
        <div className="space-y-4">
          {/* Overall Summary */}
          <Card className="border-violet-100 dark:border-violet-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">
                Overall Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <MetricCard
                  title="Avg Cost / Request"
                  value={`$${data.overall.avg_cost_per_request}`}
                />
                <MetricCard
                  title="Avg Tokens / Request"
                  value={data.overall.avg_tokens_per_request}
                />
                <MetricCard
                  title="Cost / 1K Tokens"
                  value={`$${data.overall.cost_per_1000_tokens}`}
                />
                <MetricCard
                  title="Total Cost"
                  value={`$${data.overall.total_cost}`}
                />
                <MetricCard
                  title="Total Tokens"
                  value={data.overall.total_tokens}
                />
                <MetricCard
                  title="Total Requests"
                  value={data.overall.total_requests}
                />
              </div>
            </CardContent>
          </Card>

          {/* Per Model Breakdown */}
          <MetricList
            title="Efficiency by Model"
            items={data.by_model}
            fields={[
              "model",
              "avg_cost_per_request",
              "avg_tokens_per_request",
              "cost_per_1000_tokens",
              "total_cost",
              "total_tokens",
              "total_requests",
            ]}
          />
        </div>
      );

    case "errors":
      const { total_errors, error_rate, recent_errors } = data as {
        total_errors: number;
        error_rate: number;
        recent_errors: Record<string, any>[];
      };

      return (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <MetricCard title="Total Errors" value={total_errors} />
            <MetricCard
              title="Error Rate"
              value={error_rate ? `${error_rate.toFixed(2)}%` : "-"}
            />
          </div>

          {/* Dynamic Recent Errors Table */}
          <Card className="border-violet-100 dark:border-violet-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">
                Recent Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!recent_errors?.length ? (
                <p className="text-sm text-gray-500 italic">No recent errors 🎉</p>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b border-gray-200 dark:border-zinc-800">
                        {Object.keys(recent_errors[0]).map((key: string) => (
                          <th
                            key={key}
                            className="pb-1 pr-4 capitalize text-gray-500"
                          >
                            {key.replace(/_/g, " ")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recent_errors.map((err: Record<string, any>, i: number) => (
                        <tr
                          key={i}
                          className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900"
                        >
                          {Object.entries(err).map(([key, value]: [string, any]) => {
                            let displayValue: string | number | null = value ?? "-";

                            // 🕒 Format timestamps
                            if (
                              key.toLowerCase().includes("time") &&
                              typeof value === "string"
                            ) {
                              displayValue = new Date(value).toLocaleString();
                            }

                            // 🧠 Truncate long text (like error messages)
                            const isLong =
                              typeof displayValue === "string" &&
                              displayValue.length > 120;

                            return (
                              <td
                                key={key}
                                className="py-1 pr-4 text-gray-800 dark:text-gray-200 max-w-xs truncate"
                                title={
                                  isLong ? String(displayValue) : undefined
                                }
                              >
                                {isLong
                                  ? String(displayValue).slice(0, 120) + "..."
                                  : String(displayValue)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );


    case "model-distribution":
      return (
        <MetricList
          title="Model Distribution"
          items={data}
          fields={["model", "count", "percentage"]}
        />
      );

    case "success-rate":
      return (
        <div className="grid md:grid-cols-3 gap-4">
          <MetricCard title="Total Requests" value={data.total_requests} />
          <MetricCard
            title="Successful Requests"
            value={data.successful_requests}
          />
          <MetricCard
            title="Success Rate"
            value={`${data.success_rate}%`}
          />
        </div>
      );

case "throughput":
  // Destructure the available field directly from 'data'
  // Added avg_requests_per_hour as a relevant available metric to display
  const { total_requests, avg_requests_per_hour } = data; 
  
  // NOTE: Cost and Model Breakdown (avg_cost_per_request, by_model) 
  // are NOT available in the provided JSON. 
  // We'll use a placeholder value (N/A) or handle them as missing.

  return (
    <div className="space-y-4">
      
      {/* 1. Overall Avg Cost / Request (MISSING - Using N/A)
         Changed title to reflect a throughput measure available in the data, 
         replacing the missing cost metric, but keeping the original placeholder approach 
         for the missing cost data.
      */}
      <MetricCard
        title="Avg Requests / Hour" // Display available throughput metric instead of missing cost
        value={avg_requests_per_hour ? avg_requests_per_hour.toFixed(2) : 'N/A'}
      />
      
      {/* 2. Total Requests (AVAILABLE)
         Kept the original 'Total Requests' card.
      */}
      <MetricCard
        title="Total Requests"
        // Use the available data point
        value={total_requests} 
      />
      
      {/* 3. Throughput by Model (MISSING - Using Empty Array/Conditional)
         No changes needed here as the fallback logic is correct.
      */}
      <MetricList
        title="Throughput by Model (Data Missing)"
        // Pass an empty array as a fallback
        items={data.by_model || []} 
        fields={[
          "model",
          "avg_tokens_per_request",
          "avg_cost_per_request",
          "total_cost",
        ]}
      />
    </div>
  );

  case "accuracy": {
  const safeNumber = (val: any) => {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  };

  const total = safeNumber(data?.total_evaluations);
  const avg = safeNumber(data?.average_score);

  const zero = safeNumber(data?.score_distribution?.["0"]);
  const one = safeNumber(data?.score_distribution?.["1"]);

  const scoreNameList = Array.isArray(data?.by_score_name)
    ? data.by_score_name
    : [];

  return (
    <div className="flex flex-col gap-6">

      {/* ----------- CARDS SECTION ----------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Total Evaluations */}
        <div className="p-4 border rounded-lg shadow-sm">
          <div className="font-semibold">Total Evaluations</div>
          <div className="text-xl">{total}</div>
        </div>

        {/* Average Score */}
        <div className="p-4 border rounded-lg shadow-sm">
          <div className="font-semibold">Average Score</div>
          <div className="text-xl">{avg}</div>
        </div>

        {/* Score Distribution */}
        <div className="p-4 border rounded-lg shadow-sm">
          <div className="font-semibold mb-1">Score Distribution</div>
          <div>Score 0: {zero}</div>
          <div>Score 1: {one}</div>
        </div>

      </div>

      {/* ----------- TABLE SECTION ----------- */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-2 border">Score Name</th>
              <th className="p-2 border">Average Score</th>
              <th className="p-2 border">Total Count</th>
              <th className="p-2 border">Data Type</th>
            </tr>
          </thead>

          <tbody>
            {scoreNameList.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-3 border">
                  No data available
                </td>
              </tr>
            ) : (
              scoreNameList.map((item: any, i: number) => (
                <tr key={i}>
                  <td className="p-2 border">{item?.score_name || "-"}</td>
                  <td className="p-2 border">
                    {safeNumber(item?.average_score)}
                  </td>
                  <td className="p-2 border">
                    {safeNumber(item?.total_count)}
                  </td>
                  <td className="p-2 border">{item?.data_type || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}


    default:
      return (
        <pre className="text-xs bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
  }
};


  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4 space-y-3"
    >
      <div className="flex justify-between items-center">
        <h5 className="font-semibold text-gray-800 dark:text-gray-200 text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-violet-500" />
          {tabId.toUpperCase()} Metrics
        </h5>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRaw((prev) => !prev)}
          className="text-xs flex items-center gap-1"
        >
          <Code className="h-3.5 w-3.5" />
          {showRaw ? "Hide Raw" : "View Raw"}
        </Button>
      </div>

      {showRaw ? (
        <pre className="text-xs bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        renderMetricView()
      )}
    </motion.div>
  );
}

// 🎨 Subcomponent: MetricCard
function MetricCard({ title, value }: { title: string; value: any }) {
  return (
    <Card className="border-violet-100 dark:border-violet-900 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {value ?? "-"}
        </p>
      </CardContent>
    </Card>
  );
}

// 🎨 Subcomponent: MetricList
function MetricList({
  title,
  items,
  fields,
  emptyMessage,
}: {
  title: string;
  items: MetricItem[];
  fields: string[];
  emptyMessage?: string;
}) {
  if (!items?.length)
    return (
      <Card className="border-violet-100 dark:border-violet-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 italic">
            {emptyMessage ?? "No data available"}
          </p>
        </CardContent>
      </Card>
    );

  return (
    <Card className="border-violet-100 dark:border-violet-900 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto text-xs">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-zinc-800">
                {fields.map((f) => (
                  <th key={f} className="pb-1 pr-4 capitalize text-gray-500">
                    {f.replace("_", " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900"
                >
                  {fields.map((f) => (
                    <td key={f} className="py-1 pr-4 text-gray-800 dark:text-gray-200">
                      {row[f] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
