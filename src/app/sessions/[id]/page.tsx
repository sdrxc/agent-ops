"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  Bot,
  User,
  Activity,
  BrainCircuit,
  ChevronRight,
  Globe,
  Zap,
} from "lucide-react";
import { Session, Log } from "@/types/api";
import { generateMockLogs, generateMockSessions } from "@/lib/mockData/logs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useGlobalContext } from "@/app/GlobalContextProvider";
import { Agent } from "@/types/api";

// Environment badge helper
const getEnvColor = (env: string) => {
  switch (env) {
    case "dev":
      return "text-slate-600 bg-slate-100 border-slate-200";
    case "qa":
      return "text-amber-600 bg-amber-50 border-amber-100";
    case "prod":
      return "text-green-600 bg-green-50 border-green-100";
    default:
      return "text-slate-500 bg-slate-50";
  }
};

const getEnvLabel = (env: string) => {
  switch (env) {
    case "dev":
      return "DEV";
    case "qa":
      return "QA";
    case "prod":
      return "PROD";
    default:
      return env.toUpperCase();
  }
};

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useGlobalContext();
  const sessionId = params.id as string;

  // Fetch agents for mock data generation
  const { data: agentsData } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
      const isLocalEnv = runtimeEnv === "local";
      const url = isLocalEnv
        ? `${baseURL}/api/listCatalogueAgents`
        : `/api/listCatalogueAgents`;

      const result = await axios.post(url, {
        userID: user?.userID,
      });

      const agents: Agent[] = Array.isArray(result.data)
        ? result.data
        : result.data?.data?.agents || [];

      return agents;
    },
    enabled: !!user?.userID,
  });

  const agents = agentsData || [];

  // Generate mock data
  const mockLogs = useMemo(() => {
    if (agents.length === 0) return [];
    return generateMockLogs(agents, 50);
  }, [agents]);

  const mockSessions = useMemo(() => {
    if (mockLogs.length === 0) return [];
    return generateMockSessions(mockLogs, 20);
  }, [mockLogs]);

  // Find the session
  const session = mockSessions.find((s) => s.id === sessionId);

  // Find logs belonging to this session
  const sessionLogs = useMemo(() => {
    if (!session) return [];
    return mockLogs.filter((log) => session.traces.includes(log.id));
  }, [session, mockLogs]);

  if (!session) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-red-500 mb-2">Session not found</p>
            <Button
              variant="outline"
              onClick={() => router.push("/logs")}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Logs
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleTraceClick = (traceId: string) => {
    router.push(`/traces/${traceId}`);
  };

  return (
    <Layout>
      <div className="flex flex-col h-full space-y-6">
        {/* Header */}
        <PageHeader
          backButton={{ href: "/logs", label: "Back to Logs" }}
          title={
            <span className="flex items-center gap-2">
              Session {session.id}
              <Badge
                variant="outline"
                className={`text-sm px-2 py-0.5 rounded-full border ${
                  session.status === "Completed"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : session.status === "Error"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {session.status}
              </Badge>
            </span>
          }
          description={
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <User size={14} /> {session.userId}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> {session.startTime}
              </span>
              <span className="flex items-center gap-1">
                <Activity size={14} /> {session.duration}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0.5 uppercase border ${getEnvColor(
                  session.environment
                )}`}
              >
                {getEnvLabel(session.environment)}
              </Badge>
            </div>
          }
          actions={
            <Card className="bg-slate-50 border border-slate-200 p-3 max-w-md">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Session Summary
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {session.summary}
              </p>
            </Card>
          }
        />

        {/* Timeline / Journey View */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 font-bold text-slate-700 text-sm flex items-center gap-2">
            <BrainCircuit size={16} className="text-indigo-600" /> Interaction
            Journey
          </div>

          <div className="flex-1 overflow-y-auto p-8 relative">
            {/* Vertical Line */}
            <div className="absolute left-[2rem] top-8 bottom-8 w-px bg-slate-200"></div>

            <div className="space-y-8">
              {/* Start Marker */}
              <div className="relative pl-12">
                <div className="absolute left-[1.35rem] top-1 w-5 h-5 rounded-full border-4 border-slate-50 bg-green-500 z-10"></div>
                <div className="text-sm font-bold text-slate-900">
                  Session Started
                </div>
                <div className="text-xs text-slate-400">{session.startTime}</div>
              </div>

              {sessionLogs.map((log) => (
                <div key={log.id} className="relative pl-12 group">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute left-[1.1rem] top-4 w-7 h-7 rounded-full border-4 border-slate-50 flex items-center justify-center z-10 shadow-sm ${
                      log.status === "Error"
                        ? "bg-red-100 text-red-600"
                        : "bg-white text-slate-500 border-slate-200"
                    }`}
                  >
                    {log.source === "Chat" ? (
                      <MessageSquare size={12} />
                    ) : log.source === "API" ? (
                      <Globe size={12} />
                    ) : (
                      <Zap size={12} />
                    )}
                  </div>

                  {/* Trace Card */}
                  <Card
                    onClick={() => handleTraceClick(log.id)}
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer relative"
                  >
                    <CardContent className="p-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase"
                          >
                            {log.source}
                          </Badge>
                          <span className="text-sm font-bold text-slate-900">
                            {log.workflow || log.agent}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.status === "Error" && (
                            <Badge
                              variant="destructive"
                              className="text-xs font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100"
                            >
                              Failed
                            </Badge>
                          )}
                          <span className="text-xs font-mono text-slate-400">
                            {log.latency}ms
                          </span>
                          <ChevronRight
                            size={16}
                            className="text-slate-300 group-hover:text-primary-500"
                          />
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-xs mb-2">
                        {log.input}
                      </p>

                      {/* Mock sub-steps visualization */}
                      <div className="flex gap-1 mt-3">
                        <div
                          className="h-1.5 flex-1 bg-green-400 rounded-full"
                          title="Retrieval"
                        ></div>
                        <div
                          className="h-1.5 flex-1 bg-indigo-400 rounded-full"
                          title="Reasoning"
                        ></div>
                        <div
                          className={`h-1.5 flex-1 rounded-full ${
                            log.status === "Error"
                              ? "bg-red-400"
                              : "bg-blue-400"
                          }`}
                          title="Execution"
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>Retrieval</span>
                        <span>Reasoning</span>
                        <span>Execution</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {/* End Marker */}
              <div className="relative pl-12 pb-4">
                <div
                  className={`absolute left-[1.35rem] top-1 w-5 h-5 rounded-full border-4 border-slate-50 z-10 ${
                    session.status === "Error" ? "bg-red-500" : "bg-slate-300"
                  }`}
                ></div>
                <div className="text-sm font-bold text-slate-900">
                  Session Ended
                </div>
                <div className="text-xs text-slate-400">
                  Duration: {session.duration}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}


