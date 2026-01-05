"use client";

import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useGlobalContext } from "@/app/GlobalContextProvider";
import { ContentGrid } from "@/components/page-sections";
import { ToolCard } from "@/components/cards";
import { Folder, RefreshCcw } from "lucide-react";

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

interface ToolCatalogueProps {
  searchQuery?: string;
}

// ---------------- MAIN CATALOGUE ----------------
export const ToolCatalogue = ({ searchQuery = "" }: ToolCatalogueProps) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, loading: userLoading } = useGlobalContext();

  // Fetch tools from API
  useEffect(() => {
    if (userLoading || !user?.userID) return;

    const fetchTools = async () => {
      const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
      const isLocalEnv = runtimeEnv === "local";

      const url = isLocalEnv
        ? `${baseURL}/api/listTools`
        : `/api/listTools`;

      try {
        setLoading(true);
        const response = await axios.post(url, {
          userID: user.userID,
          projectID: "", // Tool catalogue doesn't require projectID
        });

        if (response.data && response.data?.data?.tools) {
          // Transform API response to match Tool type
          const apiTools = response.data.data.tools.map((tool: any) => {
            // Find matching mock tool for additional fields if available
            const mockTool = MOCK_TOOLS.find((m) => m.toolId === tool.toolID || m.toolId === tool.toolId);
            
            return {
              toolId: tool.toolID || tool.toolId || "",
              toolName: tool.toolName || "",
              toolDesp: tool.toolDesp || tool.description || mockTool?.toolDesp || "",
              enabled: tool.enabled !== undefined ? tool.enabled : (mockTool?.enabled ?? true),
              type: tool.type || mockTool?.type || "public",
              version: tool.version || mockTool?.version || "1.0.0",
              metadata: tool.metadata || mockTool?.metadata || { lastUpdated: new Date().toISOString() },
            };
          });
          setTools(apiTools.length > 0 ? apiTools : MOCK_TOOLS);
        } else {
          // Fallback to mock data if API response is unexpected
          setTools(MOCK_TOOLS);
        }
      } catch (err) {
        console.error("Error fetching tools:", err);
        // Fallback to mock data on error
        setTools(MOCK_TOOLS);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [user?.userID, userLoading]);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return tools;
    const lower = searchQuery.toLowerCase();
    return tools.filter(
      (t) =>
        t.toolName.toLowerCase().includes(lower) ||
        t.toolDesp.toLowerCase().includes(lower) ||
        t.toolId.toLowerCase().includes(lower)
    );
  }, [tools, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 text-muted-foreground">
        <RefreshCcw className="mb-4 w-10 h-10 animate-spin" />
        Fetching latest tools...
      </div>
    );
  }

  if (filteredTools.length === 0) {
    return (
      <div className="text-center py-20">
        <Folder className="mx-auto mb-3 w-10 h-10 text-muted-foreground" />
        <p className="text-muted-foreground">No tools found matching your search.</p>
      </div>
    );
  }

  return (
    <ContentGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}>
      {filteredTools.map((tool) => (
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
            tags: [],
          }}
        />
      ))}
    </ContentGrid>
  );
};
