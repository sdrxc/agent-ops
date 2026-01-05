/**
 * Simple in-memory database for local development
 * This allows mock data to persist across API calls during a session
 */

import { ApiKey } from "@/types/api";

interface Project {
  projectID: string;
  projectName: string;
  projectOwner: string;
  projectStatus: string;
  orgId: string;
  Category?: string;
  Tags?: string[];
  Description: string;
  Creation: string;
  CreateBy: string;
  LastUpdate: string;
  LastUpdateBy: string;
  IsArchived: boolean;
  IsMemory: boolean;
  MemeorySchema?: string;
  agentsCount: number;
}

// Initial mock projects
const initialProjects: Project[] = [
  {
    projectID: "prj-001",
    projectName: "MR Co-pilot Dev",
    projectOwner: "bayer-user-01",
    projectStatus: "active",
    orgId: "bayer-001",
    Category: "Machine Learning",
    Tags: ["AI", "Deep Learning", "NLP"],
    Description:
      "A research platform for experimenting with AI models and pipelines.",
    Creation: "2025-01-15T10:45:00Z",
    CreateBy: "bayer-user-01",
    LastUpdate: "2025-09-20T12:30:00Z",
    LastUpdateBy: "bayer-user-02",
    IsArchived: false,
    IsMemory: true,
    MemeorySchema: "fdfd-fgfdsgfgf-gfgfgfdg.rds",
    agentsCount: 1,
  },
  {
    projectID: "prj-0232",
    projectName: "Data Explorer",
    projectOwner: "bayer-user-01",
    projectStatus: "active",
    orgId: "bayer-001",
    Category: "Web Development",
    Tags: ["Next.js", "Supabase", "LLM"],
    Description:
      "A bookmark manager app with GPT-powered clustering and summarization.",
    Creation: "2025-02-01T09:20:00Z",
    CreateBy: "bayer-user-01",
    LastUpdate: "2025-09-21T15:10:00Z",
    LastUpdateBy: "bayer-user-01",
    IsArchived: false,
    IsMemory: true,
    MemeorySchema: "fdfd-fgfdsgfgf-gfgfgfdg.rds",
    agentsCount: 3,
  },
  {
    projectID: "prj-0575",
    projectName: "SAM Connect",
    projectOwner: "bayer-user-01",
    projectStatus: "completed",
    orgId: "bayer-001",
    Category: "Finance",
    Tags: ["Trading", "HFT", "Python"],
    Description:
      "A low-latency trading bot framework with real-time analytics.",
    Creation: "2025-03-10T11:15:00Z",
    CreateBy: "bayer-user-01",
    LastUpdate: "2025-09-22T18:40:00Z",
    LastUpdateBy: "bayer-user-03",
    IsArchived: false,
    IsMemory: true,
    MemeorySchema: "fdfd-fgfdsgfgf-gfgfgfdg.rds",
    agentsCount: 3,
  },
];

interface Agent {
  id: string;
  projectID: string;
  name: string;
  description: string;
  // MODIFIED: Replace status with environment
  environment?: "development" | "staging" | "production";
  // DEPRECATED: kept for backward compatibility
  status?: string;
  version: string;
  model: string | null;
  tags: string[];
  lastactivity: string;
  lastActivity: string;
  agentAPI: string;
  agentdeploymenttype: string;
  // NEW FIELDS
  agentURL?: {
    apiEndpoint: string;
    swaggerDocs?: string;
  };
  provider?: {
    name: string;
    githubURL?: string;
    organization?: string;
  };
  beatID?: string;
  visibility?: "public" | "private";
  sampleIO?: Array<{
    input: Record<string, any>;
    output: Record<string, any>;
    description?: string;
  }>;
  integrationExamples?: Array<{
    language: "python" | "javascript" | "typescript" | "curl" | "go";
    code: string;
    description?: string;
  }>;
}

// In-memory storage that persists across hot reloads in development
// Using globalThis to prevent reset on Next.js hot reload
const globalForMockDb = globalThis as unknown as {
  mockProjects: Project[];
  mockProjectCounter: number;
  mockAgents: Agent[];
  mockAgentCounter: number;
  mockApiKeys: ApiKey[];
  mockApiKeyCounter: number;
  mockDbInitialized: boolean;
};

