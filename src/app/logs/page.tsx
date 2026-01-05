"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import { DataTable } from "@/components/shared/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  FilterToolbar,
  FilterToolbarPrimaryRow,
  FilterToolbarResponsiveRow,
  FilterToolbarBlock,
  FilterToolbarSearch,
  FilterChip,
  FilterToolbarActiveFilters,
  FilterToolbarResultCount,
} from "@/components/FilterToolbar";
import {
  List,
  Layers,
  Globe,
  Clock,
  Search,
  X,
  MessageSquare,
  Zap,
  Workflow,
  Activity,
  ArrowRight,
  Rows3,
  LayoutGrid,
  ArrowUpDown,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Log, Session, Agent } from "@/types/api";
import { generateMockLogs, generateMockSessions } from "@/lib/mockData/logs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useGlobalContext } from "@/app/GlobalContextProvider";

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

export default function LogsPage() {
  const router = useRouter();
  const { user } = useGlobalContext();
  const [viewMode, setViewMode] = useState<"traces" | "sessions">("traces");
  const [displayType, setDisplayType] = useState<"table" | "card">("table");
  const [sortBy, setSortBy] = useState<string>("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter state
  const [envFilter, setEnvFilter] = useState<
    "All" | "dev" | "qa" | "prod"
  >("All");
  const [timeFilter, setTimeFilter] = useState("24h");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Success" | "Error" | "Completed" | "Active"
  >("All");
  const [sourceFilter, setSourceFilter] = useState<
    "All" | "API" | "Chat" | "Event"
  >("All");
  const [workflowFilter, setWorkflowFilter] = useState<string>("All");
  const [latencyFilter, setLatencyFilter] = useState<"All" | ">1s" | ">5s">(
    "All"
  );
  const [tagFilter, setTagFilter] = useState("");

  // Fetch agents
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

  // Extract unique workflows for dropdown
  const availableWorkflows = useMemo(() => {
    return Array.from(
      new Set(mockLogs.map((l) => l.workflow).filter(Boolean))
    ) as string[];
  }, [mockLogs]);

  // Filter logic
  const filterItem = (item: Log | Session) => {
    // Environment filter
    if (envFilter !== "All" && item.environment !== envFilter) return false;

    // Time filter
    if (item.timestamp) {
      const date = new Date(item.timestamp);
      const now = new Date();
      const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (timeFilter === "1h" && diffHours > 1) return false;
      if (timeFilter === "6h" && diffHours > 6) return false;
      if (timeFilter === "24h" && diffHours > 24) return false;
      if (timeFilter === "7d" && diffHours > 24 * 7) return false;
    }

    // Search filter - search across ALL fields including filtered ones
    if (searchTerm) {
      const log = item as Log;
      const session = item as Session;
      const searchContent = (
        (log.input || "") +
        (log.output || "") +
        (item.id || "") +
        (log.agent || "") +
        (session.userId || "") +
        (session.summary || "") +
        // Include filtered fields in search
        (item.status || "") +
        (log.source || "") +
        (log.workflow || "") +
        (item.environment || "") +
        (item.tags?.join(" ") || "") +
        (log.latency?.toString() || "") +
        (log.tokens?.toString() || "") +
        (session.turnCount?.toString() || "") +
        (session.duration || "")
      ).toLowerCase();

      if (!searchContent.includes(searchTerm.toLowerCase())) return false;
    }

    // Status filter
    if (statusFilter !== "All") {
      if (item.status !== statusFilter) return false;
    }

    // Trace-specific filters
    if (viewMode === "traces") {
      const log = item as Log;
      if (sourceFilter !== "All" && log.source !== sourceFilter) return false;
      if (workflowFilter !== "All" && log.workflow !== workflowFilter)
        return false;

      if (latencyFilter !== "All") {
        const latency = log.latency || 0;
        if (latencyFilter === ">1s" && latency < 1000) return false;
        if (latencyFilter === ">5s" && latency < 5000) return false;
      }
    }

    // Tags filter
    if (tagFilter) {
      const tags = item.tags || [];
      const hasMatchingTag = tags.some((t: string) =>
        t.toLowerCase().includes(tagFilter.toLowerCase())
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  };

  const filteredLogs = mockLogs.filter(filterItem);
  const filteredSessions = mockSessions.filter(filterItem);

  const clearFilters = () => {
    setSearchTerm("");
    setEnvFilter("All");
    setTimeFilter("24h");
    setStatusFilter("All");
    setSourceFilter("All");
    setWorkflowFilter("All");
    setLatencyFilter("All");
    setTagFilter("");
  };

  const hasActiveFilters =
    searchTerm ||
    envFilter !== "All" ||
    timeFilter !== "24h" ||
    statusFilter !== "All" ||
    sourceFilter !== "All" ||
    workflowFilter !== "All" ||
    latencyFilter !== "All" ||
    tagFilter;

  // Column definitions for Traces
  const traceColumns: ColumnDef<Log>[] = [
    {
      accessorKey: "id",
      header: "Trace ID",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="font-mono text-primary-600 text-xs">
          {row.getValue("id")}
        </div>
      ),
    },
    {
      accessorKey: "environment",
      header: "Env",
      cell: ({ row }) => {
        const env = row.getValue("environment") as string;
        return (
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${getEnvColor(
              env
            )}`}
          >
            {getEnvLabel(env)}
          </span>
        );
      },
    },
    {
      accessorKey: "timestamp",
      header: "Time",
      enableSorting: true,
      cell: ({ row }) => {
        const timestamp = row.getValue("timestamp") as string;
        return (
          <div className="text-slate-500 text-xs whitespace-nowrap">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        );
      },
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => {
        const source = row.getValue("source") as string;
        return (
          <div className="flex items-center gap-2" title={source}>
            {source === "API" && <Globe size={14} className="text-blue-500" />}
            {source === "Event" && <Zap size={14} className="text-orange-500" />}
            {source === "Chat" && (
              <MessageSquare size={14} className="text-slate-400" />
            )}
            <span className="font-medium text-slate-600 text-xs">{source}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "workflow",
      header: "Workflow",
      cell: ({ row }) => {
        const workflow = row.getValue("workflow") as string | undefined;
        return workflow ? (
          <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 border border-slate-200 rounded font-medium text-slate-700 text-xs whitespace-nowrap">
            <Workflow size={12} className="text-slate-400" />
            {workflow.length > 15
              ? workflow.substring(0, 15) + "..."
              : workflow}
          </span>
        ) : (
          <span className="px-2 text-slate-300 text-xs">-</span>
        );
      },
    },
    {
      accessorKey: "agent",
      header: "Agent",
      cell: ({ row }) => (
        <div className="font-medium text-slate-700 text-xs whitespace-nowrap">
          {row.getValue("agent")}
        </div>
      ),
    },
    {
      accessorKey: "input",
      header: "Input / Output",
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div className="max-w-xs min-w-[300px]">
            <div
              className="font-medium text-slate-700 text-xs truncate"
              title={log.input}
            >
              {log.source === "Chat" ? `"${log.input}"` : log.input}
            </div>
            <div
              className="mt-0.5 text-[10px] text-slate-400 truncate"
              title={log.output}
            >
              {log.output || "-"}
            </div>
            {log.tags && log.tags.length > 0 && (
              <div className="flex gap-1 mt-1">
                {log.tags.map((t) => (
                  <span
                    key={t}
                    className="bg-slate-100 px-1 border border-slate-200 rounded text-[9px] text-slate-500"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "latency",
      header: "Latency",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="font-mono text-slate-600 text-xs">
          {row.getValue("latency")}ms
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
              status === "Error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-green-50 text-green-700 border-green-200"
            }`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  // Column definitions for Sessions
  const sessionColumns: ColumnDef<Session>[] = [
    {
      accessorKey: "userId",
      header: "User / Session",
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex justify-center items-center bg-slate-100 rounded-full w-8 h-8 font-bold text-slate-500 text-xs">
              {session.userId.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-slate-900">
                {session.userId}
              </div>
              <div className="font-mono text-[10px] text-slate-400">
                {session.id}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "environment",
      header: "Env",
      cell: ({ row }) => {
        const env = row.getValue("environment") as string;
        return (
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${getEnvColor(
              env
            )}`}
          >
            {getEnvLabel(env)}
          </span>
        );
      },
    },
    {
      accessorKey: "timestamp",
      header: "Started",
      enableSorting: true,
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="text-slate-500 text-xs">
            {session.startTime}
          </div>
        );
      },
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => (
        <div className="text-slate-500 text-xs">
          {row.getValue("duration")}
        </div>
      ),
    },
    {
      accessorKey: "turnCount",
      header: "Turns",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="text-center">
          <span className="inline-flex items-center bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600 text-xs">
            {row.getValue("turnCount")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              status === "Completed"
                ? "bg-green-50 text-green-700 border-green-200"
                : status === "Error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "summary",
      header: "Summary",
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="max-w-xs min-w-[300px]">
            <div
              className="mb-1 text-slate-600 text-xs truncate"
              title={session.summary}
            >
              {session.summary}
            </div>
            {session.tags && session.tags.length > 0 && (
              <div className="flex gap-1">
                {session.tags.map((t) => (
                  <span
                    key={t}
                    className="bg-indigo-50 px-1.5 py-0.5 border border-indigo-100 rounded text-[9px] text-indigo-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: () => (
        <div className="text-slate-300 text-right">
          <ArrowRight size={18} />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Row */}
        <div className="flex md:flex-row flex-col justify-between md:items-end gap-4">
          <div>
            <h1 className="font-bold text-slate-900 text-2xl">
              Activity & Observability
            </h1>
            <p className="mt-1 text-slate-500 text-sm">
              Monitor execution traces, logs, and user sessions.
            </p>
          </div>

           

            


        </div>

        {/* Filter Toolbar */}
        <FilterToolbar>
          {/* View Toggles - Always in single row */}
          <FilterToolbarPrimaryRow>
            <SegmentedControl
              value={viewMode}
              onValueChange={(value) => {
                if (value) setViewMode(value as "traces" | "sessions");
              }}
              className="bg-slate-100 p-1"
            >
              <SegmentedControlItem value="traces" className="flex items-center gap-2">
                <List className="w-4 h-4" /> Logs
              </SegmentedControlItem>
              <SegmentedControlItem value="sessions" className="flex items-center gap-2">
                <Layers className="w-4 h-4" /> Sessions
              </SegmentedControlItem>
            </SegmentedControl>
          </FilterToolbarPrimaryRow>

          {/* Responsive Row: Search + Sort/Filters can move up */}
          <FilterToolbarResponsiveRow>
            {/* Search - Fixed width, always on left */}
            <FilterToolbarSearch>
              <Search className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2" size={16} />
              <Input
                type="text"
                placeholder={
                  viewMode === "traces"
                    ? "Search logs by ID, input, output, or agent..."
                    : "Search sessions by user ID, summary, or ID..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background shadow-none py-2 pr-4 pl-9 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 w-full max-w-xs text-sm transition-all"
              />
            </FilterToolbarSearch>

            {/* Sort Controls - Can move up into Search row, left-aligned when in own row */}
            {displayType === "card" && (
              <FilterToolbarBlock label="Sort">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex [&>span]:flex-1 justify-start items-center gap-1 bg-background [&>svg:last-child]:ml-auto px-2 py-1 rounded-lg w-[140px] h-8 font-medium text-foreground text-xs [&>span]:text-left">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timestamp">Time</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    {viewMode === "traces" && (
                      <>
                        <SelectItem value="latency">Latency</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                      </>
                    )}
                    {viewMode === "sessions" && (
                      <>
                        <SelectItem value="turnCount">Turns</SelectItem>
                        <SelectItem value="duration">Duration</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
                  <SelectTrigger className="flex [&>span]:flex-1 justify-start items-center bg-background [&>svg:last-child]:ml-auto px-2 py-1 rounded-lg w-[100px] h-8 font-medium text-foreground text-xs [&>span]:text-left">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Desc</SelectItem>
                    <SelectItem value="asc">Asc</SelectItem>
                  </SelectContent>
                </Select>
              </FilterToolbarBlock>
            )}

            {/* Granular Filters - Can move up or wrap to own row */}
            <FilterToolbarBlock label="Filters">
              {/* Environment */}
              <Select value={envFilter} onValueChange={(v: any) => setEnvFilter(v)}>
                <SelectTrigger className="flex [&>span]:flex-1 justify-start items-center bg-background [&>svg:last-child]:ml-auto px-2 py-1 rounded-lg w-[140px] h-8 font-medium text-foreground text-xs [&>span]:text-left">
                  <Globe className="mr-1.5 w-3.5 h-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Envs</SelectItem>
                  <SelectItem value="dev">Dev</SelectItem>
                  <SelectItem value="qa">QA</SelectItem>
                  <SelectItem value="prod">Prod</SelectItem>
                </SelectContent>
              </Select>

              {/* Time */}
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="flex [&>span]:flex-1 justify-start items-center bg-background [&>svg:last-child]:ml-auto px-2 py-1 rounded-lg w-[120px] h-8 font-medium text-foreground text-xs [&>span]:text-left">
                  <Clock className="mr-1.5 w-3.5 h-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last 1h</SelectItem>
                  <SelectItem value="6h">Last 6h</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7d</SelectItem>
                </SelectContent>
              </Select>

              {/* Status */}
              <Select
                value={statusFilter}
                onValueChange={(v: any) => setStatusFilter(v)}
              >
                <SelectTrigger className="flex [&>span]:flex-1 justify-start items-center bg-background [&>svg:last-child]:ml-auto px-2 py-1 rounded-lg w-[140px] h-8 font-medium text-foreground text-xs [&>span]:text-left">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Success">Success / Completed</SelectItem>
                  <SelectItem value="Error">Error / Failed</SelectItem>
                </SelectContent>
              </Select>

              {/* Trace-Specific Filters */}
              {viewMode === "traces" && (
                <>
                  {/* Source */}
                  <Select
                    value={sourceFilter}
                    onValueChange={(v: any) => setSourceFilter(v)}
                  >
                    <SelectTrigger className="flex [&>span]:flex-1 justify-start items-center bg-background [&>svg:last-child]:ml-auto px-2 py-1 rounded-lg w-[130px] h-8 font-medium text-foreground text-xs [&>span]:text-left">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Sources</SelectItem>
                      <SelectItem value="API">API</SelectItem>
                      <SelectItem value="Chat">Chat</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Workflow */}
                  <Select
                    value={workflowFilter}
                    onValueChange={setWorkflowFilter}
                  >
                    <SelectTrigger className="flex [&>span]:flex-1 justify-start items-center bg-background [&>svg:last-child]:ml-auto px-2 py-1 rounded-lg w-[180px] h-8 font-medium text-foreground text-xs [&>span]:text-left">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Workflows</SelectItem>
                      {availableWorkflows.map((wf) => (
                        <SelectItem key={wf} value={wf}>
                          {wf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Latency */}
                  <Select
                    value={latencyFilter}
                    onValueChange={(v: any) => setLatencyFilter(v)}
                  >
                    <SelectTrigger className="flex [&>span]:flex-1 justify-start items-center bg-background [&>svg:last-child]:ml-auto px-2 py-1 rounded-lg w-[140px] h-8 font-medium text-foreground text-xs [&>span]:text-left">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Any Latency</SelectItem>
                      <SelectItem value=">1s">&gt; 1s (Slow)</SelectItem>
                      <SelectItem value=">5s">&gt; 5s (Timeout)</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              {/* Tags */}
              <Input
                type="text"
                placeholder="Tag..."
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className={`pl-3 pr-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-32 transition-all ${
                  tagFilter
                    ? "bg-primary-50 border-primary-200 text-primary-700 font-medium"
                    : "bg-background border-slate-200 text-slate-600"
                }`}
              />
            </FilterToolbarBlock>
          </FilterToolbarResponsiveRow>
        </FilterToolbar>

        {/* View Type Toggle - Between toolbar and data */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <FilterToolbarResultCount
              count={viewMode === "traces" ? filteredLogs.length : filteredSessions.length}
              total={hasActiveFilters ? (viewMode === "traces" ? mockLogs.length : mockSessions.length) : undefined}
              label={viewMode === "traces" ? "traces" : "sessions"}
            />
            {hasActiveFilters && (
              <FilterToolbarActiveFilters onClearAll={clearFilters}>
              {envFilter !== "All" && (
                <FilterChip
                  label="Env"
                  value={envFilter}
                  onRemove={() => setEnvFilter("All")}
                  color="blue"
                />
              )}
              {timeFilter !== "24h" && (
                <FilterChip
                  label="Time"
                  value={timeFilter}
                  onRemove={() => setTimeFilter("24h")}
                  color="orange"
                />
              )}
              {statusFilter !== "All" && (
                <FilterChip
                  label="Status"
                  value={statusFilter}
                  onRemove={() => setStatusFilter("All")}
                  color={statusFilter === "Error" ? "red" : "green"}
                />
              )}
              {sourceFilter !== "All" && (
                <FilterChip
                  label="Source"
                  value={sourceFilter}
                  onRemove={() => setSourceFilter("All")}
                  color="purple"
                />
              )}
              {workflowFilter !== "All" && (
                <FilterChip
                  label="Workflow"
                  value={workflowFilter}
                  onRemove={() => setWorkflowFilter("All")}
                  color="indigo"
                />
              )}
              {latencyFilter !== "All" && (
                <FilterChip
                  label="Latency"
                  value={latencyFilter}
                  onRemove={() => setLatencyFilter("All")}
                  color="amber"
                />
              )}
              {tagFilter && (
                <FilterChip
                  label="Tag"
                  value={tagFilter}
                  onRemove={() => setTagFilter("")}
                  color="slate"
                />
              )}
              {searchTerm && (
                <FilterChip
                  label="Search"
                  value={searchTerm}
                  onRemove={() => setSearchTerm("")}
                  color="slate"
                />
              )}
            </FilterToolbarActiveFilters>
            )}
          </div>
          <ToggleGroup
            type="single"
            value={displayType}
            onValueChange={(value) => {
              if (value) setDisplayType(value as "table" | "card");
            }}
            variant="outline"
            size="sm"
            className="gap-0 bg-gray-100 rounded-md"
          >
            <ToggleGroupItem value="table" className="flex justify-center items-center bg-slate-100 data-[state=on]:bg-background data-[state=on]:border border-0 data-[state=on]:border-gray-200 rounded-r-none rounded-l-md">
              <Rows3 className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="card" className="flex justify-center items-center bg-slate-100 data-[state=on]:bg-background data-[state=on]:border border-0 data-[state=on]:border-gray-200 rounded-r-md rounded-l-none">
              <LayoutGrid className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Data Display */}
        {displayType === "table" ? (
          viewMode === "traces" ? (
            <DataTable
              columns={traceColumns}
              data={filteredLogs}
              onRowClick={(row) => {
                const traceId = row.id;
                router.push(`/traces/${traceId}`);
              }}
            />
          ) : (
            <DataTable
              columns={sessionColumns}
              data={filteredSessions}
              onRowClick={(row) => {
                const sessionId = row.id;
                router.push(`/sessions/${sessionId}`);
              }}
            />
          )
        ) : (
          /* Card View - Empty placeholder for now */
          <div className="bg-white p-12 border border-slate-200 rounded-xl text-center">
            <LayoutGrid className="mx-auto mb-4 w-12 h-12 text-slate-300" />
            <h3 className="mb-2 font-semibold text-slate-700 text-lg">Card View</h3>
            <p className="text-slate-500 text-sm">
              Card view will be implemented here. Currently showing {viewMode === "traces" ? filteredLogs.length : filteredSessions.length} items.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
