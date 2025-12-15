"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Gauge,
  Activity,
  TerminalSquare,
  BarChart2,
  Settings,
  Database,
  Cpu,
  Network,
  Bot,
  Loader2,
  Play,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { KPIAgentDashboard } from "@/components/KPIAgentDashboard";
import { AgentTestDialog } from "@/components/AgentTestDialog";
import { MetricAgentTemplate } from "@/components/MetricAgentTemplate";

export default function AgentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [agentDetails, setAgentDetails] = useState<any>(null);
  const [agentMetrics, setAgentMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch agent details
  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
        const isLocalEnv = runtimeEnv === "local";
        const url = isLocalEnv
          ? `${baseURL}/api/agentDetails`
          : `/api/agentDetails`;

        const response = await axios.post(url, { agentID: id });
        setAgentDetails(response?.data?.data || null);
      } catch (error: any) {
        console.error("Error fetching agent details:", error);
        setError("Failed to load agent details.");
        setAgentDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentDetails();
  }, [id]);

  // Fetch metrics
useEffect(() => {
  const fetchMetrics = async () => {
    if (!id) return;

    try {
      const results = await Promise.allSettled([
        axios.get(`/api/v1/metrics/agent/${id}/accuracy`),
        axios.get(`/api/v1/metrics/agent/${id}/efficiency`),
        axios.get(`/api/v1/metrics/agent/${id}/success-rate`),
        axios.get(`/api/v1/metrics/agent/${id}/errors`),
        axios.get(`/api/v1/metrics/agent/${id}/throughput`),
      ]);

      // Safe fallback helper → prevents undefined propagation
      const safeGet = (res: any, path: string, fallback = 0) => {
        try {
          return path
            .split(".")
            .reduce((acc, k) => acc?.[k], res) ?? fallback;
        } catch {
          return fallback;
        }
      };

      const [
        accuracyRes,
        efficiencyRes,
        successRateRes,
        errorsRes,
        throughputRes,
      ] = results;

      const accuracyData =
        accuracyRes.status === "fulfilled"
          ? accuracyRes.value?.data?.data
          : {};

      const efficiencyData =
        efficiencyRes.status === "fulfilled"
          ? efficiencyRes.value?.data?.data?.overall
          : {};

      const successRateData =
        successRateRes.status === "fulfilled"
          ? successRateRes.value?.data?.data
          : {};

      const errorsData =
        errorsRes.status === "fulfilled"
          ? errorsRes.value?.data?.data
          : {};

      const throughputData =
        throughputRes.status === "fulfilled"
          ? throughputRes.value?.data?.data
          : {};

      const metrics = {
        avg_cost_per_request: safeGet(efficiencyData, "avg_cost_per_request"),
        avg_tokens_per_request: safeGet(
          efficiencyData,
          "avg_tokens_per_request"
        ),
        total_cost: safeGet(efficiencyData, "total_cost"),
        total_tokens: safeGet(efficiencyData, "total_tokens"),
        total_requests: safeGet(efficiencyData, "total_requests"),

        success_rate: safeGet(successRateData, "success_rate"),
        accuracy: safeGet(accuracyData, "average_score"),
        error_rate: safeGet(errorsData, "error_rate"),
        avg_requests_per_hour: safeGet(throughputData, "avg_requests_per_hour"),
      };

      setAgentMetrics(metrics);
    } catch (err) {
      console.error("Error fetching agent metrics:", err);
      setAgentMetrics({
        avg_cost_per_request: 0,
        avg_tokens_per_request: 0,
        total_cost: 0,
        total_tokens: 0,
        total_requests: 0,
        success_rate: 0,
        accuracy: 0,
        error_rate: 0,
        avg_requests_per_hour: 0,
      });
    }
  };

  fetchMetrics();
}, [id]);


  const showPlayground =
    (agentDetails?.agentdeploymenttype === "deployed" || false) &&
    !!agentDetails?.agentAPI;

  return (
    <Layout>
      <div className="relative min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Back button */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Loading agent details...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <p className="text-center text-red-500 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Main Content */}
          {!loading && !error && agentDetails && (
            <>
              {/* Agent Metadata */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <CardTitle className="text-3xl font-semibold flex items-center gap-3 text-gray-900 dark:text-gray-50">
                        <Bot className="h-7 w-7 text-primary" />
                        {agentDetails?.name ?? "Unnamed Agent"}
                      </CardTitle>
                      <Badge
                        variant={
                          agentDetails?.status === "active"
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize px-3 py-1 text-sm"
                      >
                        {agentDetails?.status ?? "unknown"}
                      </Badge>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      ID: {agentDetails?.id ?? "N/A"}
                    </p>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      <span className="font-semibold">Description:</span>{" "}
                      {agentDetails?.description || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Version:</span>{" "}
                      {agentDetails?.version || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Model:</span>{" "}
                      {agentDetails?.model || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Last Activity:</span>{" "}
                      {agentDetails?.lastActivity || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Tags:</span>{" "}
                      {agentDetails?.tags?.length
                        ? agentDetails.tags.join(", ")
                        : "None"}
                    </div>
                    <div>
                      <span className="font-semibold">Type:</span>{" "}
                      <Badge variant="outline" className="capitalize">
                        {agentDetails?.agentdeploymenttype || "N/A"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* KPI Dashboard */}
              {agentMetrics && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-100 flex items-center pb-3 mt-6">
                    <Gauge className="h-5 w-5 mr-2 text-orange-500" />
                    Agent Level Performance Dashboard
                  </h4>
                  <div className="space-y-6 bg-gradient-to-r from-violet-100 dark:from-violet-900/50 to-violet-200 dark:to-violet-800/50 p-6 rounded-2xl border border-violet-200/50 dark:border-violet-700/50 @container">
                    <KPIAgentDashboard metrics={agentMetrics} />
                  </div>
                </motion.div>
              )}

              {/* Tabs Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-100 flex items-center pb-3 mt-6">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  Detailed Traces & Metrics
                </h4>

                <Card className="rounded-2xl shadow-md border border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
                  <CardContent className="p-0">
                    <Tabs defaultValue="cost" className="w-full">
                      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 rounded-t-2xl">
                        <TabsList className="flex min-w-max sm:min-w-0 justify-start gap-1 p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-zinc-900/80 backdrop-blur-lg rounded-t-2xl">
                          {tabs.map((tab) => (
                            <TabsTrigger
                              key={tab.id}
                              value={tab.id}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-white"
                            >
                              <tab.icon className="h-4 w-4" />
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
                          {agentDetails?.id ? (
                            <MetricAgentTemplate
                              tabId={tab.id}
                              agentId={agentDetails.id}
                            />
                          ) : (
                            <p>No data available for this agent.</p>
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Floating Action Button */}
              {showPlayground && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="fixed bottom-8 right-8 z-50"
                >
                  <Button
                    size="lg"
                    onClick={() => setTestDialogOpen(true)}
                    className="rounded-full shadow-xl bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-all flex items-center gap-2 px-6 py-6"
                  >
                    <Play className="h-5 w-5" />
                    <span className="hidden sm:inline">Agent Playground</span>
                  </Button>
                </motion.div>
              )}

              <AgentTestDialog
                open={testDialogOpen}
                onClose={() => setTestDialogOpen(false)}
                agent={agentDetails}
              />
            </>
          )}

          {/* No Agent Details */}
          {!loading && !error && !agentDetails && (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No details found for this agent.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
