/**
 * Git URL Validation Utilities
 * 
 * Provides local validation for GitHub URLs and Bayer organization checks.
 * Designed for easy backend integration - replace mock functions with API calls.
 */

// ============================================================================
// Types
// ============================================================================

export type ValidationStatus = 
  | 'idle'
  | 'validating'
  | 'checking-access'
  | 'valid'
  | 'invalid'
  | 'not-bayer'
  | 'access-denied';

export interface ValidationState {
  status: ValidationStatus;
  message?: string;
  branches?: string[];
}

export interface RepoAccessResult {
  success: boolean;
  branches?: string[];
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

// Approved Bayer GitHub organizations
const BAYER_ORGS = [
  'bayer-int',
  'Bayer-Group',
] as const;

// Mock branches for frontend development (backend will provide real branches)
const MOCK_BRANCHES = ['dev', 'qa', 'prod'];

// ============================================================================
// Local Validation Functions (Instant, no API call)
// ============================================================================

/**
 * Validates if a string is a valid GitHub repository URL
 * Accepts formats:
 * - https://github.com/org/repo
 * - https://github.com/org/repo.git
 * - https://github.com/org/repo/tree/branch
 */
export function isValidGitHubUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  const trimmedUrl = url.trim();
  
  // Match GitHub repo URL patterns
  const githubPatterns = [
    // Standard repo URL: https://github.com/org/repo
    /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/,
    // With .git suffix: https://github.com/org/repo.git
    /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\.git$/,
    // With branch/tree: https://github.com/org/repo/tree/branch
    /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/tree\/[\w.-]+\/?$/,
    // With blob (file view): https://github.com/org/repo/blob/branch/path
    /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/blob\/[\w.-]+/,
  ];
  
  return githubPatterns.some(pattern => pattern.test(trimmedUrl));
}

/**
 * Checks if the GitHub URL belongs to an approved Bayer organization
 */
export function isBayerOrg(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  const trimmedUrl = url.trim().toLowerCase();
  
  // Extract org name from URL
  const match = trimmedUrl.match(/github\.com\/([\w.-]+)\//i);
  if (!match) return false;
  
  const orgName = match[1].toLowerCase();
  return BAYER_ORGS.some(bayerOrg => bayerOrg.toLowerCase() === orgName);
}

/**
 * Extracts repository information from a GitHub URL
 */
export function parseGitHubUrl(url: string): { org: string; repo: string; branch?: string } | null {
  if (!url) return null;
  
  const trimmedUrl = url.trim();
  
  // Try to match with branch
  const branchMatch = trimmedUrl.match(/github\.com\/([\w.-]+)\/([\w.-]+)\/tree\/([\w.-]+)/i);
  if (branchMatch) {
    return {
      org: branchMatch[1],
      repo: branchMatch[2].replace(/\.git$/, ''),
      branch: branchMatch[3],
    };
  }
  
  // Match without branch
  const repoMatch = trimmedUrl.match(/github\.com\/([\w.-]+)\/([\w.-]+)/i);
  if (repoMatch) {
    return {
      org: repoMatch[1],
      repo: repoMatch[2].replace(/\.git$/, '').replace(/\/$/, ''),
    };
  }
  
  return null;
}

// ============================================================================
// Validation Flow (Combines local + remote checks)
// ============================================================================

/**
 * Performs complete URL validation flow:
 * 1. Check if valid GitHub URL (local)
 * 2. Check if Bayer org (local)
 * 3. Check repo access (remote - mocked for now)
 * 
 * Returns validation state for UI feedback
 */
export async function validateRepositoryUrl(url: string): Promise<ValidationState> {
  // Step 1: Local validation - valid GitHub URL?
  if (!isValidGitHubUrl(url)) {
    return {
      status: 'invalid',
      message: 'Not a valid GitHub URL',
    };
  }
  
  // Step 2: Local validation - Bayer org?
  if (!isBayerOrg(url)) {
    return {
      status: 'not-bayer',
      message: 'Repository must be from a Bayer organization (bayer-int or Bayer-Group)',
    };
  }
  
  // Step 3: Remote check - can we access the repo?
  const accessResult = await checkRepoAccess(url);
  
  if (!accessResult.success) {
    return {
      status: 'access-denied',
      message: accessResult.error || 'Unable to access repository. Check permissions.',
    };
  }
  
  return {
    status: 'valid',
    branches: accessResult.branches,
  };
}

// ============================================================================
// API Placeholder Functions (For Backend Integration)
// ============================================================================

/**
 * Checks if the application has access to the repository.
 * 
 * MOCK IMPLEMENTATION - Replace with actual API call:
 * POST /api/git/check-access
 * Body: { repoUrl: string }
 * Response: { success: boolean, branches?: string[], error?: string }
 * 
 * Backend should:
 * 1. Use GitHub App credentials (Agentrix app installation)
 * 2. Verify repo exists and is accessible
 * 3. Fetch available branches
 */
export async function checkRepoAccess(url: string): Promise<RepoAccessResult> {
  // Simulate network delay for realistic UX testing
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Mock: Always succeed for valid Bayer URLs
  // In production, this would call the backend API
  const parsed = parseGitHubUrl(url);
  
  if (!parsed) {
    return {
      success: false,
      error: 'Could not parse repository URL',
    };
  }
  
  // Mock success response with branches
  return {
    success: true,
    branches: MOCK_BRANCHES,
  };
}

/**
 * Helper to get error message for display
 */
export function getValidationErrorMessage(state: ValidationState): string | null {
  switch (state.status) {
    case 'invalid':
      return state.message || 'Not a valid GitHub URL';
    case 'not-bayer':
      return state.message || 'Repository must be from a Bayer organization';
    case 'access-denied':
      return state.message || 'Unable to access repository';
    default:
      return null;
  }
}

/**
 * Helper to determine if validation is in a loading state
 */
export function isValidating(state: ValidationState): boolean {
  return state.status === 'validating' || state.status === 'checking-access';
}

/**
 * Helper to determine if validation passed
 */
export function isValid(state: ValidationState): boolean {
  return state.status === 'valid';
}

/**
 * Helper to determine if validation failed
 */
export function hasError(state: ValidationState): boolean {
  return ['invalid', 'not-bayer', 'access-denied'].includes(state.status);
}






