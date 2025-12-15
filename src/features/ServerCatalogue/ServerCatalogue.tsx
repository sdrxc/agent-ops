"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import {
  PageHeader,
  PageToolbar,
  ContentGrid,
} from "@/components/page-sections";
import { ServerCard } from "@/components/cards";
import {
  Plus,
  Folder,
  RefreshCcw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ServerCreationDialogBox from "../AgentDeployment/components/steps/ServerCreationDialog";

// ---------------- MOCK DATA ----------------
type Server = {
  serverId: string;
  serverName: string;
  serverDesp: string;
  status: boolean;
  type: "public" | "private" | "open";
  version: string;
  metadata: Record<string, any>;
};

const MOCK_SERVERS: Server[] = [
  {
    serverId: "S001",
    serverName: "AgentOps Core Server",
    serverDesp: "Manages API routing and agent orchestration logic.",
    status: true,
    type: "public",
    version: "2.4.1",
    metadata: { owner: "Infra Team", lastUpdated: "2025-09-28" },
  },
  {
    serverId: "S002",
    serverName: "Data Processing Server",
    serverDesp: "Handles data transformations, ETL operations, and streaming.",
    status: true,
    type: "private",
    version: "3.2.0",
    metadata: { owner: "Data Team", lastUpdated: "2025-09-15" },
  },
  {
    serverId: "S003",
    serverName: "Github MCP Server",
    serverDesp:
      "Hosts the ML models for prediction, inference, and analytics APIs.",
    status: false,
    type: "private",
    version: "1.8.0",
    metadata: { owner: "AI/ML Team", lastUpdated: "2025-08-10" },
  },
  {
    serverId: "S004",
    serverName: "Codebuild Server",
    serverDesp:
      "Acts as an entry point for external integrations and client SDKs.",
    status: true,
    type: "public",
    version: "1.5.7",
    metadata: { owner: "API Gateway Team", lastUpdated: "2025-09-01" },
  },
  {
    serverId: "S005",
    serverName: "MCP Server",
    serverDesp:
      "Lightweight compute environment available for open-source tasks.",
    status: false,
    type: "open",
    version: "0.9.3",
    metadata: { owner: "Community", lastUpdated: "2025-07-20" },
  },
];

// ---------------- MAIN CATALOGUE ----------------
export const ServerCatalogue = ({ projectID }: { projectID: string }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("serverName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [servers] = useState<Server[]>(MOCK_SERVERS);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const filteredAndSortedServers = useMemo(() => {
    let result = [...servers];
    const lower = searchTerm.toLowerCase();

    if (searchTerm)
      result = result.filter(
        (s) =>
          s.serverName.toLowerCase().includes(lower) ||
          s.serverDesp.toLowerCase().includes(lower) ||
          s.serverId.toLowerCase().includes(lower)
      );

    if (filterType !== "all")
      result = result.filter((s) => s.type === filterType);
    if (filterStatus !== "all")
      result = result.filter((s) => s.status === (filterStatus === "active"));

    result.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
    return result;
  }, [servers, searchTerm, filterType, filterStatus, sortBy, sortDirection]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Servers"
          description="Connect data sources and services to your agents"
          actions={
            <Button onClick={() => setOpenDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Server
            </Button>
          }
        />

        {/* Page Toolbar */}
        <PageToolbar
          searchPlaceholder="Search servers..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={
            <>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serverName">Name</SelectItem>
                  <SelectItem value="serverId">ID</SelectItem>
                  <SelectItem value="version">Version</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                }
              >
                {sortDirection === "asc" ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
            </>
          }
        />

        {/* Content Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <RefreshCcw className="w-10 h-10 animate-spin mb-4" />
            Fetching latest servers...
          </div>
        ) : (
          <ContentGrid
            columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
            empty={filteredAndSortedServers.length === 0}
          >
            {filteredAndSortedServers.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <Folder className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No servers match the current criteria.
                </p>
              </div>
            ) : (
              filteredAndSortedServers.map((server) => (
                <ServerCard
                  key={server.serverId}
                  server={{
                    id: server.serverId,
                    name: server.serverName,
                    description: server.serverDesp,
                    version: server.version,
                    status: server.status ? "active" : "inactive",
                    serverType: server.type,
                    lastActivity: server.metadata.lastUpdated,
                  }}
                />
              ))
            )}
          </ContentGrid>
        )}
      </div>

      {/* Dialog for Server Creation */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Server</DialogTitle>
          </DialogHeader>
          <ServerCreationDialogBox
            onClose={() => setOpenDialog(false)}
            projectID={projectID}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};
