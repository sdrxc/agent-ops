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
import { ToolCard } from "@/components/cards";
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
import ToolCreationDialogBox from "@/domains/deployment/components/steps/ToolCreationDialog";

// ---------------- MOCK DATA ----------------
type Tool = {
  toolId: string;
  toolName: string;
  toolDesp: string;
  enabled: boolean;
  type: "public" | "private" | "open";
  version: string;
  metadata: Record<string, any>;
};

const MOCK_TOOLS: Tool[] = [
  {
    toolId: "T001",
    toolName: "Snowflake MCP Connector",
    toolDesp:
      "Connects to Snowflake data warehouse for data ingestion and query execution.",
    enabled: true,
    type: "public",
    version: "1.2.0",
    metadata: { developer: "MCP Team", lastUpdated: "2025-09-01" },
  },
  {
    toolId: "T002",
    toolName: "Figma MCP Connector",
    toolDesp:
      "Allows synchronization and extraction of design metadata from Figma.",
    enabled: false,
    type: "public",
    version: "0.9.5",
    metadata: { developer: "UI/UX Team", lastUpdated: "2025-08-15" },
  },
  {
    toolId: "T003",
    toolName: "Github MCP Server",
    toolDesp:
      "Centralized server for Git operations, managing repositories and webhooks.",
    enabled: true,
    type: "private",
    version: "2.10.3",
    metadata: { developer: "Infra Team", lastUpdated: "2025-10-05" },
  },
  {
    toolId: "T004",
    toolName: "ElasticSearch MCP",
    toolDesp:
      "Provides full-text search and analytical capabilities over large datasets.",
    enabled: true,
    type: "private",
    version: "7.17.6",
    metadata: { developer: "Data Team", lastUpdated: "2025-09-20" },
  },
  {
    toolId: "T005",
    toolName: "Logfire MCP",
    toolDesp:
      "A comprehensive tool for centralized log aggregation and real-time monitoring.",
    enabled: false,
    type: "open",
    version: "3.5.1",
    metadata: { developer: "DevOps", lastUpdated: "2025-07-01" },
  },
  {
    toolId: "T006",
    toolName: "Codacy API",
    toolDesp:
      "API access to Codacy for static code analysis reports and quality metrics.",
    enabled: true,
    type: "public",
    version: "1.0.0",
    metadata: { developer: "Security Team", lastUpdated: "2025-06-10" },
  },
];

// ---------------- MAIN CATALOGUE ----------------
export const ToolCatalogue = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterEnabled, setFilterEnabled] = useState("all");
  const [sortBy, setSortBy] = useState("toolName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [tools] = useState<Tool[]>(MOCK_TOOLS);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const filteredAndSortedTools = useMemo(() => {
    let result = [...tools];
    const lower = searchTerm.toLowerCase();

    if (searchTerm)
      result = result.filter(
        (t) =>
          t.toolName.toLowerCase().includes(lower) ||
          t.toolDesp.toLowerCase().includes(lower) ||
          t.toolId.toLowerCase().includes(lower)
      );

    if (filterType !== "all")
      result = result.filter((t) => t.type === filterType);
    if (filterEnabled !== "all")
      result = result.filter(
        (t) => t.enabled === (filterEnabled === "enabled")
      );

    result.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
    return result;
  }, [tools, searchTerm, filterType, filterEnabled, sortBy, sortDirection]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Tools"
          description="Browse and discover AI security tools and integrations"
          actions={
            <Button onClick={() => setOpenDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Tool
            </Button>
          }
        />

        {/* Page Toolbar */}
        <PageToolbar
          searchPlaceholder="Search tools..."
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

              <Select value={filterEnabled} onValueChange={setFilterEnabled}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toolName">Name</SelectItem>
                  <SelectItem value="toolId">ID</SelectItem>
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
            Fetching latest tools...
          </div>
        ) : filteredAndSortedTools.length > 0 ? (
          <ContentGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}>
            {filteredAndSortedTools.map((tool) => (
              <ToolCard
                key={tool.toolId}
                tool={{
                  id: tool.toolId,
                  name: tool.toolName,
                  description: tool.toolDesp,
                  version: tool.version,
                  status: tool.enabled ? "active" : "inactive",
                  toolType: tool.type,
                  lastActivity: tool.metadata.lastUpdated,
                  tags: [], // Tags removed as they are not part of the original card data
                }}
              />
            ))}
          </ContentGrid>
        ) : (
          <div className="text-center py-20 text-muted-foreground bg-card rounded-lg shadow-md border">
            <Folder className="w-10 h-10 mx-auto mb-3" />
            <p>No tools match the current criteria.</p>
          </div>
        )}
      </div>

      {/* Dialog for Tool Creation */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Tool</DialogTitle>
          </DialogHeader>
          <ToolCreationDialogBox onClose={() => setOpenDialog(false)} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};
