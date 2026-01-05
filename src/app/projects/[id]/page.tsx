"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Folder,
  User,
  Users,
  Calendar,
  Clock,
  Gauge,
  AlertTriangle,
  Activity,
  TerminalSquare,
  BarChart2,
  Settings,
  Network,
  Database,
  Cpu,
  Target,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGlobalContext } from "@/app/GlobalContextProvider";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";
import { KPIProjectDashboard } from "@/components/KPIProjectDashboard";
import { AgentDeploymentDashboard } from "@/domains/agents/dashboard/AgentDeploymentDashboard";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricProjectTemplate } from "@/components/MetricProjectTemplate";
import { ProjectDashboardMetrics } from "@/types/api";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

// --- Project Interface ---
interface Project {
  projectID: string;
  projectName: string;
  Description?: string;
  Creation: string;
  LastUpdate: string;
  agentsCount: number;
  CreateBy: string;
  tags?: string[];
}

// --- DetailCard Component ---
interface DetailCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}
const DetailCard: React.FC<DetailCardProps> = ({ icon, label, value }) => (
  <Card className="shadow-sm transition-all hover:shadow-md border-l-4 border-primary/50 dark:border-primary/70">
    <CardContent className="flex items-center space-x-4 p-4">
      <div className="p-2 bg-primary/10 text-primary rounded-full shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          {value}
        </p>
      </div>
    </CardContent>
  </Card>
);

