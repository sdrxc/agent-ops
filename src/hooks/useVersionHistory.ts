/**
 * Version History Hook
 * Manages agent configuration versioning with git-like version control
 */

import { useState } from "react";
import { Agent, ConfigVersion, AgentConfigSnapshot } from "@/types/api";
import { useGlobalContext } from "@/app/GlobalContextProvider";

export function useVersionHistory(agent: Agent | null) {
  const { user } = useGlobalContext();

  /**
   * Create a new version from a configuration snapshot
   */
  const createVersion = (
    description: string,
    snapshot: AgentConfigSnapshot,
    environment: "dev" | "staging" | "production" = "dev"
  ): ConfigVersion => {
    const now = new Date();
    const timestamp = now.toISOString();

    // Generate version ID
    const versionId = `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Auto-increment version number
    const currentVersions = agent?.configVersions || [];
    const latestVersion = currentVersions.length > 0
      ? currentVersions[currentVersions.length - 1].version
      : "v0.0.0";

    const nextVersion = incrementVersion(latestVersion);

    const newVersion: ConfigVersion = {
      id: versionId,
      version: nextVersion,
      timestamp,
      author: user?.userName || user?.userID || "Unknown User",
      description,
      snapshot,
      environment,
    };

    console.log("📦 Created version:", nextVersion, description);
    return newVersion;
  };

  /**
   * Restore configuration from a specific version
   */
  const restoreVersion = (versionId: string): AgentConfigSnapshot | null => {
    if (!agent?.configVersions) return null;

    const version = agent.configVersions.find(v => v.id === versionId);
    if (!version) {
      console.warn("Version not found:", versionId);
      return null;
    }

    console.log("♻️ Restoring version:", version.version, version.description);
    return version.snapshot;
  };

  /**
   * Get all versions for the agent, sorted by timestamp (newest first)
   */
  const getVersions = (): ConfigVersion[] => {
    if (!agent?.configVersions) return [];
    return [...agent.configVersions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  /**
   * Get the current/latest version
   */
  const getCurrentVersion = (): ConfigVersion | null => {
    if (!agent?.configVersions || agent.configVersions.length === 0) return null;

    if (agent.currentVersionId) {
      const current = agent.configVersions.find(v => v.id === agent.currentVersionId);
      if (current) return current;
    }

    // Fallback to latest version
    return getVersions()[0] || null;
  };

  /**
   * Compare two versions (basic diff)
   */
  const compareVersions = (
    versionId1: string,
    versionId2: string
  ): {
    version1: ConfigVersion | null;
    version2: ConfigVersion | null;
    differences: string[];
  } => {
    if (!agent?.configVersions) {
      return { version1: null, version2: null, differences: [] };
    }

    const v1 = agent.configVersions.find(v => v.id === versionId1);
    const v2 = agent.configVersions.find(v => v.id === versionId2);

    if (!v1 || !v2) {
      return {
        version1: v1 || null,
        version2: v2 || null,
        differences: ["One or both versions not found"],
      };
    }

    const differences: string[] = [];
    const snapshot1 = v1.snapshot;
    const snapshot2 = v2.snapshot;

    // Compare key fields
    if (snapshot1.name !== snapshot2.name) {
      differences.push(`Name: "${snapshot1.name}" → "${snapshot2.name}"`);
    }
    if (snapshot1.description !== snapshot2.description) {
      differences.push(`Description changed`);
    }
    if (snapshot1.systemPrompt !== snapshot2.systemPrompt) {
      differences.push(`System prompt modified`);
    }
    if (JSON.stringify(snapshot1.tags) !== JSON.stringify(snapshot2.tags)) {
      differences.push(`Tags updated`);
    }
    if (JSON.stringify(snapshot1.modelConfig) !== JSON.stringify(snapshot2.modelConfig)) {
      differences.push(`Model configuration changed`);
    }
    if (JSON.stringify(snapshot1.capabilities) !== JSON.stringify(snapshot2.capabilities)) {
      differences.push(`Capabilities modified`);
    }
    if (JSON.stringify(snapshot1.skills) !== JSON.stringify(snapshot2.skills)) {
      differences.push(`Skills updated`);
    }
    if (JSON.stringify(snapshot1.security) !== JSON.stringify(snapshot2.security)) {
      differences.push(`Security policies changed`);
    }

    return { version1: v1, version2: v2, differences };
  };

  /**
   * Get version count
   */
  const getVersionCount = (): number => {
    return agent?.configVersions?.length || 0;
  };

  return {
    createVersion,
    restoreVersion,
    getVersions,
    getCurrentVersion,
    compareVersions,
    getVersionCount,
  };
}

/**
 * Increment semantic version number
 * e.g., v1.2.3 → v1.2.4
 */
function incrementVersion(version: string): string {
  // Remove 'v' prefix if present
  const cleanVersion = version.startsWith("v") ? version.slice(1) : version;

  const parts = cleanVersion.split(".");
  if (parts.length !== 3) {
    // Default to v1.0.0 if format is invalid
    return "v1.0.0";
  }

  const [major, minor, patch] = parts.map(p => parseInt(p, 10) || 0);

  // Increment patch version
  return `v${major}.${minor}.${patch + 1}`;
}

/**
 * Format version timestamp for display
 */
export function formatVersionTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  // For older versions, show the date
  return date.toLocaleDateString();
}
