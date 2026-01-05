import { ApiStatus } from "@/components/ApiStatusIndicator";

/**
 * Registry of component API status for debugging and refactoring management
 */
export interface ComponentApiStatus {
  componentName: string;
  status: ApiStatus;
  endpoints: string[];
  description?: string;
}

/**
 * Central registry of all component API statuses
 * This helps developers identify which components need API integration work
 */
export const API_STATUS_REGISTRY: Record<string, ComponentApiStatus> = {
  // Performance Section
  overview: {
    componentName: "System Health",
    status: "full",
    endpoints: [
      "/api/listProjects",
      "/api/v1/metrics/platform/accuracy",
      "/api/v1/metrics/platform/success-rate",
      "/api/v1/metrics/platform/efficiency",
      "/api/v1/metrics/platform/errors",
      "/api/v1/metrics/platform/throughput",
    ],
    description: "Platform metrics and project listing",
  },
  logs: {
    componentName: "Logs and Traces",
    status: "none",
    endpoints: [],
    description: "No API connection - mock data",
  },

  // Studio Section
  assistant: {
    componentName: "Prompt Manager",
    status: "none",
    endpoints: [],
    description: "Undeployed agent prompts - deploy to create agents in 'My Agents'",
  },
  agents: {
    componentName: "My Agents",
    status: "full",
    endpoints: [
      "/api/listCatalogueAgents",
      "/api/agentDetails",
      "/api/listProjectAgents",
    ],
    description: "Agent listing and details",
  },
  workflows: {
    componentName: "Workflows",
    status: "none",
    endpoints: [],
    description: "No API connection - new feature",
  },
  simulator: {
    componentName: "Simulator",
    status: "none",
    endpoints: [],
    description: "No API connection - new feature",
  },

  // Developer Tools
  "data-explorer": {
    componentName: "Query Console",
    status: "partial",
    endpoints: [],
    description: "Check existing API connections",
  },
  incidents: {
    componentName: "Incidents",
    status: "partial",
    endpoints: [],
    description: "Check existing API connections",
  },
  playground: {
    componentName: "Playground",
    status: "partial",
    endpoints: [],
    description: "Check existing API connections",
  },
  deployments: {
    componentName: "Deployments",
    status: "full",
    endpoints: ["/api/listProjectAgents"],
    description: "Agent deployment dashboard",
  },
  "mcp-registry": {
    componentName: "MCP Registry",
    status: "partial",
    endpoints: ["/api/listAvailableMCPTools"],
    description: "MCP tools marketplace",
  },
  "api-management": {
    componentName: "API Management",
    status: "none",
    endpoints: [],
    description: "No API connection - new feature",
  },
  "server-catalogue": {
    componentName: "Server Catalogue",
    status: "partial",
    endpoints: ["/api/listServers"],
    description: "Server listing API available (component may use mock data)",
  },
  "tool-catalogue": {
    componentName: "Tool Catalogue",
    status: "partial",
    endpoints: ["/api/listTools"],
    description: "Tool listing API available",
  },

  // Discover Section
  "getting-started": {
    componentName: "Getting Started",
    status: "none",
    endpoints: [],
    description: "User guide - no API needed",
  },
  "agent-community": {
    componentName: "Agent Community",
    status: "full",
    endpoints: ["/api/listCatalogueAgents"],
    description: "AgentHub/Agent Catalogue",
  },
  knowledge: {
    componentName: "Knowledge",
    status: "none",
    endpoints: [],
    description: "Manage uploaded files and Vector DB connections (RAG)",
  },
};

/**
 * Get API status for a component by its ID
 */
export function getComponentApiStatus(
  componentId: string
): ComponentApiStatus | undefined {
  return API_STATUS_REGISTRY[componentId];
}

/**
 * Analyze a component's API usage and determine status
 * This is a helper for automatic detection (can be enhanced)
 */
export function analyzeApiUsage(endpoints: string[]): ApiStatus {
  if (endpoints.length === 0) {
    return "none";
  }
  // This is a simplified check - in practice, you'd analyze the component
  // to see if all features use APIs or just some
  return "full";
}

/**
 * Export API status report for documentation
 */
export function exportApiStatusReport(): string {
  const full = Object.values(API_STATUS_REGISTRY).filter(
    (s) => s.status === "full"
  );
  const partial = Object.values(API_STATUS_REGISTRY).filter(
    (s) => s.status === "partial"
  );
  const none = Object.values(API_STATUS_REGISTRY).filter(
    (s) => s.status === "none"
  );

  return `
API Status Report
==================

Full API (${full.length} components):
${full.map((s) => `  - ${s.componentName}`).join("\n")}

Partial API (${partial.length} components):
${partial.map((s) => `  - ${s.componentName}`).join("\n")}

No API (${none.length} components):
${none.map((s) => `  - ${s.componentName}`).join("\n")}
`;
}

