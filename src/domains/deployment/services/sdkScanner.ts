/**
 * SDK Scanner Service
 * 
 * Scans repositories for Agentrix SDK usage and extracts agent metadata.
 * Designed for easy backend integration - replace mock functions with API calls.
 * 
 * The scanner looks for:
 * - @trace_agent_call decorators
 * - Environment variable patterns (AGENT_NAME, AGENT_ID, PROJECT_ID)
 * - Function docstrings for skill descriptions
 */

// ============================================================================
// Types
// ============================================================================

export interface SkillDefinition {
  key: string;          // From @trace_agent_call name parameter
  description?: string; // From function docstring or generated
}

export interface DecoratorInfo {
  name: string;           // Decorator parameter: name
  functionName: string;   // Python function name
  filePath: string;       // File where found
  lineNumber?: number;    // Line number in file
  projectId?: string;     // Optional override
  agentId?: string;       // Optional override
  tags?: string[];        // Optional tags
}

export interface ScanResult {
  sdkDetected: boolean;
  agentName?: string;
  agentId?: string;
  projectId?: string;
  version?: string;
  endpoint?: string;
  skills: SkillDefinition[];
  capabilities: Record<string, boolean>;
  rawDecorators?: DecoratorInfo[];
  scanDuration?: number; // milliseconds
}

export type ScanStatus = 
  | 'idle'
  | 'scanning'
  | 'completed'
  | 'cancelled'
  | 'failed';

export interface ScanState {
  status: ScanStatus;
  progress?: number; // 0-100
  message?: string;
  result?: ScanResult;
  error?: string;
}

// ============================================================================
// Mock Data for Frontend Development
// ============================================================================

// Simulates different scan results based on repo/branch
const MOCK_SCAN_RESULTS: Record<string, ScanResult> = {
  // SDK detected scenario
  'sdk-detected': {
    sdkDetected: true,
    agentName: 'Customer Support Agent',
    agentId: 'support-agent-001',
    projectId: 'customer-support',
    version: '1.2.0',
    endpoint: 'https://api.bayer.com/agents/support/v1',
    skills: [
      { key: 'process_query', description: 'Processes incoming customer queries and routes them appropriately' },
      { key: 'handle_complaint', description: 'Handles customer complaints with empathy and resolution' },
      { key: 'check_order_status', description: 'Retrieves and reports order status information' },
      { key: 'escalate_to_human', description: 'Escalates complex issues to human support agents' },
    ],
    capabilities: {
      streaming: true,
      multiTurn: true,
      toolUse: true,
      pushNotifications: false,
    },
    rawDecorators: [
      { name: 'process_query', functionName: 'process_customer_query', filePath: 'src/handlers/queries.py', lineNumber: 45 },
      { name: 'handle_complaint', functionName: 'handle_customer_complaint', filePath: 'src/handlers/complaints.py', lineNumber: 12 },
      { name: 'check_order_status', functionName: 'get_order_status', filePath: 'src/handlers/orders.py', lineNumber: 78 },
      { name: 'escalate_to_human', functionName: 'escalate_issue', filePath: 'src/handlers/escalation.py', lineNumber: 23 },
    ],
  },
  
  // SDK not detected scenario
  'no-sdk': {
    sdkDetected: false,
    skills: [],
    capabilities: {},
  },
};

// ============================================================================
// Scanner Functions
// ============================================================================

/**
 * Scans a repository for Agentrix SDK usage.
 * 
 * MOCK IMPLEMENTATION - Replace with actual API call:
 * POST /api/git/scan
 * Body: { repoUrl: string, branch: string }
 * Response: ScanResult (with SSE for progress updates)
 * 
 * Backend should:
 * 1. Clone/fetch the repository at specified branch
 * 2. Parse Python files for @trace_agent_call decorators
 * 3. Extract environment variable defaults
 * 4. Parse docstrings for descriptions
 * 5. Return aggregated metadata
 * 
 * @param repoUrl - GitHub repository URL
 * @param branch - Branch to scan
 * @param signal - AbortSignal for cancellation support
 * @param onProgress - Optional callback for progress updates
 */
