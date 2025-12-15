import { z } from "zod";

// Zod validation schemas
export const DemoResponseSchema = z.object({
  message: z.string(),
});

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "error", "training", "testing"]),
  version: z.string(),
  model: z.string(),
  lastActivity: z.string(),
  performance: z.object({
    successRate: z.number(),
    responseTime: z.number(),
    uptime: z.number(),
    errorRate: z.number(),
  }).optional(),
  sessions: z.object({
    total: z.number(),
    costPerSession: z.number(),
  }).optional(),
  tokens: z.object({
    input: z.number(),
    output: z.number(),
    total: z.number(),
  }).optional(),
  tags: z.array(z.string()),
  agentAPI: z.string(),
  agentdeploymenttype: z.enum(["deployed", "registered"])
});

export const DashboardMetricsSchema = z.object({
  totalAgents: z.number(),
  activeAgents: z.number(),
  averagePerformance: z.number(),
  totalTests: z.number(),
  successRate: z.number(),
  averageResponseTime: z.number(),
});

export const PlatformDashboardMetricsSchema = z.object({
  total_projects: z.number(),
  accuracy: z.number(),
  avg_tokens_per_request: z.number(),
  avg_cost_per_request: z.number(),
  error_rate: z.number(),
  total_cost: z.number(),
  total_tokens: z.number(),
  total_requests: z.number(),
});

export const ProjectDashboardMetricsSchema = z.object({
  accuracy: z.number(),
  success_rate: z.number(),
  avg_tokens_per_request: z.number(),
  avg_cost_per_request: z.number(),
  error_rate: z.number(),
  total_cost: z.number(),
  total_tokens: z.number(),
  total_requests: z.number(),
});

export const AgentDashboardMetricsSchema = z.object({
  accuracy: z.number(),
  success_rate: z.number(),
  avg_tokens_per_request: z.number(),
  avg_cost_per_request: z.number(),
  error_rate: z.number(),
  total_cost: z.number(),
  total_tokens: z.number(),
  total_requests: z.number(),
});

// TypeScript types derived from Zod schemas
export type DemoResponse = z.infer<typeof DemoResponseSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;
export type PlatformDashboardMetrics = z.infer<typeof PlatformDashboardMetricsSchema>;
export type ProjectDashboardMetrics = z.infer<typeof ProjectDashboardMetricsSchema>;
export type AgentDashboardMetrics = z.infer<typeof AgentDashboardMetricsSchema>;
// API response wrapper
export const ApiResponseSchema = <T>(dataSchema: z.ZodSchema<T>) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};



// src/types/api.ts or wherever your types file is located

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved";
  agentId: string;
  agentName: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Project {
  projectID: string;
  projectName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  agentsCount: number;
  createdBy: string;
  tags: string[];
  agents: Agent[];
}


