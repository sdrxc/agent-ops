import { z } from "zod";

// Zod validation schemas
export const DemoResponseSchema = z.object({
  message: z.string(),
});

// New schemas for agent enhancement
export const ProviderSchema = z.object({
  name: z.string(),
  githubURL: z.string().url().optional(),
  organization: z.string().optional(),
});

export const SampleIOSchema = z.object({
  input: z.record(z.any()), // flexible JSON
  output: z.record(z.any()), // flexible JSON
  description: z.string().optional(),
});

export const IntegrationExampleSchema = z.object({
  language: z.enum(["python", "javascript", "typescript", "curl", "go"]),
  code: z.string(),
  description: z.string().optional(),
});

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  projectID: z.string().optional(),
  // MODIFIED: Replace status with environment
  environment: z
    .enum(["development", "staging", "production"])
    .optional()
    .default("development"),
  // DEPRECATED: kept for backward compatibility
  status: z
    .enum(["active", "inactive", "error", "training", "testing"])
    .optional(),
  version: z.string(),
  model: z.string(),
  lastActivity: z.string(),

  // NEW FIELDS
  agentURL: z
    .object({
      apiEndpoint: z.string().url(),
      swaggerDocs: z.string().url().optional(),
    })
    .optional(),
  provider: ProviderSchema.optional(),
  beatID: z.string().optional(),
  visibility: z.enum(["public", "private"]).optional().default("private"),
  sampleIO: z.array(SampleIOSchema).optional(),
  integrationExamples: z.array(IntegrationExampleSchema).optional(),

  performance: z
    .object({
      successRate: z.number(),
      responseTime: z.number(),
      uptime: z.number(),
      errorRate: z.number(),
    })
    .optional(),
  sessions: z
    .object({
      total: z.number(),
      costPerSession: z.number(),
    })
    .optional(),
  tokens: z
    .object({
      input: z.number(),
      output: z.number(),
      total: z.number(),
    })
    .optional(),
  tags: z.array(z.string()),
  agentAPI: z.string(), // DEPRECATED: use agentURL.apiEndpoint
  agentdeploymenttype: z.enum(["deployed", "registered"]),
  configVersions: z.array(z.any()).optional(), // ConfigVersion[]
  currentVersionId: z.string().optional(),
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
export type Provider = z.infer<typeof ProviderSchema>;
export type SampleIO = z.infer<typeof SampleIOSchema>;
export type IntegrationExample = z.infer<typeof IntegrationExampleSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;
export type PlatformDashboardMetrics = z.infer<
  typeof PlatformDashboardMetricsSchema
>;
export type ProjectDashboardMetrics = z.infer<
  typeof ProjectDashboardMetricsSchema
>;
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

// API response format for projects (matches backend response structure)
export interface ProjectApiResponse {
  projectID: string;
  projectName: string;
  Description?: string;
  Creation: string;
  LastUpdate: string;
  agentsCount: number;
  CreateBy: string;
  Tags?: string[];
  projectStatus?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string; // e.g. "pk_live_..."
  userId: string;
  projectIds: string[];
  createdAt: string;
  lastUsedAt?: string;
  hash?: string; // Internal use only - hashed version of the key
}

// Agent Configuration Versioning & Templates
export interface AgentConfigSnapshot {
  name: string;
  description?: string;
  tags: string[];
  modelConfig?: ModelConfig;
  systemPrompt?: string;
  userPrompt?: string;
  assistantPrompt?: string;
  capabilities?: Record<string, string | boolean>;
  skills?: Array<{ key: string; description?: string }>;
  security?: Array<{
    policy_name: string;
    details?: string;
    enforced: boolean;
  }>;
}

export interface ConfigVersion {
  id: string;
  version: string; // e.g., "v1.2.3"
  timestamp: string;
  author: string;
  description: string;
  snapshot: AgentConfigSnapshot;
  environment?: "dev" | "staging" | "production";
}

// Log and Session types for logs and traces page
export interface Log {
  id: string;
  timestamp: string;
  agent: string;
  agentId?: string;
  workflow?: string;
  source: "Chat" | "API" | "Event";
  input: string;
  output?: string;
  status: "Success" | "Error";
  latency: number;
  tokens?: number;
  cost?: number;
  sessionId?: string;
  environment: "dev" | "qa" | "prod";
  tags?: string[];
}