// Initialize only once - use a flag to ensure we don't reset on module reload
if (!globalForMockDb.mockDbInitialized) {
  console.log(
    "🗄️ Initializing mock database with",
    initialProjects.length,
    "projects"
  );
  globalForMockDb.mockProjects = [...initialProjects];
  globalForMockDb.mockProjectCounter = 1000;
  globalForMockDb.mockApiKeys = [];
  globalForMockDb.mockApiKeyCounter = 1;

  // Initialize with some test agents
  globalForMockDb.mockAgents = [
    // Agents for prj-001 (MR Co-pilot Dev)
    {
      id: "agent-10050",
      projectID: "prj-001",
      name: "Medical Research Assistant",
      description:
        "AI-powered assistant for medical research literature analysis",
      environment: "production",
      version: "v1.2.0",
      model: "gpt-4",
      tags: ["medical", "research", "nlp"],
      lastactivity: new Date().toISOString(),
      lastActivity: "1 hour ago",
      agentAPI: "https://api.medresearch.bayer.com/v1/agent",
      agentdeploymenttype: "deployed",
      agentURL: {
        apiEndpoint: "https://api.medresearch.bayer.com/v1/agent",
        swaggerDocs: "https://api.medresearch.bayer.com/docs",
      },
      provider: {
        name: "Bayer AI Labs",
        githubURL: "https://github.com/bayer/medical-research-agent",
        organization: "Bayer AG",
      },
      beatID: "BYR-2024-001",
      visibility: "private",
      sampleIO: [
        {
          input: { query: "Recent clinical trials for diabetes treatment" },
          output: {
            results: [
              "Trial NCT12345: Phase III diabetes study",
              "Trial NCT67890: New insulin delivery method",
            ],
            count: 2,
          },
          description: "Example query for recent clinical trials",
        },
      ],
      integrationExamples: [
        {
          language: "python",
          code: `import requests

response = requests.post(
  "https://api.medresearch.bayer.com/v1/agent",
  json={"query": "diabetes trials"},
  headers={"Authorization": "Bearer YOUR_TOKEN"}
)
print(response.json())`,
          description: "Python example using requests library",
        },
        {
          language: "curl",
          code: `curl -X POST https://api.medresearch.bayer.com/v1/agent \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "diabetes trials"}'`,
          description: "cURL example for testing",
        },
      ],
    },
    // Agents for prj-0232 (Data Explorer)
    {
      id: "agent-10051",
      projectID: "prj-0232",
      name: "Content Summarizer",
      description: "Automatically summarizes bookmarked articles and web pages",
      environment: "staging",
      version: "v2.0.1",
      model: "gpt-4",
      tags: ["summarization", "content", "nlp"],
      lastactivity: new Date().toISOString(),
      lastActivity: "30 minutes ago",
      agentAPI: "https://api.bookmarks.example.com/summarize",
      agentdeploymenttype: "deployed",
      agentURL: {
        apiEndpoint: "https://api.bookmarks.example.com/summarize",
      },
      provider: {
        name: "Data Team",
        organization: "Bayer Digital",
      },
      visibility: "public",
    },
    {
      id: "agent-10056",
      projectID: "prj-0232",
      name: "Topic Clustering Agent",
      description: "Groups bookmarks by topic using semantic similarity",
      environment: "development",
      version: "v1.8.0",
      model: "claude-3-sonnet",
      tags: ["clustering", "ml", "categorization"],
      lastactivity: new Date().toISOString(),
      lastActivity: "45 minutes ago",
      agentAPI: "https://api.bookmarks.example.com/cluster",
      agentdeploymenttype: "deployed",
      visibility: "private",
    },
    {
      id: "agent-10057",
      projectID: "prj-0232",
      name: "Smart Search Agent",
      description: "Semantic search across bookmarks and content",
      // Test backward compatibility - only has status, no environment
      status: "testing",
      environment: "development",
      version: "v0.9.5-beta",
      model: "gpt-3.5-turbo",
      tags: ["search", "embeddings", "beta"],
      lastactivity: new Date().toISOString(),
      lastActivity: "2 hours ago",
      agentAPI: "",
      agentdeploymenttype: "registered",
      visibility: "private",
    },
    // Agents for prj-0575 (SAM Connect)
    {
      id: "agent-10052",
      projectID: "prj-0575",
      name: "Trading Analytics Agent",
      description: "Real-time market analysis and trading recommendations",
      environment: "production",
      version: "v2.1.0",
      model: "gpt-4",
      tags: ["trading", "analytics", "real-time"],
      lastactivity: new Date().toISOString(),
      lastActivity: "2 hours ago",
      agentAPI: "https://api.trading.bayer.com/v1",
      agentdeploymenttype: "deployed",
      agentURL: {
        apiEndpoint: "https://api.trading.bayer.com/v1",
        swaggerDocs: "https://api.trading.bayer.com/swagger",
      },
      provider: {
        name: "Finance Team",
        githubURL: "https://github.com/bayer/trading-agents",
        organization: "Bayer Finance",
      },
      beatID: "BYR-2024-075",
      visibility: "private",
      sampleIO: [
        {
          input: { symbol: "AAPL", action: "analyze" },
          output: { recommendation: "buy", confidence: 0.85, price: 175.5 },
          description: "Stock analysis example",
        },
      ],
      integrationExamples: [
        {
          language: "typescript",
          code: `const response = await fetch('https://api.trading.bayer.com/v1', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ symbol: 'AAPL', action: 'analyze' })
});
const data = await response.json();`,
          description: "TypeScript example using fetch API",
        },
      ],
    },
    {
      id: "agent-10053",
      projectID: "prj-0575",
      name: "Risk Assessment Agent",
      description: "Automated risk analysis and portfolio monitoring",
      environment: "staging",
      version: "v1.5.2",
      model: "claude-3-sonnet",
      tags: ["risk", "compliance", "monitoring"],
      lastactivity: new Date().toISOString(),
      lastActivity: "1 hour ago",
      agentAPI: "https://api.trading.example.com/risk",
      agentdeploymenttype: "deployed",
      visibility: "private",
    },
    {
      id: "agent-10054",
      projectID: "prj-0575",
      name: "Market Data Aggregator",
      description: "Collects and normalizes data from multiple exchanges",
      environment: "development",
      version: "v1.0.0-beta",
      model: "gpt-3.5-turbo",
      tags: ["data", "aggregation", "beta"],
      lastactivity: new Date().toISOString(),
      lastActivity: "30 minutes ago",
      agentAPI: "",
      agentdeploymenttype: "registered",
      visibility: "private",
    },
  ];
  globalForMockDb.mockAgentCounter = 10058;
  globalForMockDb.mockDbInitialized = true;
} else {
  console.log(
    "✅ Mock database already initialized with",
    globalForMockDb.mockProjects.length,
    "projects,",
    globalForMockDb.mockAgents.length,
    "agents, and",
    globalForMockDb.mockApiKeys.length,
    "API keys"
  );
}