export async function scanRepository(
  repoUrl: string,
  branch: string,
  signal?: AbortSignal,
  onProgress?: (progress: number, message: string) => void
): Promise<ScanResult> {
  // Check if already cancelled
  if (signal?.aborted) {
    throw new DOMException('Scan cancelled', 'AbortError');
  }

  // Simulate scanning phases with progress updates
  const phases = [
    { progress: 10, message: 'Connecting to repository...', duration: 500 },
    { progress: 25, message: 'Fetching branch contents...', duration: 800 },
    { progress: 45, message: 'Scanning for Agentrix SDK...', duration: 1000 },
    { progress: 65, message: 'Extracting decorator metadata...', duration: 800 },
    { progress: 85, message: 'Parsing skill definitions...', duration: 600 },
    { progress: 95, message: 'Finalizing scan results...', duration: 400 },
  ];

  for (const phase of phases) {
    // Check for cancellation before each phase
    if (signal?.aborted) {
      throw new DOMException('Scan cancelled', 'AbortError');
    }

    onProgress?.(phase.progress, phase.message);
    await delay(phase.duration);
  }

  // Check for cancellation before returning result
  if (signal?.aborted) {
    throw new DOMException('Scan cancelled', 'AbortError');
  }

  onProgress?.(100, 'Scan complete');

  // Mock: Return SDK detected for most repos, no SDK for specific test cases
  // In production, this would be the actual scan result from the backend
  const mockKey = shouldMockNoSdk(repoUrl, branch) ? 'no-sdk' : 'sdk-detected';
  const result = { ...MOCK_SCAN_RESULTS[mockKey] };
  
  // Add scan duration
  result.scanDuration = phases.reduce((sum, p) => sum + p.duration, 0);

  return result;
}

/**
 * Creates an abort controller for scan cancellation
 */
export function createScanAbortController(): AbortController {
  return new AbortController();
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determines if mock should return "no SDK" result
 * Used for testing both scenarios in development
 */
function shouldMockNoSdk(repoUrl: string, branch: string): boolean {
  // Return no-sdk for specific test URLs or branches
  const noSdkPatterns = [
    /no-sdk/i,
    /legacy/i,
    /plain/i,
  ];
  
  return noSdkPatterns.some(pattern => 
    pattern.test(repoUrl) || pattern.test(branch)
  );
}

/**
 * Promise-based delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Converts scan result to pre-fill data for the form
 */
export function scanResultToFormData(result: ScanResult): Partial<{
  name: string;
  version: string;
  url: string;
  skills: SkillDefinition[];
  capabilities: Record<string, boolean>;
}> {
  if (!result.sdkDetected) {
    return {};
  }

  return {
    name: result.agentName,
    version: result.version,
    url: result.endpoint,
    skills: result.skills,
    capabilities: result.capabilities,
  };
}

/**
 * Generates a human-readable scan summary
 */
export function getScanSummary(result: ScanResult): string {
  if (!result.sdkDetected) {
    return 'Agentrix SDK was not detected in this repository. Please fill in the agent details manually.';
  }

  const skillCount = result.skills.length;
  const capCount = Object.keys(result.capabilities).length;
  
  return `Agentrix SDK detected! Found ${skillCount} skill${skillCount !== 1 ? 's' : ''} and ${capCount} capabilit${capCount !== 1 ? 'ies' : 'y'}. Fields have been pre-filled from your code.`;
}

/**
 * Checks if a scan result has usable data for pre-filling
 */
export function hasPrefillData(result: ScanResult): boolean {
  return result.sdkDetected && (
    !!result.agentName ||
    !!result.version ||
    !!result.endpoint ||
    result.skills.length > 0
  );
}






