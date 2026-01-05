"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { IntegrationTool, UnifiedCategory, DataOrigin } from "@/components/cards/IntegrationToolCard";

const EXTERNAL_GROUPS = new Set(["Web", "FDA", "RegSci"]);
const EXTERNAL_KEYWORDS = ["web", "pubmed", "semantic scholar", "external", "public"];
const INTERNAL_KEYWORDS = ["bayer", "bayernet", "dso", "hubble", "onedrive", "ms365", "colid", "maia"];
const SKILL_ACTION_KEYWORDS = [
  "search", "scrape", "scraper", "query", "lookup", "fetch", "retrieve",
  "generate", "create", "build", "execute", "run", "interpret", "validate",
];

export function inferDataOrigin(tool: IntegrationTool): DataOrigin {
  const nameLower = tool.name.toLowerCase();
  const descLower = (tool.description || "").toLowerCase();
  const groupLower = tool.group?.toLowerCase() || "";

  if (tool.group && EXTERNAL_GROUPS.has(tool.group)) {
    return "external";
  }

  const textToCheck = `${nameLower} ${descLower}`;
  
  if (EXTERNAL_KEYWORDS.some((kw) => textToCheck.includes(kw))) {
    return "external";
  }

  const fullText = `${textToCheck} ${groupLower}`;
  if (INTERNAL_KEYWORDS.some((kw) => fullText.includes(kw))) {
    return "internal";
  }

  if (tool.type === "mcp" && tool.auth_type === "oauth_obo") {
    return "internal";
  }

  return "internal";
}

export function mapToUnifiedCategory(
  rawCategory: string | null | undefined,
  toolName: string,
  description?: string | null
): UnifiedCategory {
  const category = rawCategory?.toLowerCase();
  
  if (category === "output" || category === "other") {
    return "skill";
  }
  
  const textToCheck = `${toolName.toLowerCase()} ${(description || "").toLowerCase()}`;
  const isActionTool = SKILL_ACTION_KEYWORDS.some((kw) => textToCheck.includes(kw));
  
  return isActionTool ? "skill" : "data-source";
}

export function transformToolsData(tools: IntegrationTool[]): IntegrationTool[] {
  return tools.map((tool) => ({
    ...tool,
    unifiedCategory: mapToUnifiedCategory(tool.category, tool.name, tool.description),
    dataOrigin: inferDataOrigin(tool),
  }));
}

interface ListMCPToolsResponse {
  status: number;
  message: string;
  data: {
    toolsMCP: IntegrationTool[];
  };
}

export interface UseIntegrationToolsOptions {
  userID: string;
  enabled?: boolean;
}

export interface UseIntegrationToolsReturn {
  tools: IntegrationTool[];
  mcpTools: IntegrationTool[];
  internalTools: IntegrationTool[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useIntegrationTools({
  userID,
  enabled = true,
}: UseIntegrationToolsOptions): UseIntegrationToolsReturn {
  const toolsQuery = useQuery<ListMCPToolsResponse>({
    queryKey: ["integration-tools", userID],
    queryFn: async () => {
      const response = await apiClient.post<ListMCPToolsResponse>(
        "/api/listAvailableMCPTools",
        { userID }
      );
      return response.data;
    },
    enabled: enabled && !!userID,
    staleTime: 5 * 60 * 1000,
  });

  const tools = useMemo(() => {
    return toolsQuery.data?.data?.toolsMCP ?? [];
  }, [toolsQuery.data]);

  const mcpTools = useMemo(() => {
    return tools.filter((t) => t.type === "mcp");
  }, [tools]);

  const internalTools = useMemo(() => {
    return tools.filter((t) => t.type === "internal");
  }, [tools]);

  return {
    tools,
    mcpTools,
    internalTools,
    isLoading: toolsQuery.isLoading,
    isError: toolsQuery.isError,
    error: toolsQuery.error,
    refetch: toolsQuery.refetch,
  };
}

export function generateMockUsageMetrics(tools: IntegrationTool[]): IntegrationTool[] {
  return tools.map((tool) => {
    const baseUsage = tool.total_stars * 15 + (tool.key.charCodeAt(0) % 100);
    const hasUsage = tool.total_stars > 5;
    
    if (!hasUsage) {
      return tool;
    }

    const trend: "up" | "down" | "stable" = 
      tool.total_stars > 50 ? "up" : 
      tool.total_stars > 20 ? "stable" : "down";
    
    return { ...tool, usage_count: baseUsage, usage_trend: trend };
  });
}