export const mockDatabase = {
  // Get all projects for a user
  listProjects: (userID: string) => {
    return globalForMockDb.mockProjects.filter(
      (p) => p.CreateBy === userID || p.projectOwner === userID
    );
  },

  // Get all projects (for backwards compatibility)
  getAllProjects: () => {
    return globalForMockDb.mockProjects;
  },

  // Create a new project
  createProject: (data: {
    projectName: string;
    description: string;
    createdBy: string;
    tags?: string[];
    enableMemoryManagement: boolean;
  }) => {
    const projectID = `prj-${String(globalForMockDb.mockProjectCounter++).padStart(4, "0")}`;
    const now = new Date().toISOString();

    const newProject: Project = {
      projectID,
      projectName: data.projectName,
      projectOwner: data.createdBy,
      projectStatus: "active",
      orgId: "bayer-001",
      Tags: data.tags || [],
      Description: data.description,
      Creation: now,
      CreateBy: data.createdBy,
      LastUpdate: now,
      LastUpdateBy: data.createdBy,
      IsArchived: false,
      IsMemory: data.enableMemoryManagement,
      agentsCount: 0,
    };

    globalForMockDb.mockProjects.push(newProject);
    return newProject;
  },

  // Update a project
  updateProject: (
    projectID: string,
    data: {
      projectName?: string;
      description?: string;
      tags?: string[];
      enableMemoryManagement?: boolean;
    }
  ) => {
    const index = globalForMockDb.mockProjects.findIndex(
      (p) => p.projectID === projectID
    );
    if (index === -1) return null;

    const now = new Date().toISOString();
    const updatedProject = {
      ...globalForMockDb.mockProjects[index],
      ...(data.projectName && { projectName: data.projectName }),
      ...(data.description && { Description: data.description }),
      ...(data.tags && { Tags: data.tags }),
      ...(data.enableMemoryManagement !== undefined && {
        IsMemory: data.enableMemoryManagement,
      }),
      LastUpdate: now,
    };

    globalForMockDb.mockProjects[index] = updatedProject;
    return updatedProject;
  },

  // Delete a project
  deleteProject: (projectID: string) => {
    const index = globalForMockDb.mockProjects.findIndex(
      (p) => p.projectID === projectID
    );
    if (index === -1) return false;

    globalForMockDb.mockProjects.splice(index, 1);
    return true;
  },

  // Get a single project
  getProject: (projectID: string) => {
    return (
      globalForMockDb.mockProjects.find((p) => p.projectID === projectID) ||
      null
    );
  },

  // Reset to initial state (useful for testing)
  reset: () => {
    globalForMockDb.mockProjects = [...initialProjects];
    globalForMockDb.mockProjectCounter = 1000;
    globalForMockDb.mockAgents = [];
    globalForMockDb.mockAgentCounter = 10000;
    globalForMockDb.mockApiKeys = [];
    globalForMockDb.mockApiKeyCounter = 1;
  },

  // Get all agents for a project
  listProjectAgents: (projectID: string) => {
    return globalForMockDb.mockAgents.filter((a) => a.projectID === projectID);
  },

  // Register a new agent
  registerAgent: (data: {
    projectID: string;
    name: string;
    description: string;
    tags: string[];
  }) => {
    const agentID = `agent-${globalForMockDb.mockAgentCounter++}`;
    const now = new Date().toISOString();

    const newAgent: Agent = {
      id: agentID,
      projectID: data.projectID,
      name: data.name,
      description: data.description,
      environment: "development", // NEW: default for new agents
      version: "1.0.0",
      model: null,
      tags: data.tags,
      lastactivity: now,
      lastActivity: "just now",
      agentAPI: "",
      agentdeploymenttype: "registered",
      visibility: "private", // NEW: default for new agents
    };

    globalForMockDb.mockAgents.push(newAgent);

    // Update project's agentsCount
    const projectIndex = globalForMockDb.mockProjects.findIndex(
      (p) => p.projectID === data.projectID
    );
    if (projectIndex !== -1) {
      globalForMockDb.mockProjects[projectIndex].agentsCount++;
    }

    return newAgent;
  },

  // Update an existing agent
  updateAgent: (agentID: string, updates: Partial<Agent>) => {
    const index = globalForMockDb.mockAgents.findIndex((a) => a.id === agentID);
    if (index === -1) {
      console.error("Agent not found:", agentID);
      return null;
    }

    const updatedAgent = {
      ...globalForMockDb.mockAgents[index],
      ...updates,
      lastactivity: new Date().toISOString(),
      lastActivity: "just now",
    };

    globalForMockDb.mockAgents[index] = updatedAgent;

    console.log(
      "✅ Updated agent in mock DB:",
      updatedAgent.id,
      updatedAgent.name
    );

    return updatedAgent;
  },

  // Get all agents (across all projects)
  getAllAgents: () => {
    return globalForMockDb.mockAgents;
  },

  // Get a single agent by ID
  getAgent: (agentID: string) => {
    return globalForMockDb.mockAgents.find((a) => a.id === agentID) || null;
  },

  // Delete an agent
  deleteAgent: (agentID: string) => {
    const index = globalForMockDb.mockAgents.findIndex((a) => a.id === agentID);
    if (index === -1) {
      console.error("Agent not found:", agentID);
      return false;
    }

    const agent = globalForMockDb.mockAgents[index];
    globalForMockDb.mockAgents.splice(index, 1);

    // Update project's agentsCount
    const projectIndex = globalForMockDb.mockProjects.findIndex(
      (p) => p.projectID === agent.projectID
    );
    if (projectIndex !== -1) {
      globalForMockDb.mockProjects[projectIndex].agentsCount--;
    }

    console.log("🗑️ Deleted agent from mock DB:", agentID);
    return true;
  },

  // API Key Management
  createApiKey: (data: {
    name: string;
    userId: string;
    projectId: string;
  }): { apiKey: ApiKey; rawKey: string } => {
    const keyId = `key-${String(globalForMockDb.mockApiKeyCounter++).padStart(6, "0")}`;
    const now = new Date().toISOString();
    
    // Generate a secure random key (in production, use crypto.randomBytes)
    // Format: pk_live_{userId}_{random}
    const randomSuffix = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
    const rawKey = `pk_live_${data.userId.substring(0, 8)}_${randomSuffix}`;
    const prefix = `pk_live_${data.userId.substring(0, 8)}_${randomSuffix.substring(0, 8)}...`;
    
    // In production, hash the key. For mock, we'll store a simple hash representation
    const hash = `hashed_${rawKey}`; // Simplified for mock - in production use bcrypt or similar

    const newApiKey: ApiKey = {
      id: keyId,
      name: data.name,
      prefix,
      userId: data.userId,
      projectIds: [data.projectId],
      createdAt: now,
      hash,
    };

    globalForMockDb.mockApiKeys.push(newApiKey);
    console.log("✅ Created API key in mock DB:", keyId, data.name);
    
    return { apiKey: newApiKey, rawKey };
  },

  listApiKeys: (userId: string): ApiKey[] => {
    return globalForMockDb.mockApiKeys.filter((k) => k.userId === userId);
  },

  revokeApiKey: (keyId: string, userId: string): boolean => {
    const index = globalForMockDb.mockApiKeys.findIndex(
      (k) => k.id === keyId && k.userId === userId
    );
    if (index === -1) {
      console.error("API key not found or unauthorized:", keyId);
      return false;
    }

    globalForMockDb.mockApiKeys.splice(index, 1);
    console.log("🗑️ Revoked API key from mock DB:", keyId);
    return true;
  },
};
