export interface ProjectInfo {
  projectName: string;
  description: string;
  tags: string[];
  memoryManagement: string;
}

export interface Capability {
  [key: string]: string | boolean;
}

/**
 * Skill definition for agent capabilities
 * Maps to @trace_agent_call decorator usage in Agentrix SDK:
 * - key: The decorator's `name` parameter (e.g., "process_query")
 * - description: From function docstring or user-provided
 */
export interface Skill {
  key: string;          // Skill identifier from SDK decorator
  description?: string; // Human-readable description
}

export interface SecurityPolicy {
  policy_name: string;
  details?: string;
  enforced: boolean;
}

export interface AgentRegistry {
  name: string;
  description: string;
  version: string;
  protocol_version: string;
  url: string;
  preferred_transport: string;
  input_modes: string[];
  output_modes: string[];
  default_input_modes: string[];
  default_output_modes: string[];
  capabilities: Capability;
  skills: Skill[];
  security: SecurityPolicy[];
  supports_authenticated_extended_card: boolean;
  feedback_enabled: boolean;
  // Code Repository fields
  repoUrl?: string;
  branch?: string;
}

export interface Tool {
  toolID: string;
  toolName: string;
  description?: string;
  category?: string;
}

export interface ServerType {
  serverID: string;
  serverName: string;
}

export interface CodeUpload {
  repoUrl: string;
  branch: string;
  connected: boolean;
}

export interface SecretValues {
  key: string;
  value: string;
}

export interface AgentDeploymentState {
  currentStep: number;
  totalSteps: number;
  loading: boolean;
  errors: string[];
  projectInfo: ProjectInfo;
  agentRegistry: AgentRegistry;
  toolsRegistry: Tool[];
  selectedServerID?: string;
  configureServer: boolean | null;
  codeUpload: CodeUpload;
  serverConfig: Record<string, any>;
  secretsManager: SecretValues[];
}

export type AgentDeploymentAction =
  | { type: 'SET_PROJECT_INFO'; payload: Partial<ProjectInfo> }
  | { type: 'SET_AGENT_REGISTRY'; payload: Partial<AgentRegistry> }
  | { type: "SET_TOOLS_REGISTRY"; payload: Tool[] }
  | { type: "SET_SERVER_SELECTION"; payload: { serverID: string; configureServer: boolean } }
  | { type: 'SET_CODE_UPLOAD'; payload: Partial<CodeUpload> }
  | { type: 'SET_SECRETS_MANAGER'; payload: SecretValues[] }
  | { type: "SET_SERVER_REGISTRY"; payload: Record<string, any> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: string[] }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'RESET_ERRORS' };