export interface Session {
  id: string;
  userId: string;
  startTime: string;
  timestamp: string;
  duration: string;
  turnCount: number;
  status: "Completed" | "Active" | "Error";
  summary: string;
  traces: string[];
  environment: "dev" | "qa" | "prod";
  tags?: string[];
}

// Trace types for trace analysis
export interface TraceStep {
  id: number;
  agent: string;
  name: string;
  type: "trigger" | "orchestration" | "router" | "retrieval" | "llm" | "tool";
  duration: number;
  status: "success" | "error";
  start: number;
  errorMsg?: string;
  toolExecution?: ToolExecution;
}

export interface ToolExecution {
  input: Record<string, any>;
  output?: string;
  error?: string;
  metadata?: {
    model?: string;
    cost?: number;
    retries?: string;
  };
}

export interface OrchestrationContext {
  routingDecision: string;
  activeSubAgents: string[];
}

export interface ModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface TraceExecutionContext {
  systemPrompt: string;
  promptVersion: string;
  modelConfig: ModelConfig;
  userInput: string | Record<string, any>;
  enabledTools: string[];
  agentId: string;
  timestamp: string;
}

export interface TraceDetail {
  id: string;
  steps: TraceStep[];
  orchestrationContext: OrchestrationContext;
  selectedStepId?: number;
  executionContext?: TraceExecutionContext;
}

// Zod schemas for trace validation
export const TraceStepSchema = z.object({
  id: z.number(),
  agent: z.string(),
  name: z.string(),
  type: z.enum([
    "trigger",
    "orchestration",
    "router",
    "retrieval",
    "llm",
    "tool",
  ]),
  duration: z.number(),
  status: z.enum(["success", "error"]),
  start: z.number(),
  errorMsg: z.string().optional(),
  toolExecution: z
    .object({
      input: z.record(z.any()),
      output: z.string().optional(),
      error: z.string().optional(),
      metadata: z
        .object({
          model: z.string().optional(),
          cost: z.number().optional(),
          retries: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export const OrchestrationContextSchema = z.object({
  routingDecision: z.string(),
  activeSubAgents: z.array(z.string()),
});

export const ModelConfigSchema = z.object({
  model: z.string(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  topP: z.number().optional(),
  frequencyPenalty: z.number().optional(),
  presencePenalty: z.number().optional(),
});

export const TraceExecutionContextSchema = z.object({
  systemPrompt: z.string(),
  promptVersion: z.string(),
  modelConfig: ModelConfigSchema,
  userInput: z.union([z.string(), z.record(z.any())]),
  enabledTools: z.array(z.string()),
  agentId: z.string(),
  timestamp: z.string(),
});

export const TraceDetailSchema = z.object({
  id: z.string(),
  steps: z.array(TraceStepSchema),
  orchestrationContext: OrchestrationContextSchema,
  selectedStepId: z.number().optional(),
  executionContext: TraceExecutionContextSchema.optional(),
});

// Knowledge Base Types
export const KnowledgeCollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  documentCount: z.number(),
  totalSize: z.string(),
  created: z.string(),
  updated: z.string(),
  tags: z.array(z.string()),
  category: z.string().optional(),
  mcpEndpoints: z.array(z.string()).optional(),
  tools: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        usage: z.string().optional(),
      })
    )
    .optional(),
  usageExample: z.string().optional(),
});

export const KnowledgeDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["pdf", "url", "txt", "md", "docx", "jpg", "png"]),
  status: z.enum(["Indexing", "Ready", "Error"]),
  size: z.string().optional(),
  updatedAt: z.string(),
  chunks: z.number(),
  tags: z.array(z.string()),
  collectionId: z.string(),
  mcpEndpoints: z.array(z.string()).optional(),
  tools: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        usage: z.string().optional(),
      })
    )
    .optional(),
});

export const RAGSettingsSchema = z.object({
  hybridSearch: z.boolean(),
  reranking: z.boolean(),
  chunkSize: z.string(),
  topK: z.string(),
});

export type KnowledgeCollection = z.infer<typeof KnowledgeCollectionSchema>;
export type KnowledgeDocument = z.infer<typeof KnowledgeDocumentSchema>;
export type RAGSettings = z.infer<typeof RAGSettingsSchema>;