// --- Main Component ---
export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectID = resolvedParams.id;

  const router = useRouter();
  const { user } = useGlobalContext();
  const { projectDetailsMetricsEnabled } = useFeatureFlags();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [projectMetrics, setProjectMetrics] = useState<ProjectDashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(false);

  const fallbackProject: Project = {
    projectID,
    projectName: "Untitled Project",
    Description: "Project details could not be loaded.",
    Creation: new Date().toISOString(),
    LastUpdate: new Date().toISOString(),
    agentsCount: 0,
    CreateBy: user?.userName || "Unknown User",
    tags: ["unavailable"],
  };

  // --- Fetch Project Details ---
  useEffect(() => {
    if (!user?.userID) {
      console.log("User ID not available yet, skipping fetch.");
      return;
    }

    const fetchProjectDetails = async () => {
      const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
      const isLocalEnv = runtimeEnv === "local";
      const url = isLocalEnv
        ? `${baseURL}/api/projectDetails`
        : `/api/projectDetails`;

      try {
        setLoading(true);
        const response = await axios.post(
          url,
          { projectID, userID: user.userID },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.status === 200 || response.status === 201) {
          setProject(response.data?.data?.project);
        } else {
          setFetchError(true);
          setProject(fallbackProject);
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
        setFetchError(true);
        setProject(fallbackProject);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectID, user?.userID]);

  // --- Fetch Project Metrics ---
// --- Fetch Project Metrics ---
useEffect(() => {
  if (!projectID) return;

  const fetchProjectMetrics = async () => {
    try {
      setMetricsLoading(true);
      setMetricsError(false);

      const endpoints = [
        `/api/v1/metrics/project/${projectID}/accuracy`,
        `/api/v1/metrics/project/${projectID}/success-rate`,
        `/api/v1/metrics/project/${projectID}/efficiency`,
        `/api/v1/metrics/project/${projectID}/errors`,
        `/api/v1/metrics/project/${projectID}/throughput`,
      ];

      // Use ALL SETTLED instead of ALL
      const results = await Promise.allSettled(
        endpoints.map((url) => axios.get(url))
      );

      // Helper: safe extraction
      const safeData = (res: any, path: string, fallback = 0) => {
        try {
          return path.split(".").reduce((acc, key) => acc?.[key], res) ?? fallback;
        } catch {
          return fallback;
        }
      };

      const [
        accuracyRes,
        successRateRes,
        efficiencyRes,
        errorsRes,
        throughputRes,
      ] = results;

      const accuracyData =
        accuracyRes.status === "fulfilled" ? accuracyRes.value.data?.data : {};
      const successRateData =
        successRateRes.status === "fulfilled" ? successRateRes.value.data?.data : {};
      const efficiencyData =
        efficiencyRes.status === "fulfilled"
          ? efficiencyRes.value.data?.data?.overall
          : {};
      const errorsData =
        errorsRes.status === "fulfilled" ? errorsRes.value.data?.data : {};
      const throughputData =
        throughputRes.status === "fulfilled" ? throughputRes.value.data?.data : {};

      // Create metrics payload with fallback values
      const metrics = {
        accuracy: safeData(accuracyData, "average_score"),
        success_rate: safeData(successRateData, "success_rate"),
        avg_tokens_per_request: safeData(efficiencyData, "avg_tokens_per_request"),
        avg_cost_per_request: safeData(efficiencyData, "avg_cost_per_request"),
        total_cost: safeData(efficiencyData, "total_cost"),
        total_tokens: safeData(efficiencyData, "total_tokens"),
        total_requests: safeData(efficiencyData, "total_requests"),
        error_rate: safeData(errorsData, "error_rate"),
        avg_requests_per_hour: safeData(throughputData, "avg_requests_per_hour"),
      };

      setProjectMetrics(metrics);
    } catch (err) {
      console.error("Error fetching project metrics:", err);
      setMetricsError(true);
    } finally {
      setMetricsLoading(false);
    }
  };

  fetchProjectMetrics();
}, [projectID, project?.agentsCount]);


  if (loading) {
    return (
      <div className="text-center py-40 text-gray-500 dark:text-gray-400 animate-pulse">
        <Folder className="h-8 w-8 mx-auto mb-2 text-primary" />
        <p>Loading project details...</p>
      </div>
    );
  }

  const activeProject = project || fallbackProject;

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
    <Layout>
      <div className="flex flex-col h-full space-y-6">
        {/* Header */}
        <PageHeader
          backButton={{ href: "/agents", label: "Back to Agents" }}
          title={activeProject.projectName}
          description={
            <div className="space-y-2">
              <p className="text-sm">
                {activeProject.Description ||
                  "No detailed description has been provided for this project."}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-xs text-muted-foreground">
                  Project ID: {activeProject.projectID}
                </p>
                {activeProject.tags && activeProject.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeProject.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-2 py-0.5 text-xs font-normal"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          }
        />

        {/* Main Content */}
        <div className="space-y-6">
          {projectDetailsMetricsEnabled && (
            <>
              {/* Metadata Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DetailCard
                  label="Created By"
                  value={activeProject.CreateBy}
                  icon={<User className="h-5 w-5" />}
                />
                <DetailCard
                  label="Agents"
                  value={activeProject.agentsCount}
                  icon={<Users className="h-5 w-5" />}
                />
                <DetailCard
                  label="Created At"
                  value={new Date(activeProject.Creation).toLocaleDateString()}
                  icon={<Calendar className="h-5 w-5" />}
                />
                <DetailCard
                  label="Last Updated"
                  value={new Date(activeProject.LastUpdate).toLocaleDateString()}
                  icon={<Clock className="h-5 w-5" />}
                />
              </div>

              {/* KPI Dashboard */}
              <div className="space-y-4">
                <h3 className="text-m font-semibold text-gray-600 dark:text-gray-100 flex items-center">
                  <Gauge className="h-5 w-5 mr-2 text-violet-500" />
                  Project Performance Dashboard
                </h3>

                <div className="space-y-6 bg-gradient-to-r from-violet-100 dark:from-violet-900/50 to-violet-200 dark:to-violet-800/50 p-6 rounded-2xl border border-violet-200/50 dark:border-violet-700/50 @container">
                  {metricsLoading ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-10 animate-pulse">
                      <Gauge className="h-6 w-6 mx-auto mb-2 text-primary" />
                      Fetching live metrics...
                    </div>
                  ) : projectMetrics ? (
                    <KPIProjectDashboard metrics={projectMetrics} />
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                      <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                      {metricsError
                        ? "Could not load live metrics. Please try again later."
                        : "No metrics available for this project."}
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Accordion type="single" collapsible defaultValue="">
                  <AccordionItem value="metrics">
                    <AccordionTrigger className="text-lg font-semibold text-gray-700 dark:text-gray-100 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-blue-500" />
                      Detailed Traces & Metrics
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card className="rounded-2xl shadow-md border border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl mt-4">
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
                                <MetricProjectTemplate tabId={tab.id} projectID={projectID} />
                              </TabsContent>
                            ))}
                          </Tabs>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            </>
          )}

          {/* Agent Dashboard Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <AgentDeploymentDashboard projectID={activeProject.projectID} />
            </CardContent>
          </Card>
          </div>

          {/* Fallback Error Message */}
          {fetchError && (
            <div className="flex items-center justify-center p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
              <AlertTriangle className="h-5 w-5 mr-2 shrink-0" />
              <span className="font-medium">
                Could not load full project details. Showing cached or fallback data.
              </span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
