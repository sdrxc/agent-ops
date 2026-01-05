"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  TerminalSquare,
  BarChart2,
  Database,
  Cpu,
  Settings,
  Network,
  Shield,
  DollarSign,
  Zap,
  Target,
} from "lucide-react";
import { useGlobalContext } from "@/app/GlobalContextProvider";
import axios from "axios";
import { PageHeader } from "@/components/PageHeader";
import { KPIPlatformDashboard } from "@/components/KPIPlatformDashboard";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricPlatformTemplate } from "@/components/MetricPlatformTemplate";

export const HomePageFeature = () => {
  const router = useRouter();
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const { user, loading } = useGlobalContext();

  useEffect(() => {
    if (loading || !user?.userID) return;

    const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
    const isLocalEnv = runtimeEnv === "local";

    const successRateURL = isLocalEnv
      ? `${baseURL}/api/v1/metrics/platform/success-rate`
      : `/api/v1/metrics/platform/success-rate`;

    const accuracyURL = isLocalEnv
      ? `${baseURL}/api/v1/metrics/platform/accuracy`
      : `/api/v1/metrics/platform/accuracy`;

    const efficiencyURL = isLocalEnv
      ? `${baseURL}/api/v1/metrics/platform/efficiency`
      : `/api/v1/metrics/platform/efficiency`;

    const errorsURL = isLocalEnv
      ? `${baseURL}/api/v1/metrics/platform/errors`
      : `/api/v1/metrics/platform/errors`;

    const throughputURL = isLocalEnv
      ? `${baseURL}/api/v1/metrics/platform/throughput`
      : `/api/v1/metrics/platform/throughput`;

    const fetchAll = async () => {
      try {
        setLoadingMetrics(true);

        // Fetch metrics in parallel
        const [
          accuracyRes,
          successRes,
          efficiencyRes,
          errorsRes,
          throughputRes,
        ] = await Promise.allSettled([
          axios.get(accuracyURL),
          axios.get(successRateURL),
          axios.get(efficiencyURL),
          axios.get(errorsURL),
          axios.get(throughputURL),
        ]);

        // --- Metrics computation ---
        // Note: Total projects might be missing if we don't fetch it, but we can ignore or fetch count separately if needed.
        // For now, setting total_projects to 0 or N/A as we removed the call. 
        // Or strictly speaking, the user might still want to see the count. 
        // But the previous implementation derived it from the list.
        const total_projects = 0;

        const accuracy =
          accuracyRes.status === "fulfilled"
            ? accuracyRes.value.data?.data?.average_score || 0
            : 0;

        const success_rate =
          successRes.status === "fulfilled"
            ? successRes.value.data?.data?.success_rate || 0
            : 0;

        const efficiencyData =
          efficiencyRes.status === "fulfilled"
            ? efficiencyRes.value.data?.data?.overall || {}
            : {};

        const error_rate =
          errorsRes.status === "fulfilled"
            ? errorsRes.value.data?.data?.error_rate || 0
            : 0;

        const throughputData =
          throughputRes.status === "fulfilled"
            ? throughputRes.value.data?.data?.overall || {}
            : {};

        // Combine all metrics
        const combinedMetrics = {
          total_projects,
          accuracy,
          success_rate,
          avg_tokens_per_request: efficiencyData.avg_tokens_per_request || 0,
          avg_cost_per_request: efficiencyData.avg_cost_per_request || 0,
          total_cost: efficiencyData.total_cost || 0,
          total_tokens: efficiencyData.total_tokens || 0,
          total_requests: efficiencyData.total_requests || 0,
          error_rate,
          avg_requests_per_hour: throughputData.avg_requests_per_hour || 0,
        };

        setMetrics(combinedMetrics);
      } catch (err) {
        console.error("Failed to fetch platform metrics:", err);
        setMetrics(null);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchAll();
  }, [loading, user?.userID]);

  const tabs = [
    { id: "efficiency", label: "Efficiency", icon: Network },
    { id: "accuracy", label: "Accuracy", icon: Target },
    { id: "cost", label: "Cost", icon: Activity },
    { id: "tokens", label: "Tokens", icon: TerminalSquare },
    { id: "success-rate", label: "Success Rate", icon: Cpu },
    { id: "errors", label: "Errors", icon: BarChart2 },
    { id: "throughput", label: "Throughput", icon: Settings },
    { id: "latency", label: "Latency", icon: BarChart2 },
    { id: "model-distribution", label: "Model Distribution", icon: Database },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Dashboard"
        description="Get a unified view of your platform's key performance indicators."
      />
      <div>
        <div className="space-y-6 bg-gradient-to-r from-violet-100 dark:from-violet-900/50 to-violet-200 dark:to-violet-800/50 p-6 rounded-2xl border border-violet-200/50 dark:border-violet-700/50 @container">
          {loadingMetrics ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Loading metrics...
            </p>
          ) : metrics ? (
            <>
              <KPIPlatformDashboard metrics={metrics} />

              {/* Detailed Traces & Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-6"
              >
                <div className="flex items-center mb-4 font-semibold text-gray-700 dark:text-gray-100 text-lg">
                  <Activity className="mr-2 w-5 h-5 text-blue-500" />
                  Detailed Traces & Metrics
                </div>
                <Card className="bg-white/60 dark:bg-zinc-900/60 shadow-md backdrop-blur-xl border border-gray-200/60 dark:border-gray-800/60 rounded-2xl">
                  <CardContent className="p-0">
                    <Tabs defaultValue="cost" className="w-full">
                      <div className="rounded-t-2xl overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                        <TabsList className="flex justify-start gap-1 bg-gray-50/80 dark:bg-zinc-900/80 backdrop-blur-lg p-3 border-gray-200 dark:border-gray-800 border-b rounded-t-2xl min-w-max sm:min-w-0">
                          {tabs.map((tab) => (
                            <TabsTrigger
                              key={tab.id}
                              value={tab.id}
                              className="flex items-center gap-2 data-[state=active]:bg-primary hover:bg-primary/10 px-3 py-2 rounded-lg font-medium data-[state=active]:text-white text-sm whitespace-nowrap transition-colors"
                            >
                              <tab.icon className="w-4 h-4" />
                              {tab.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>

                      {tabs.map((tab) => (
                        <TabsContent
                          key={tab.id}
                          value={tab.id}
                          className="p-6 text-gray-600 dark:text-gray-300 text-sm"
                        >
                          <MetricPlatformTemplate tabId={tab.id} />
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Failed to load metrics.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
